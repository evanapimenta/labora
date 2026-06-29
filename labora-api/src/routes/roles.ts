import { Router } from 'express';
import User from '../models/User';
import Laboratory from '../models/Laboratory';
import Branch from '../models/Branch';

const router = Router();

// GET /api/roles - list all user roles (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(0, Number(req.query.page || 0));
    const size = Math.max(1, Number(req.query.size || 20));
    const limit = size;
    const skip = page * size;

    const [items, total] = await Promise.all([
      User.find().skip(skip).limit(limit).lean(),
      User.countDocuments()
    ]);

    const content = items.map((u: any) => ({
      id: u.id || String(u._id),
      name: u.name,
      email: u.email,
      role: u.role
    }));

    return res.json({
      content,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size,
      number: page
    });
  } catch (error: any) {
    console.error('Erro ao listar roles:', error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/roles/super-admin - assign super admin role
router.post('/super-admin', async (req, res) => {
  const userId = (req.query.userId || req.body.userId) as string;
  const labId = (req.query.labId || req.body.labId) as string;

  if (!userId || !labId) {
    return res.status(400).json({ error: 'userId e labId são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const lab = await Laboratory.findById(labId);
    if (!lab) {
      return res.status(404).json({ error: 'Laboratório não encontrado.' });
    }

    // Demote previous superAdmin if exists
    if (lab.superAdmin) {
      const prevUser = await User.findOne({ id: lab.superAdmin });
      if (prevUser) {
        prevUser.role = 'PATIENT';
        await prevUser.save();
      }
    }

    // Promote new user
    user.role = 'LAB';
    await user.save();

    lab.superAdmin = user.id;
    await lab.save();

    return res.status(200).send();
  } catch (error: any) {
    console.error('Erro ao atribuir super admin:', error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/roles/admin - assign admin role
router.post('/admin', async (req, res) => {
  const userId = (req.query.userId || req.body.userId) as string;
  const branchId = (req.query.branchId || req.body.branchId) as string;

  if (!userId || !branchId) {
    return res.status(400).json({ error: 'userId e branchId são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ error: 'Filial não encontrada.' });
    }

    // Demote previous admin if exists
    if (branch.admin) {
      const prevUser = await User.findOne({ id: branch.admin });
      if (prevUser) {
        prevUser.role = 'PATIENT';
        await prevUser.save();
      }
    }

    // Promote new user
    user.role = 'BRANCH';
    await user.save();

    branch.admin = user.id;
    await branch.save();

    return res.status(200).send();
  } catch (error: any) {
    console.error('Erro ao atribuir admin:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
