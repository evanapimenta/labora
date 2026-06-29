import { Router } from 'express';
import User from '../models/User';
import Admin from '../models/Admin';

const router = Router();

// GET /api/users - list users (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(0, Number(req.query.page || 0));
    const size = Math.max(1, Number(req.query.size || 20));
    const limit = size;
    const skip = page * size;
    const q = req.query.q as string;

    const filter: any = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).lean(),
      User.countDocuments(filter)
    ]);

    // Fetch corresponding CPFs from Patient model
    const userIds = items.map(u => u.id || String(u._id));
    const mongoose = require('mongoose');
    const Patient = mongoose.models.Patient || mongoose.model('Patient');
    const patients = await Patient.find({ id: { $in: userIds } }).select('id cpf').lean() as any[];
    const cpfMap = new Map(patients.map(p => [p.id, p.cpf]));

    const content = items.map((u: any) => ({
      ...u,
      _id: String(u._id),
      id: u.id || String(u._id),
      cpf: cpfMap.get(u.id || String(u._id)) || null
    }));

    return res.json({
      content,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size,
      number: page
    });
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/users/verify-account - verify account with code
router.get('/verify-account', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Código de verificação não fornecido.' });
  }

  try {
    const user = await User.findOne({ token: code });
    if (!user) {
      return res.status(404).json({ error: 'Link de verificação inválido ou expirado!' });
    }

    if (user.tokenExpiresIn && new Date(user.tokenExpiresIn) < new Date()) {
      return res.status(400).json({ error: 'Link de verificação expirado!' });
    }

    user.verified = true;
    user.active = true;
    user.token = null;
    user.tokenExpiresIn = null;
    await user.save();

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Erro ao verificar conta:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - get user by ID (uuid or email/username)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check in users collection (for patients)
    let user = await User.findOne({ $or: [{ id }, { email: id.toLowerCase() }] }).lean() as any;

    if (!user) {
      // Check in admins collection
      const admin = await Admin.findOne({ $or: [{ id: isNaN(Number(id)) ? undefined : Number(id) }, { email: id.toLowerCase() }, { username: id }] }).lean() as any;
      if (admin) {
        user = {
          id: admin.id ? String(admin.id) : String(admin._id),
          name: admin.name,
          email: admin.email,
          password: admin.password,
          active: admin.status === 'Ativo',
          role: admin.scope, // SYSTEM, LAB, BRANCH
          verified: admin.status === 'Ativo',
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt
        };
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json({
      ...user,
      _id: String(user._id || user.id),
      id: user.id
    });
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/users - create user
router.post('/', async (req, res) => {
  const { id, name, email, password, active, role, verified, token, tokenExpiresIn, settings } = req.body;
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'E-mail de usuário já cadastrado.' });
    }

    const newUser = new User({
      id: id || require('crypto').randomUUID(),
      name,
      email: email.toLowerCase(),
      password, // already hashed by Spring Boot
      active: active || false,
      role: role || 'PATIENT',
      verified: verified || false,
      token: token || null,
      tokenExpiresIn: tokenExpiresIn ? new Date(tokenExpiresIn) : null,
      settings: settings || {}
    });

    await newUser.save();
    return res.status(201).json(newUser);
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - update user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, active, lastLoginAt } = req.body;
  try {
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (role !== undefined) user.role = role;
    if (active !== undefined) user.active = active;
    if (lastLoginAt !== undefined) user.lastLoginAt = lastLoginAt ? new Date(lastLoginAt) : null;

    await user.save();
    return res.json(user);
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/change-password - change password
router.put('/:id/change-password', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    user.password = password; // already hashed by Spring Boot
    await user.save();
    return res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/upload-image - update image
router.put('/:id/upload-image', async (req, res) => {
  const { id } = req.params;
  const { imagePathUrl } = req.body;
  try {
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    user.imagePathUrl = imagePathUrl;
    await user.save();
    return res.json({ imagePathUrl });
  } catch (error: any) {
    console.error('Erro ao enviar imagem do perfil:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/settings - update settings
router.put('/:id/settings', async (req, res) => {
  const { id } = req.params;
  const { settings } = req.body;
  try {
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    user.settings = settings;
    await user.save();
    return res.json(user);
  } catch (error: any) {
    console.error('Erro ao atualizar configurações:', error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id - delete user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await User.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    return res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
