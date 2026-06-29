import { Router } from 'express';
import AuditLog from '../models/AuditLog';
import { logAction, AuditUser } from '../lib/audit-helper';

const router = Router();

function cell(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function row(...values: (string | number | null | undefined)[]): string {
  return values.map(cell).join(";");
}

router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.json(logs);
  } catch (error: any) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { action, entity, details, user, ip } = req.body;

  if (!action || !entity || !details || !user) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes para o log de auditoria.' });
  }

  try {
    await logAction(action, entity, details, user, ip || req.ip);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao salvar log de auditoria via API:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/export', async (req, res) => {
  try {
    const logs = (await AuditLog.find({})
      .sort({ createdAt: -1 })
      .lean()) as any[];

    const lines: string[] = [];

    lines.push("\uFEFF");
    lines.push(row("Data/Hora", "Ação", "Entidade", "Usuário", "E-mail", "IP", "Detalhes"));

    logs.forEach((l) => {
      lines.push(row(
        new Date(l.createdAt).toLocaleString("pt-BR"),
        l.action ?? "",
        l.entity ?? "",
        l.user?.name ?? "",
        l.user?.email ?? "",
        l.ip ?? "",
        l.details ?? "",
      ));
    });

    const csv = lines.join("\n");
    const date = new Date().toISOString().slice(0, 10);
    const filename = `auditoria-${date}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (error: any) {
    console.error("[export/auditoria]", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
