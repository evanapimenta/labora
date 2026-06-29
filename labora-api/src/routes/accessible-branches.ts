import { Router } from 'express';
import Admin from '../models/Admin';
import mongoose from 'mongoose';

const router = Router();

router.post('/', async (req, res) => {
  const { user, activeLabId, activeBranchId } = req.body;

  if (!user) {
    return res.json({ user: null, userLabs: [], userBranches: [], activeBranch: null, activeLab: null });
  }

  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ error: 'Conexão com o banco não inicializada' });
    }

    const labsCollection = db.collection('labs');
    const branchesCollection = db.collection('branches');

    let userLabs: any[] = [];
    if (user.scope === 'SYSTEM') {
      const allLabs = await labsCollection.find({}, { projection: { _id: 1, labName: 1 } }).toArray();
      userLabs = allLabs.map(lab => ({
        _id: lab._id.toString(),
        labName: lab.labName
      }));
    } else {
      const adminDoc = await Admin.findById(user.userId).lean() as any;
      if (adminDoc && adminDoc.assignedTo && adminDoc.assignedTo.length > 0) {
        const assignedLabs = await labsCollection.find(
          { _id: { $in: adminDoc.assignedTo } },
          { projection: { _id: 1, labName: 1 } }
        ).toArray();
        userLabs = assignedLabs.map(lab => ({
          _id: lab._id.toString(),
          labName: lab.labName
        }));
      }
    }

    let activeLab: any = null;
    if (activeLabId) {
      activeLab = userLabs.find(l => l._id === activeLabId) || null;
    }
    if (!activeLab && userLabs.length > 0) {
      activeLab = userLabs[0];
    }

    let branchQuery: any = {};
    if (user.scope === 'SYSTEM') {
      if (activeLab) {
        branchQuery = { laboratoryId: new mongoose.Types.ObjectId(activeLab._id) };
      } else {
        branchQuery = {};
      }
    } else if (user.scope === 'LAB') {
      const adminDoc = await Admin.findById(user.userId).lean() as any;
      if (adminDoc && adminDoc.assignedTo && adminDoc.assignedTo.length > 0) {
        const assignedLabIds = adminDoc.assignedTo.map((id: any) => new mongoose.Types.ObjectId(id));
        if (activeLab) {
          branchQuery = { laboratoryId: new mongoose.Types.ObjectId(activeLab._id) };
        } else {
          branchQuery = { laboratoryId: { $in: assignedLabIds } };
        }
      } else {
        branchQuery = { _id: { $in: [] } };
      }
    } else if (user.scope === 'BRANCH' || user.scope === 'TECH') {
      const adminDoc = await Admin.findById(user.userId).lean() as any;
      if (adminDoc && adminDoc.assignedTo && adminDoc.assignedTo.length > 0) {
        const assignedBranchIds = adminDoc.assignedTo.map((id: any) => new mongoose.Types.ObjectId(id));
        branchQuery = { _id: { $in: assignedBranchIds } };
      } else {
        branchQuery = { _id: { $in: [] } };
      }
    } else {
      branchQuery = { _id: { $in: [] } };
    }

    const foundBranches = await branchesCollection.find(branchQuery, { projection: { _id: 1, name: 1, laboratoryId: 1 } }).toArray();
    const userBranches = foundBranches.map(branch => ({
      _id: branch._id.toString(),
      name: branch.name,
      laboratoryId: branch.laboratoryId?.toString()
    }));

    let activeBranch: any = null;
    if (activeBranchId) {
      activeBranch = userBranches.find(b => b._id === activeBranchId) || null;
    }
    if (!activeBranch && userBranches.length > 0) {
      activeBranch = userBranches[0];
    }

    return res.json({
      user,
      userLabs,
      userBranches,
      activeBranch,
      activeLab
    });
  } catch (error: any) {
    console.error('Erro ao resolver filiais acessíveis:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
