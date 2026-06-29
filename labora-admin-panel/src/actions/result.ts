"use server";

import { cookies, headers } from 'next/headers';
import { verifyToken } from '@/lib/session';
import { apiFetch, apiFetchWithAudit } from '@/lib/api-client';
import { revalidatePath } from 'next/cache';

export async function uploadExamResult(
  appointmentId: string,
  fileName: string,
  fileUrl: string,
  notes?: string
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const user = session ? await verifyToken(session) : null;

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const result = await apiFetchWithAudit('/api/resultados', {
      method: 'POST',
      body: JSON.stringify({
        appointmentId,
        fileName,
        fileUrl,
        notes
      })
    }, user, ip);

    if (result.success) {
      revalidatePath('/agendamentos');
      revalidatePath('/filial');
      revalidatePath('/');
      return { success: true };
    }

    return { success: false, error: 'Erro ao enviar resultado de exame.' };
  } catch (error: any) {
    console.error('Erro ao enviar resultado de exame:', error);
    return { success: false, error: error.message };
  }
}

export async function getExamResult(appointmentId: string) {
  try {
    const result = await apiFetch(`/api/resultados/${appointmentId}`);
    return result;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    console.error('Erro ao buscar resultado de exame via API:', error);
    return null;
  }
}
