import { Router } from 'express';
import Laboratory from '../models/Laboratory';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status, cnpj, q, city, state, limit, skip } = req.query;

    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (cnpj) filter.cnpj = cnpj;
    if (q) {
      const re = new RegExp((q as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: re }, { labName: re }];
    }
    if (city) filter["address.city"] = new RegExp(`^${city}$`, "i");
    if (state) filter["address.state"] = (state as string).toUpperCase();

    const limitVal = Math.min(Number(limit ?? 50) || 50, 200);
    const skipVal = Math.max(Number(skip ?? 0) || 0, 0);

    const [items, total] = await Promise.all([
      Laboratory.find(filter)
        .sort({ name: 1, labName: 1 })
        .skip(skipVal)
        .limit(limitVal)
        .lean(),
      Laboratory.countDocuments(filter),
    ]);

    const data = items.map((l: any) => ({
      _id: String(l._id),
      id: String(l._id),
      name: l.name ?? l.labName ?? "Laboratório Sem Nome",
      labName: l.labName ?? l.name ?? "Laboratório Sem Nome",
      cnpj: l.cnpj ?? null,
      email: l.email ?? null,
      phoneNumber: l.phoneNumber ?? null,
      status: l.status ?? "Ativo",
      address: l.address ?? null,
      createdAt: l.createdAt ?? null,
      updatedAt: l.updatedAt ?? null,
    }));

    return res.json({ total, count: data.length, skip: skipVal, limit: limitVal, data });
  } catch (error: any) {
    console.error("[GET /api/laboratorios]", error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rawLab = await Laboratory.findById(id).lean() as any;
    if (!rawLab) {
      return res.status(404).json({ error: 'Laboratório não encontrado' });
    }
    const lab = {
      ...rawLab,
      _id: String(rawLab._id),
      name: rawLab.name || rawLab.labName || "Laboratório Sem Nome",
      labName: rawLab.labName || rawLab.name || "Laboratório Sem Nome"
    };
    return res.json(lab);
  } catch (error: any) {
    console.error('Erro ao buscar laboratório por ID:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, cnpj, phoneNumber, email, address } = req.body;

  try {
    const newLab = new Laboratory({
      name,
      labName: name,
      cnpj,
      phoneNumber,
      email,
      address,
      status: 'Ativo'
    });
    await newLab.save();
    return res.status(201).json({ success: true, laboratory: newLab });
  } catch (error: any) {
    console.error('Erro ao criar laboratório:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, cnpj, phoneNumber, email, address } = req.body;

  try {
    const data = {
      name,
      labName: name,
      cnpj,
      phoneNumber,
      email,
      address
    };
    const updated = await Laboratory.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Laboratório não encontrado' });
    }
    return res.json({ success: true, laboratory: updated });
  } catch (error: any) {
    console.error('Erro ao atualizar laboratório:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;

  try {
    const lab = await Laboratory.findById(id);
    if (!lab) {
      return res.status(404).json({ error: 'Laboratório não encontrado' });
    }

    const currentStatus = lab.status || 'Ativo';
    const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';

    await Laboratory.findByIdAndUpdate(id, { status: newStatus });
    return res.json({ success: true, status: newStatus, name: lab.name || lab.labName });
  } catch (error: any) {
    console.error('Erro ao alternar status do laboratório:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
