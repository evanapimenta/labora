"use server";

import { apiFetch } from '@/lib/api-client';

export async function getExams() {
  try {
    const result = await apiFetch('/api/exames');
    return result.data ?? [];
  } catch (error) {
    console.error('Erro ao buscar exames via API:', error);
    return [];
  }
}

export async function createExam(data: any) {
  try {
    const result = await apiFetch('/api/exames', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (result && !result.error) {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/exames');
      return { success: true, data: result };
    }
    return { success: false, error: result.error || 'Erro ao criar exame.' };
  } catch (error: any) {
    console.error('Erro ao criar exame:', error);
    return { success: false, error: error.message };
  }
}
