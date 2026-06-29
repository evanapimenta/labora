import { cookies, headers } from 'next/headers';
import { verifyToken } from './session';
import { apiFetch } from './api-client';

export async function logAction(
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT',
  entity: string,
  details: string,
  overrideUser?: any
) {
  try {
    let sessionUser = overrideUser;
    if (!sessionUser) {
      const cookieStore = await cookies();
      const session = cookieStore.get('session')?.value;
      if (session) {
        sessionUser = await verifyToken(session);
      }
    }

    if (!sessionUser) {
      console.warn('Tentativa de auditoria sem usuário autenticado.');
      return;
    }

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const role = sessionUser.scope === 'SYSTEM' ? 'Sistema' : sessionUser.scope === 'LAB' ? 'Lab Admin' : 'Filial Admin';

    await apiFetch('/api/audit-logs', {
      method: 'POST',
      body: JSON.stringify({
        action,
        entity,
        details,
        ip,
        user: {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          role
        }
      })
    });

    console.log(`[AUDIT] ${action} em ${entity} enviado para a API por ${sessionUser.name}.`);
  } catch (error) {
    console.error('Falha ao registrar log de auditoria via API:', error);
  }
}
