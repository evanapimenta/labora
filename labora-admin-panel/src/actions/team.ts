"use server";

import { apiFetch } from '@/lib/api-client';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

export async function getTeamMembers() {
  try {
    const members = await apiFetch('/api/admins');
    return members;
  } catch (error) {
    console.error('Erro ao buscar membros da equipe via API:', error);
    return [];
  }
}

export async function toggleTeamMemberStatus(id: string, currentStatus: 'Ativo' | 'Pendente' | 'Inativo') {
  try {
    const result = await apiFetch(`/api/admins/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ currentStatus })
    });

    if (result.success) {
      const members = await getTeamMembers();
      const adminDoc = members.find((m: any) => m._id === id);
      const adminName = adminDoc ? adminDoc.name : id;
      await logAction(
        'UPDATE',
        'Equipe',
        `Status do membro ${adminName} alterado de "${currentStatus}" para "${result.status}".`
      );

      revalidatePath('/equipe');
      return { success: true };
    }
    return { success: false, error: 'Erro ao alterar status.' };
  } catch (error: any) {
    console.error('Erro ao alterar status de membro da equipe:', error);
    return { success: false, error: error.message };
  }
}
