import { Router } from 'express';
import mongoose from 'mongoose';
import Branch from '../models/Branch';
import Laboratory from '../models/Laboratory';

const router = Router();

router.get('/', async (req, res) => {
  try {
    void Laboratory;

    const { laboratoryId, status, q, city, state, limit, skip } = req.query;
    const filter: Record<string, any> = {};

    if (laboratoryId) {
      if (!mongoose.Types.ObjectId.isValid(laboratoryId as string)) {
        return res.status(400).json({ error: "laboratoryId inválido" });
      }
      filter.laboratoryId = new mongoose.Types.ObjectId(laboratoryId as string);
    }

    if (status) filter.status = status;

    if (q) {
      const re = new RegExp((q as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.name = re;
    }

    if (city) filter["address.city"] = new RegExp(`^${city}$`, "i");
    if (state) filter["address.state"] = (state as string).toUpperCase();

    const limitVal = Math.min(Number(limit ?? 50) || 50, 200);
    const skipVal = Math.max(Number(skip ?? 0) || 0, 0);

    const [items, total] = await Promise.all([
      Branch.find(filter)
        .populate("laboratoryId", "name labName")
        .sort({ name: 1 })
        .skip(skipVal)
        .limit(limitVal)
        .lean(),
      Branch.countDocuments(filter),
    ]);

    const data = items.map((b: any) => {
      const lab = b.laboratoryId;
      return {
        _id: String(b._id),
        id: String(b._id),
        name: b.name,
        email: b.email ?? null,
        phoneNumber: b.phoneNumber ?? null,
        openingHours: b.openingHours ?? null,
        status: b.status ?? "Ativa",
        address: b.address ?? null,
        laboratory:
          lab && typeof lab === "object"
            ? {
              id: String(lab._id),
              name: lab.name ?? lab.labName ?? "Laboratório Sem Nome",
            }
            : lab
              ? { id: String(lab), name: null }
              : null,
        createdAt: b.createdAt ?? null,
        updatedAt: b.updatedAt ?? null,
      };
    });

    return res.json({ total, count: data.length, skip: skipVal, limit: limitVal, data });
  } catch (error: any) {
    console.error("[GET /api/filiais]", error);
    return res.status(500).json({ error: error.message });
  }
});

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.get('/by-area', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const limitVal = Number(req.query.limit || 5);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: "Parâmetros lat e lon são obrigatórios e devem ser numéricos." });
    }

    const branches = await Branch.find({ status: 'Ativa' })
      .populate("laboratoryId", "name labName")
      .lean() as any[];

    const mapped = branches.map((b: any) => {
      const bLat = b.address?.latitude || 0;
      const bLon = b.address?.longitude || 0;
      const distance = getDistance(lat, lon, bLat, bLon);
      const lab = b.laboratoryId;

      return {
        _id: String(b._id),
        id: String(b._id),
        name: b.name,
        email: b.email ?? null,
        phoneNumber: b.phoneNumber ?? null,
        openingHours: b.openingHours ?? null,
        status: b.status ?? "Ativa",
        address: b.address ?? null,
        distanceKm: Math.round(distance * 100.0) / 100.0,
        laboratory: lab && typeof lab === "object"
          ? {
              id: String(lab._id),
              name: lab.name ?? lab.labName ?? "Laboratório Sem Nome",
            }
          : null,
        createdAt: b.createdAt ?? null,
        updatedAt: b.updatedAt ?? null,
      };
    });

    mapped.sort((a, b) => a.distanceKm - b.distanceKm);
    const sliced = mapped.slice(0, limitVal);

    return res.json({
      total: mapped.length,
      count: sliced.length,
      skip: 0,
      limit: limitVal,
      data: sliced
    });
  } catch (error: any) {
    console.error("[GET /api/filiais/by-area]", error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const branch = await Branch.findById(id).lean() as any;
    if (!branch) {
      return res.status(404).json({ error: 'Filial não encontrada' });
    }
    return res.json({
      ...branch,
      _id: String(branch._id)
    });
  } catch (error: any) {
    console.error('Erro ao buscar filial:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, laboratoryId, phoneNumber, email, openingHours, address } = req.body;

  try {
    const newBranch = new Branch({
      name,
      laboratoryId: new mongoose.Types.ObjectId(laboratoryId),
      phoneNumber,
      email,
      openingHours,
      address,
      status: 'Ativa'
    });
    await newBranch.save();
    return res.status(201).json({ success: true, branch: newBranch });
  } catch (error: any) {
    console.error('Erro ao criar filial:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, laboratoryId, phoneNumber, email, openingHours, address } = req.body;

  try {
    const data = {
      name,
      laboratoryId: new mongoose.Types.ObjectId(laboratoryId),
      phoneNumber,
      email,
      openingHours,
      address
    };
    const updated = await Branch.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Filial não encontrada' });
    }
    return res.json({ success: true, branch: updated });
  } catch (error: any) {
    console.error('Erro ao atualizar filial:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;

  try {
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ error: 'Filial não encontrada' });
    }

    const currentStatus = branch.status || 'Ativa';
    const newStatus = currentStatus === 'Ativa' ? 'Inativa' : 'Ativa';

    await Branch.findByIdAndUpdate(id, { status: newStatus });
    return res.json({ success: true, status: newStatus, name: branch.name });
  } catch (error: any) {
    console.error('Erro ao alternar status da filial:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
