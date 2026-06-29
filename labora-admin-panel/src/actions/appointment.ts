"use server";

import { cookies, headers } from 'next/headers';
import { verifyToken } from '@/lib/session';
import { apiFetch, apiFetchWithAudit } from '@/lib/api-client';
import { revalidatePath } from 'next/cache';
export type AppointmentStatus = "Confirmado" | "Check-in" | "Aguardando Resultado" | "Concluído" | "Realizado" | "Cancelado" | "Pendente";

export async function getAppointments(branchIds?: string | string[], date?: string, status?: string) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const user = session ? await verifyToken(session) : null;

    const params = new URLSearchParams();
    if (branchIds) {
      if (Array.isArray(branchIds)) {
        params.append('branchId', branchIds.join(','));
      } else {
        params.append('branchId', branchIds);
      }
    }
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    if (user?.scope === 'TECH') {
      params.append('operatorId', user.userId);
    }
    params.append('limit', '500'); // Garante que busca um bom número de agendamentos

    const response = await apiFetch(`/api/agendamentos?${params.toString()}`);
    const items = response.data ?? [];

    const mappedAppointments = items.map((a: any) => {
      let displayOperator = "Sem operador";
      if (a.operator) {
        if (a.operator.name) {
          displayOperator = a.operator.name;
          if (a.operator.scope === 'TECH' && !displayOperator.startsWith('Téc. ')) {
            displayOperator = `Téc. ${displayOperator}`;
          }
        } else {
          displayOperator = String(a.operator.id || a.operator);
        }
      }
      return {
        ...a,
        exam: a.exam?.name || "Exame Indefinido",
        operator: displayOperator
      };
    });

    return mappedAppointments;
  } catch (error) {
    console.error('Erro ao buscar agendamentos via API:', error);
    return [];
  }
}

export async function updateAppointmentStatus(id: string, status: any) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const user = session ? await verifyToken(session) : null;

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const result = await apiFetchWithAudit(`/api/agendamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, user, ip);

    if (result.success) {
      revalidatePath('/agendamentos');
      revalidatePath('/');
      return { success: true };
    }

    return { success: false, error: 'Erro ao atualizar status do agendamento.' };
  } catch (error: any) {
    console.error('Erro ao atualizar status do agendamento:', error);
    return { success: false, error: error.message };
  }
}

export async function updateAppointmentDetails(id: string, data: any) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const user = session ? await verifyToken(session) : null;

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const result = await apiFetchWithAudit(`/api/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, user, ip);

    if (result && !result.error) {
      revalidatePath('/agendamentos');
      revalidatePath('/');
      return { success: true };
    }

    return { success: false, error: result.error || 'Erro ao editar agendamento.' };
  } catch (error: any) {
    console.error('Erro ao editar agendamento:', error);
    return { success: false, error: error.message };
  }
}

export async function createAppointment(data: any) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const user = session ? await verifyToken(session) : null;

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const result = await apiFetchWithAudit(`/api/agendamentos`, {
      method: 'POST',
      body: JSON.stringify(data)
    }, user, ip);

    if (result && !result.error) {
      revalidatePath('/agendamentos');
      revalidatePath('/');
      return { success: true, data: result };
    }

    return { success: false, error: result.error || 'Erro ao criar agendamento.' };
  } catch (error: any) {
    console.error('Erro ao criar agendamento:', error);
    return { success: false, error: error.message };
  }
}
