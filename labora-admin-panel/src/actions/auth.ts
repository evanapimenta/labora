"use server";

import { apiFetch } from '@/lib/api-client';
import { logAction } from '@/lib/audit';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: any, formData: FormData) {
  const usernameOrEmail = formData.get('usernameOrEmail') as string;
  const password = formData.get('password') as string;

  if (!usernameOrEmail || !password) {
    return { success: false, error: 'Por favor, preencha todos os campos.', usernameOrEmail };
  }

  let userPayload: any = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  try {
    const result = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    });

    if (result.success) {
      userPayload = result.user;
      accessToken = result.accessToken;
      refreshToken = result.refreshToken;
    }
  } catch (error: any) {
    console.error('Erro no login:', error);
    try {
      const parsed = JSON.parse(error.body);
      if (parsed.firstAccess) {
        return {
          success: false,
          error: parsed.error,
          usernameOrEmail,
          firstAccess: true
        };
      }
      return { success: false, error: parsed.error || 'Credenciais inválidas.', usernameOrEmail };
    } catch {
      return { success: false, error: 'Erro de conexão ou credenciais inválidas.', usernameOrEmail };
    }
  }

  if (userPayload && accessToken) {
    try {
      const token = accessToken;

      const cookieStore = await cookies();
      cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/'
      });

      if (refreshToken) {
        cookieStore.set('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/'
        });
      }

      await logAction('LOGIN', 'Sistema', 'Login efetuado com sucesso.', userPayload);
    } catch (cookieError) {
      console.error('Erro ao definir cookies:', cookieError);
      return { success: false, error: 'Erro ao criar sessão.', usernameOrEmail };
    }

    redirect('/');
  }
}

export async function registerAdmin(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const scope = formData.get('scope') as 'LAB' | 'BRANCH' | 'TECH';
  const assignedEntities = formData.getAll('assignedTo') as string[];

  if (!name || !username || !email || !phoneNumber || !scope) {
    return { success: false, error: 'Por favor, preencha todos os campos obrigatórios.' };
  }

  try {
    await apiFetch('/api/admins', {
      method: 'POST',
      body: JSON.stringify({
        name,
        username,
        email,
        phoneNumber,
        scope,
        assignedTo: assignedEntities
      })
    });

    await logAction('CREATE', 'Administrador', `Cadastro de novo administrador: ${name}`);

  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    try {
      const parsed = JSON.parse(error.body);
      return { success: false, error: parsed.error || 'Erro ao cadastrar membro.' };
    } catch {
      return { success: false, error: 'Erro ao cadastrar membro: ' + error.message };
    }
  }

  redirect('/equipe');
}

export async function logoutAdmin() {
  await logAction('LOGOUT', 'Sistema', 'Sessão encerrada.');
  const cookieStore = await cookies();
  cookieStore.delete('session');
  cookieStore.delete('refreshToken');
  cookieStore.delete('active_lab_id');
  cookieStore.delete('active_branch_id');
  redirect('/login');
}

export async function setActiveLab(labId: string) {
  const cookieStore = await cookies();
  cookieStore.set('active_lab_id', labId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  });
  cookieStore.delete('active_branch_id');
}

export async function setActiveBranch(branchId: string) {
  const cookieStore = await cookies();
  cookieStore.set('active_branch_id', branchId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  });
}

export async function setFirstAccessPassword(prevState: any, formData: FormData) {
  const usernameOrEmail = formData.get('usernameOrEmail') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!usernameOrEmail || !password || !confirmPassword) {
    return { success: false, error: 'Preencha todos os campos.', usernameOrEmail };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: 'A senha deve ter pelo menos 8 caracteres.',
      usernameOrEmail,
    };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'As senhas não conferem.', usernameOrEmail };
  }

  let userPayload: any = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  try {
    const result = await apiFetch('/api/auth/first-access', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    });

    if (result.success) {
      userPayload = result.user;
      accessToken = result.accessToken;
      refreshToken = result.refreshToken;
    }
  } catch (error: any) {
    console.error('Erro ao definir senha:', error);
    try {
      const parsed = JSON.parse(error.body);
      return { success: false, error: parsed.error || 'Erro ao definir senha.', usernameOrEmail };
    } catch {
      return {
        success: false,
        error: 'Erro ao definir senha: ' + error.message,
        usernameOrEmail,
      };
    }
  }

  if (userPayload && accessToken) {
    const token = accessToken;
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    if (refreshToken) {
      cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      });
    }

    await logAction('LOGIN', 'Sistema', 'Login automático após primeiro acesso.', userPayload);
    redirect('/');
  }
}
