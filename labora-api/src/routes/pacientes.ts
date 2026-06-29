import { Router } from 'express';
import Patient from '../models/Patient';

const router = Router();

// GET /api/pacientes - list all patients (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(0, Number(req.query.page || 0));
    const size = Math.max(1, Number(req.query.size || 20));
    const limit = size;
    const skip = page * size;

    const [items, total] = await Promise.all([
      Patient.find().skip(skip).limit(limit).lean(),
      Patient.countDocuments()
    ]);

    const content = items.map((p: any) => ({
      ...p,
      _id: String(p._id),
      id: p.id
    }));

    return res.json({
      content,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size,
      number: page
    });
  } catch (error: any) {
    console.error('Erro ao listar pacientes:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/pacientes/:id - get patient by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await Patient.findOne({ id }).lean() as any;
    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }
    return res.json({
      ...patient,
      _id: String(patient._id),
      id: patient.id
    });
  } catch (error: any) {
    console.error('Erro ao buscar paciente:', error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/pacientes - create patient profile
router.post('/', async (req, res) => {
  const { id, birthDate, cpf, phoneNumber, gender, weight, height, address, emergencyContactName, emergencyContactNumber } = req.body;
  try {
    const existing = await Patient.findOne({ cpf });
    if (existing) {
      return res.status(400).json({ error: 'Paciente com este CPF já cadastrado.' });
    }

    const newPatient = new Patient({
      id,
      birthDate,
      cpf,
      phoneNumber,
      gender,
      weight,
      height,
      address,
      emergencyContactName,
      emergencyContactNumber
    });

    await newPatient.save();
    return res.status(201).json(newPatient);
  } catch (error: any) {
    console.error('Erro ao criar paciente:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/pacientes/:id - update patient profile
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { birthDate, cpf, phoneNumber, gender, weight, height, address, emergencyContactName, emergencyContactNumber } = req.body;
  try {
    const patient = await Patient.findOne({ id });
    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    if (birthDate !== undefined) patient.birthDate = birthDate;
    if (cpf !== undefined) patient.cpf = cpf;
    if (phoneNumber !== undefined) patient.phoneNumber = phoneNumber;
    if (gender !== undefined) patient.gender = gender;
    if (weight !== undefined) patient.weight = weight;
    if (height !== undefined) patient.height = height;
    if (address !== undefined) patient.address = address;
    if (emergencyContactName !== undefined) patient.emergencyContactName = emergencyContactName;
    if (emergencyContactNumber !== undefined) patient.emergencyContactNumber = emergencyContactNumber;

    await patient.save();
    return res.json(patient);
  } catch (error: any) {
    console.error('Erro ao atualizar paciente:', error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/pacientes/:id - delete patient profile
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Patient.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }
    return res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar paciente:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
