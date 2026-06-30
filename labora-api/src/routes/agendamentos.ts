import { Router } from 'express';
import mongoose from 'mongoose';
import Appointment, { AppointmentStatus } from '../models/Appointment';
import Exam from '../models/Exam';
import Admin from '../models/Admin';
import Branch from '../models/Branch';
import ExamResult from '../models/ExamResult';
import User from '../models/User';
import { logAction, AuditUser } from '../lib/audit-helper';

const router = Router();

function getAuditUser(req: any): AuditUser | undefined {
  const id = req.headers['x-user-numeric-id'] ? Number(req.headers['x-user-numeric-id']) : undefined;
  const name = req.headers['x-user-name'] as string;
  const email = req.headers['x-user-email'] as string;
  const role = req.headers['x-user-role'] as string;

  if (id !== undefined && name && email && role) {
    return { id, name, email, role };
  }
  return undefined;
}

function getClientIp(req: any): string {
  return (req.headers['x-user-ip'] as string) || req.ip || '127.0.0.1';
}

function resolvePreparation(exam: any): string | null {
  if (!exam) return null;
  if (exam.preparationInstructions) return exam.preparationInstructions;
  const ig = exam.informacoes_gerais;
  if (!ig) return null;
  const parts: string[] = [];
  if (ig.jejum) parts.push(`• Jejum: ${ig.jejum}`);
  if (ig.restricoes_e_preparo) {
    if (Array.isArray(ig.restricoes_e_preparo)) {
      parts.push(...ig.restricoes_e_preparo.map((item: string) => `• ${item.trim()}`));
    } else if (typeof ig.restricoes_e_preparo === 'string') {
      parts.push(`• ${ig.restricoes_e_preparo.trim()}`);
    }
  }
  return parts.length > 0 ? parts.join('\n') : null;
}


router.get('/', async (req, res) => {
  try {
    void Exam;
    void Admin;
    void Branch;

    const { branchId, status, date, dateFrom, dateTo, cpf, q, limit, skip, operatorId } = req.query;
    const filter: Record<string, any> = {};

    if (branchId) {
      const ids = (branchId as string).split(",").map((s) => s.trim()).filter(Boolean);
      const valid = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (valid.length > 0) {
        filter.branchId =
          valid.length === 1
            ? new mongoose.Types.ObjectId(valid[0])
            : { $in: valid.map((id) => new mongoose.Types.ObjectId(id)) };
      }
    }

    if (status) filter.status = status;

    if (date) {
      if ((date as string).includes(':')) {
        const [start, end] = (date as string).split(':');
        filter.date = { $gte: start, $lte: end };
      } else {
        filter.date = date;
      }
    } else if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo) filter.date.$lte = dateTo;
    }

    if (cpf) filter.cpf = cpf;

    if (q) {
      const re = new RegExp((q as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const matchingUsers = await User.find({ name: re }).select('id').lean();
      const userIds = matchingUsers.map((u: any) => u.id);
      
      filter.$or = [
        { patient: { $in: userIds } },
        { cpf: re }
      ];
    }

    if (operatorId) {
      if (mongoose.Types.ObjectId.isValid(operatorId as string)) {
        filter.operator = new mongoose.Types.ObjectId(operatorId as string);
      }
    }

    const limitVal = Math.min(Number(limit ?? 50) || 50, 5000);
    const skipVal = Math.max(Number(skip ?? 0) || 0, 0);

    const [items, total] = await Promise.all([
      Appointment.find(filter)
        .populate("branchId", "name address")
        .populate("exam")
        .populate("operator", "name scope")
        .sort({ date: -1, time: 1 })
        .skip(skipVal)
        .limit(limitVal)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    const patientIds = [...new Set(items.map(a => a.patient))];
    const users = await User.find({ id: { $in: patientIds } }).select('id name').lean();
    const userMap = new Map(users.map((u: any) => [u.id, u.name]));

    const itemsIds = items.map(a => a._id);
    const examResults = await ExamResult.find({ appointmentId: { $in: itemsIds } }).lean();
    const resultMap = new Map(examResults.map((r: any) => [String(r.appointmentId), r.fileUrl]));

    const data = items.map((a: any) => ({
      _id: String(a._id),
      id: String(a._id),
      patient: userMap.get(a.patient) || a.patient,
      patientId: a.patient,
      cpf: a.cpf,
      date: a.date,
      time: a.time,
      status: a.status,
      branch: a.branchId
        ? {
          id: String(a.branchId._id ?? a.branchId),
          name: a.branchId.name ?? null,
          address: a.branchId.address ?? null,
        }
        : null,
      exam: a.exam
        ? {
          id: String(a.exam._id ?? a.exam),
          name: a.exam.name ?? a.exam.nome_exame ?? "Exame Indefinido",
          code: a.exam.code ?? null,
          category: a.exam.category ?? a.exam.categoria ?? null,
          price: a.exam.price ?? null,
          preparationInstructions: resolvePreparation(a.exam),
        }
        : null,
      operator: a.operator
        ? {
          id: String(a.operator._id ?? a.operator),
          name: a.operator.name ?? null,
          scope: a.operator.scope ?? null,
        }
        : null,
      resultUrl: resultMap.get(String(a._id)) ?? null,
      createdAt: a.createdAt ?? null,
      updatedAt: a.updatedAt ?? null,
    }));

    return res.json({ total, count: data.length, skip: skipVal, limit: limitVal, data });
  } catch (error: any) {
    console.error("[GET /api/agendamentos]", error);
    return res.status(500).json({ error: error.message });
  }
});

const ALLOWED_STATUSES = [
  "Confirmado",
  "Check-in",
  "Aguardando Resultado",
  "Concluído",
  "Realizado",
  "Cancelado",
  "Pendente",
] as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

router.post('/', async (req, res) => {
  const { patient, cpf, date, time, examId, branchId, operatorId, status } = req.body;

  const missing = [
    ["patient", patient],
    ["cpf", cpf],
    ["date", date],
    ["time", time],
    ["examId", examId],
    ["branchId", branchId],
  ]
    .filter(([, v]) => !v || (typeof v === "string" && !v.trim()))
    .map(([k]) => k);

  if (missing.length > 0) {
    return res.status(400).json({ error: `Campos obrigatórios ausentes: ${missing.join(", ")}` });
  }

  if (!DATE_RE.test(date)) {
    return res.status(400).json({ error: "date deve estar no formato YYYY-MM-DD." });
  }
  if (!TIME_RE.test(time)) {
    return res.status(400).json({ error: "time deve estar no formato HH:MM." });
  }
  if (status && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status inválido. Use um de: ${ALLOWED_STATUSES.join(", ")}` });
  }
  for (const [field, value] of [
    ["examId", examId],
    ["branchId", branchId],
  ] as const) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({ error: `${field} inválido.` });
    }
  }
  if (operatorId && !mongoose.Types.ObjectId.isValid(operatorId)) {
    return res.status(400).json({ error: "operatorId inválido." });
  }

  try {
    const [exam, branch] = await Promise.all([
      Exam.findById(examId).lean<{ _id: any; name?: string; nome_exame?: string }>(),
      Branch.findById(branchId).lean<{ _id: any; name?: string }>(),
    ]);

    if (!exam) return res.status(404).json({ error: "Exame não encontrado." });
    if (!branch) return res.status(404).json({ error: "Filial não encontrada." });

    let operator: { _id: any; name?: string; scope?: string } | null = null;

    if (operatorId) {
      operator = await Admin.findById(operatorId).lean<{
        _id: any;
        name?: string;
        scope?: string;
      }>();
      if (!operator) {
        return res.status(404).json({ error: "Operador não encontrado." });
      }
    } else {
      const branchObjectId = new mongoose.Types.ObjectId(branchId);
      const baseQuery = {
        assignedTo: branchObjectId,
        status: "Ativo",
      } as const;

      let candidates = await Admin.find({ ...baseQuery, scope: "TECH" })
        .select("_id name scope")
        .lean<{ _id: any; name?: string; scope?: string }[]>();

      if (candidates.length === 0) {
        candidates = await Admin.find({ ...baseQuery, scope: "BRANCH" })
          .select("_id name scope")
          .lean<{ _id: any; name?: string; scope?: string }[]>();
      }

      if (candidates.length > 0) {
        const candidateIds = candidates.map(c => c._id);
        const busyAppointments = await Appointment.find({
          date,
          time,
          operator: { $in: candidateIds },
          status: { $ne: "Cancelado" }
        })
          .select("operator")
          .lean();

        const busyOperatorIds = new Set(busyAppointments.map(a => String(a.operator)));
        const availableCandidates = candidates.filter(c => !busyOperatorIds.has(String(c._id)));

        if (availableCandidates.length > 0) {
          operator = availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
        } else {
          return res.status(400).json({ error: "Não há operadores disponíveis para este horário." });
        }
      } else {
        return res.status(400).json({ error: "Nenhum operador cadastrado ou ativo para esta filial." });
      }
    }

    const appointment = await Appointment.create({
      patient: String(patient).trim(),
      cpf: String(cpf).trim(),
      date,
      time,
      exam: exam._id,
      branchId: branch._id,
      operator: operator ? operator._id : null,
      status: status ?? "Confirmado",
    });

    const user = getAuditUser(req);
    const ip = getClientIp(req);
    if (user) {
      const operatorDesc = operator ? `${operator.name ?? operator._id}` : "Nenhum";
      await logAction(
        "CREATE",
        "Agendamento",
        `Agendamento criado para ${appointment.patient} em ${appointment.date} ${appointment.time} na filial ${branch.name ?? ""} (operador: ${operatorDesc}).`,
        user,
        ip
      );
    }

    let patientName = appointment.patient;
    const patientUser = await User.findOne({ id: appointment.patient }).select('name').lean() as any;
    if (patientUser) {
      patientName = patientUser.name;
    }

    return res.status(201).json({
      _id: String(appointment._id),
      id: String(appointment._id),
      patient: patientName,
      cpf: appointment.cpf,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      branch: { id: String(branch._id), name: branch.name ?? null },
      exam: {
        id: String(exam._id),
        name: exam.name ?? exam.nome_exame ?? "Exame Indefinido",
      },
      operator: operator
        ? {
            id: String(operator._id),
            name: operator.name ?? null,
            scope: operator.scope ?? null,
            autoAssigned: !operatorId,
          }
        : null,
      createdAt: (appointment as any).createdAt ?? null,
      updatedAt: (appointment as any).updatedAt ?? null,
    });
  } catch (error: any) {
    console.error("[POST /api/agendamentos]", error);
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: "status inválido." });
  }

  try {
    const appointment = await Appointment.findById(id).populate('branchId', 'name') as any;
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    const user = getAuditUser(req);
    const ip = getClientIp(req);
    if (user) {
      await logAction(
        'UPDATE',
        'Agendamento',
        `Status do agendamento de ${appointment.patient} na filial ${appointment.branchId?.name || ''} alterado de "${oldStatus}" para "${status}".`,
        user,
        ip
      );
    }

    return res.json({ success: true, appointment });
  } catch (error: any) {
    console.error('Erro ao atualizar status do agendamento:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const a = await Appointment.findById(id)
      .populate("branchId", "name")
      .populate("exam")
      .populate("operator", "name scope")
      .lean() as any;

    if (!a) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const user = await User.findOne({ id: a.patient }).select('name').lean() as any;

    return res.json({
      ...a,
      patient: user ? user.name : a.patient,
      patientId: a.patient,
      _id: String(a._id),
      id: String(a._id),
      branch: a.branchId
        ? { id: String(a.branchId._id ?? a.branchId), name: a.branchId.name ?? null }
        : null,
      exam: a.exam
        ? {
          id: String(a.exam._id ?? a.exam),
          name: a.exam.name ?? a.exam.nome_exame ?? "Exame Indefinido",
        }
        : null
    });
  } catch (error: any) {
    console.error('Erro ao buscar agendamento por ID:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { date, time, branchId, status, operatorId } = req.body;
  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (status && ALLOWED_STATUSES.includes(status)) appointment.status = status;

    if (branchId) {
      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({ error: 'branchId inválido.' });
      }
      const branchExists = await Branch.findById(branchId);
      if (!branchExists) {
        return res.status(404).json({ error: 'Filial não encontrada.' });
      }
      appointment.branchId = new mongoose.Types.ObjectId(branchId);
    }

    if (operatorId !== undefined) {
      if (operatorId === null) {
        appointment.operator = null;
      } else if (mongoose.Types.ObjectId.isValid(operatorId)) {
        appointment.operator = new mongoose.Types.ObjectId(operatorId);
      }
    }

    await appointment.save();

    const user = getAuditUser(req);
    const ip = getClientIp(req);
    if (user) {
      await logAction(
        'UPDATE',
        'Agendamento',
        `Agendamento de ${appointment.patient} na filial ${appointment.branchId} atualizado.`,
        user,
        ip
      );
    }

    return res.json(appointment);
  } catch (error: any) {
    console.error('Erro ao remarcar agendamento:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    return res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar agendamento:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;

