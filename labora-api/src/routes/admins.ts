import { Router } from 'express';
import mongoose from 'mongoose';
import Admin from '../models/Admin';
import { verifyPassword, hashPassword } from '../lib/auth-helpers';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const members = await Admin.find({}).lean() as any[];

    const scopeOrder: Record<string, number> = {
      SYSTEM: 1,
      LAB: 2,
      BRANCH: 3,
      TECH: 4
    };

    members.sort((a, b) => {
      const orderA = scopeOrder[a.scope] || 99;
      const orderB = scopeOrder[b.scope] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (a.name || '').localeCompare(b.name || '');
    });

    return res.json(members);
  } catch (error: any) {
    console.error('Erro ao buscar membros da equipe:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, username, email, phoneNumber, scope, assignedTo } = req.body;

  if (!name || !username || !email || !phoneNumber || !scope) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    const existing = await Admin.findOne({
      $or: [
        { username: username.trim() },
        { email: email.trim().toLowerCase() }
      ]
    });

    if (existing) {
      return res.status(400).json({ error: 'Nome de usuário ou e-mail já cadastrado.' });
    }

    let idUnique = false;
    let numericId = 0;
    while (!idUnique) {
      numericId = Math.floor(10000000 + Math.random() * 90000000);
      const idExists = await Admin.findOne({ id: numericId });
      if (!idExists) {
        idUnique = true;
      }
    }

    const assignedEntities = Array.isArray(assignedTo)
      ? assignedTo.map((id: string) => new mongoose.Types.ObjectId(id))
      : [];

    const newAdmin = new Admin({
      id: numericId,
      name: name.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      scope,
      assignedTo: assignedEntities,
      status: 'Pendente',
    });

    await newAdmin.save();

    const db = mongoose.connection.db;
    if (db) {
      if (scope === 'LAB') {
        const labsCollection = db.collection('labs');
        await labsCollection.updateMany(
          { _id: { $in: newAdmin.assignedTo } },
          { $addToSet: { admins: newAdmin._id } }
        );
      } else if (scope === 'BRANCH' || scope === 'TECH') {
        const branchesCollection = db.collection('branches');
        await branchesCollection.updateMany(
          { _id: { $in: newAdmin.assignedTo } },
          { $addToSet: { admins: newAdmin._id } }
        );
      }
    }

    return res.status(201).json({ success: true, admin: newAdmin });
  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar membro: ' + error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { currentStatus } = req.body;

  try {
    const adminDoc = await Admin.findById(id);
    if (!adminDoc) {
      return res.status(404).json({ error: 'Membro da equipe não encontrado.' });
    }

    const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
    adminDoc.status = newStatus;
    await adminDoc.save();

    return res.json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error('Erro ao alterar status de membro da equipe:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
    const { name, username, email, phoneNumber, password, oldPassword } = req.body;

  try {
    const adminDoc = await Admin.findById(id);
    if (!adminDoc) {
      return res.status(404).json({ error: 'Membro da equipe não encontrado.' });
    }

    if (name) adminDoc.name = name;
    if (username) adminDoc.username = username;
    if (email) adminDoc.email = email;
    if (phoneNumber) adminDoc.phoneNumber = phoneNumber;
    
    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ error: 'A senha antiga é obrigatória para alterar a senha.' });
      }
      if (adminDoc.password) {
        const isMatch = verifyPassword(oldPassword, adminDoc.password);
        if (!isMatch) {
          return res.status(400).json({ error: 'A senha antiga está incorreta.' });
        }
      }
      adminDoc.password = hashPassword(password);
    }

    await adminDoc.save();

    return res.json({ success: true, admin: adminDoc });
  } catch (error: any) {
    console.error('Erro ao atualizar membro da equipe:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
