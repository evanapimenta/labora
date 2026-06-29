"use server";

import { apiFetch } from '@/lib/api-client';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

export async function createBranch(formData: FormData) {
  try {
    const data = {
      name: formData.get('name'),
      laboratoryId: formData.get('laboratoryId'),
      phoneNumber: formData.get('phone'),
      email: formData.get('email'),
      openingHours: formData.get('openingHours'),
      address: {
        street: formData.get('street'),
        number: formData.get('number'),
        complement: formData.get('complement') || '',
        neighborhood: formData.get('neighborhood'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country') || 'Brasil',
      }
    };

    await apiFetch('/api/filiais', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    await logAction('CREATE', 'Filial', `Filial ${data.name} criada com sucesso.`);

    revalidatePath('/laboratorios');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao criar filial:', error);
    return { success: false, error: error.message };
  }
}

export async function getBranches() {
  try {
    const response = await apiFetch('/api/filiais?limit=200');
    return response.data ?? [];
  } catch (error) {
    console.error('Erro ao buscar filiais via API:', error);
    return [];
  }
}

export async function getBranchById(id: string) {
  try {
    const branch = await apiFetch(`/api/filiais/${id}`);
    return branch;
  } catch (error) {
    console.error('Erro ao buscar filial via API:', error);
    return null;
  }
}

export async function updateBranch(id: string, formData: FormData) {
  try {
    const data = {
      name: formData.get('name'),
      laboratoryId: formData.get('laboratoryId'),
      phoneNumber: formData.get('phone'),
      email: formData.get('email'),
      openingHours: formData.get('openingHours'),
      address: {
        street: formData.get('street'),
        number: formData.get('number'),
        complement: formData.get('complement') || '',
        neighborhood: formData.get('neighborhood'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country') || 'Brasil',
      }
    };

    await apiFetch(`/api/filiais/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    await logAction('UPDATE', 'Filial', `Filial ${data.name} atualizada com sucesso.`);

    revalidatePath('/laboratorios');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar filial:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleBranchStatus(id: string) {
  try {
    const result = await apiFetch(`/api/filiais/${id}/status`, {
      method: 'PATCH'
    });

    if (result.success) {
      await logAction('UPDATE', 'Filial', `Status da filial ${result.name} alterado para ${result.status}.`);
      revalidatePath('/laboratorios');
      return { success: true, status: result.status };
    }

    return { success: false, error: 'Erro ao alternar status da filial.' };
  } catch (error: any) {
    console.error('Erro ao alternar status da filial:', error);
    return { success: false, error: error.message };
  }
}
