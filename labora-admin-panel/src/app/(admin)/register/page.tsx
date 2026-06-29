import { getAccessibleBranches } from '@/lib/branches';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import RegisterClient from './RegisterClient';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const { user } = await getAccessibleBranches();

  if (!user || user.scope !== 'SYSTEM') {
    redirect('/agendamentos');
  }

  let labs: any[] = [];
  let branches: any[] = [];

  try {
    const [labsResponse, branchesResponse] = await Promise.all([
      apiFetch('/api/laboratorios?limit=500'),
      apiFetch('/api/filiais?limit=500')
    ]);

    labs = (labsResponse.data || []).map((lab: any) => ({
      _id: lab._id || lab.id,
      labName: lab.labName || lab.name
    }));

    branches = (branchesResponse.data || []).map((branch: any) => ({
      _id: branch._id || branch.id,
      name: branch.name
    }));
  } catch (error) {
    console.error('Erro ao buscar dados de laboratórios e filiais para o cadastro:', error);
  }

  return <RegisterClient labs={labs} branches={branches} />;
}
