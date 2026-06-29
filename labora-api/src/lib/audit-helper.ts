import AuditLog from '../models/AuditLog';

export interface AuditUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function logAction(
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT',
  entity: string,
  details: string,
  user?: AuditUser,
  ip: string = '127.0.0.1'
) {
  try {
    if (!user) {
      console.warn('Tentativa de auditoria sem usuário autenticado.');
      return;
    }

    const log = new AuditLog({
      action,
      entity,
      user,
      ip,
      details
    });

    await log.save();
    console.log(`[AUDIT] ${action} em ${entity} registrado por ${user.name}.`);
  } catch (error) {
    console.error('Falha ao registrar log de auditoria:', error);
  }
}
