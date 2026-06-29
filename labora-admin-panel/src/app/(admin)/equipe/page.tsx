import React from 'react';
import EquipeClient from './EquipeClient';
import { getTeamMembers } from '@/actions/team';
import { getBranches } from '@/actions/branch';
import { getLaboratories } from '@/actions/laboratory';
import { getAccessibleBranches } from '@/lib/branches';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EquipePage() {
  const { user, activeLab, userBranches } = await getAccessibleBranches();

  if (user?.scope === 'TECH') {
    redirect('/agendamentos');
  }

  const team = await getTeamMembers();
  const branches = await getBranches();
  const laboratories = await getLaboratories();

  return (
    <EquipeClient
      initialTeam={team}
      branches={branches}
      laboratories={laboratories}
      currentUserScope={user?.scope}
      activeLab={activeLab}
      labBranches={userBranches}
    />
  );
}
