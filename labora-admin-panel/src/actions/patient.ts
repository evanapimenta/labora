"use server";

import { apiFetch } from '@/lib/api-client';

export async function searchPatients(query: string) {
  if (!query || query.length < 2) return [];

  try {
    // API uses /api/users?q=... and returns { content: [...] }
    const response = await apiFetch(`/api/users?q=${encodeURIComponent(query)}&size=10`);
    if (response && response.content) {
      return response.content;
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    return [];
  }
}
