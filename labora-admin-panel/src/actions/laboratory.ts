"use server";

import { apiFetch } from '@/lib/api-client';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

export async function createLaboratory(formData: FormData) {
  try {
    const data = {
      name: formData.get('name'),
      cnpj: formData.get('cnpj'),
      phoneNumber: formData.get('phone'),
      email: formData.get('email'),
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

    await apiFetch('/api/laboratorios', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    await logAction('CREATE', 'Laboratório', `Laboratório ${data.name} criado com sucesso.`);

    revalidatePath('/laboratorios');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao criar laboratório:', error);
    return { success: false, error: error.message };
  }
}

export async function getLaboratories() {
  try {
    const response = await apiFetch('/api/laboratorios?limit=200');
    return response.data ?? [];
  } catch (error) {
    console.error('Erro ao buscar laboratórios via API:', error);
    return [];
  }
}

export async function getLaboratoryById(id: string) {
  try {
    const lab = await apiFetch(`/api/laboratorios/${id}`);
    return lab;
  } catch (error) {
    console.error('Erro ao buscar laboratório via API:', error);
    return null;
  }
}

export async function updateLaboratory(id: string, formData: FormData) {
  try {
    const data = {
      name: formData.get('name'),
      cnpj: formData.get('cnpj'),
      phoneNumber: formData.get('phone'),
      email: formData.get('email'),
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

    await apiFetch(`/api/laboratorios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    await logAction('UPDATE', 'Laboratório', `Laboratório ${data.name} atualizado com sucesso.`);

    revalidatePath('/laboratorios');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar laboratório:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleLaboratoryStatus(id: string) {
  try {
    const result = await apiFetch(`/api/laboratorios/${id}/status`, {
      method: 'PATCH'
    });

    if (result.success) {
      await logAction('UPDATE', 'Laboratório', `Status do laboratório ${result.name} alterado para ${result.status}.`);
      revalidatePath('/laboratorios');
      return { success: true, status: result.status };
    }

    return { success: false, error: 'Erro ao alternar status do laboratório.' };
  } catch (error: any) {
    console.error('Erro ao alternar status do laboratório:', error);
    return { success: false, error: error.message };
  }
}
