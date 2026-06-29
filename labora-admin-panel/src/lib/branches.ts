import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/session';
import { apiFetch } from './api-client';

export async function getAccessibleBranches() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const user = session ? await verifyToken(session) : null;

  if (!user) {
    return { user: null, userLabs: [], userBranches: [], activeBranch: null, activeLab: null };
  }

  const activeLabId = cookieStore.get('active_lab_id')?.value;
  const activeBranchId = cookieStore.get('active_branch_id')?.value;

  try {
    const result = await apiFetch('/api/accessible-branches', {
      method: 'POST',
      body: JSON.stringify({
        user,
        activeLabId,
        activeBranchId
      })
    });
    return result;
  } catch (error) {
    console.error('Erro ao buscar filiais acessíveis via API:', error);
    return { user, userLabs: [], userBranches: [], activeBranch: null, activeLab: null };
  }
}
