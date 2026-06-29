import LaboratoriosClient from './LaboratoriosClient';
import { getLaboratories } from '@/actions/laboratory';
import { getBranches } from '@/actions/branch';
import { getAccessibleBranches } from '@/lib/branches';
import { redirect } from 'next/navigation';

export default async function LaboratoriosPage() {
  const { user } = await getAccessibleBranches();

  if (user?.scope === 'TECH') {
    redirect('/agendamentos');
  }

  const labs = await getLaboratories();
  const branches = await getBranches();

  return <LaboratoriosClient labs={labs} branches={branches} />;
}
