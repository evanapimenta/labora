"use server";

import { apiFetch } from '@/lib/api-client';
import { logAction } from '@/lib/audit';

export async function updateProfile(adminId: string, data: { name?: string, username?: string, email?: string, phoneNumber?: string, password?: string, oldPassword?: string }) {
  try {
    const result = await apiFetch(`/api/admins/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (result.success) {
      await logAction('UPDATE', 'Administrador', `Atualização de perfil do usuário: ${data.name || adminId}`);
      return { success: true };
    }
    return { success: false, error: 'Erro ao atualizar o perfil.' };
  } catch (error: any) {
    console.error('Erro na atualização:', error);
    try {
      const parsed = JSON.parse(error.body);
      return { success: false, error: parsed.error || 'Erro ao atualizar o perfil.' };
    } catch {
      return { success: false, error: 'Erro ao atualizar o perfil: ' + error.message };
    }
  }
}

export async function getAdminProfile(adminId: string) {
  try {
    const result = await apiFetch(`/api/admins`);
    if (Array.isArray(result)) {
      const admin = result.find((a: any) => a._id === adminId || a.id === adminId);
      return admin || null;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
}
