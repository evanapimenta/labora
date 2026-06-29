import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getAccessibleBranches } from '@/lib/branches';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userLabs, activeLab, userBranches, activeBranch } = await getAccessibleBranches();

  return (
    <AdminLayout 
      user={user} 
      userLabs={userLabs} 
      activeLab={activeLab}
      userBranches={userBranches}
      activeBranch={activeBranch}
    >
      {children}
    </AdminLayout>
  );
}
