import { Router } from 'express';
import ExamResult from '../models/ExamResult';
import Appointment from '../models/Appointment';
import Exam from '../models/Exam';
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

router.get('/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const result = await ExamResult.findOne({ appointmentId }).lean() as any;
    if (!result) {
      return res.status(404).json({ error: 'Resultado de exame não encontrado para este agendamento' });
    }
    return res.json({
      ...result,
      _id: String(result._id)
    });
  } catch (error: any) {
    console.error('Erro ao buscar resultado de exame:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { appointmentId, fileName, fileUrl, notes } = req.body;

  if (!appointmentId || !fileName || !fileUrl) {
    return res.status(400).json({ error: 'appointmentId, fileName e fileUrl são obrigatórios' });
  }

  try {
    void Exam;

    const user = getAuditUser(req);
    const ip = getClientIp(req);

    const resultDoc = new ExamResult({
      appointmentId,
      fileName,
      fileUrl,
      notes,
      uploadedBy: user ? String(user.id) : 'Sistema Automático'
    });
    await resultDoc.save();

    const appointment = await Appointment.findById(appointmentId).populate('branchId', 'name').populate('exam') as any;
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento correspondente não encontrado.' });
    }

    const oldStatus = appointment.status;
    appointment.status = 'Concluído';
    await appointment.save();

    if (user) {
      const examName = appointment.exam?.name || appointment.exam?.nome_exame || '';
      await logAction(
        'UPDATE',
        'Resultado de Exame',
        `Resultado "${fileName}" enviado para o paciente ${appointment.patient} (Exame: ${examName}). Status alterado de "${oldStatus}" para "Concluído".`,
        user,
        ip
      );
    }

    return res.status(201).json({ success: true, result: resultDoc });
  } catch (error: any) {
    console.error('Erro ao enviar resultado de exame:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
