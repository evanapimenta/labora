"use server";

import { redirect } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { setSessionCookies, clearSessionCookies } from '@/lib/labifySession';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface LoginState {
  success: boolean;
  error?: string;
  email?: string;
}

export async function loginAdmin(prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const email = (formData.get('email') ?? formData.get('usernameOrEmail') ?? '').toString();
  const password = (formData.get('password') ?? '').toString();

  if (!email || !password) {
    return { success: false, error: 'Por favor, preencha todos os campos.', email };
  }

  try {
    const response = await apiFetch<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email: email.trim(), password }),
    });

    await setSessionCookies({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { success: false, error: 'Credenciais inválidas.', email };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { success: false, error: 'Muitas tentativas. Tente novamente em alguns minutos.', email };
    }
    console.error('loginAdmin: erro ao consultar labify-api', error);
    return { success: false, error: 'Erro ao se comunicar com o servidor. Tente novamente.', email };
  }

  redirect('/');
}

export async function logoutAdmin() {
  await clearSessionCookies();
  redirect('/login');
}
