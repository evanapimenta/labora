import React from 'react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/session';
import { apiFetch } from '@/lib/api-client';
import RelatorioPrint from "@/components/relatorio/RelatorioPrint";

interface PageProps {
  searchParams: Promise<{
    range?: string;
    type?: string;
    branchId?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function RelatorioPage({ searchParams }: PageProps) {
  const { range, type, branchId } = await searchParams;

  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const user = session ? await verifyToken(session) : null;
  const activeLabId = cookieStore.get('active_lab_id')?.value;
  const activeBranchId = branchId || cookieStore.get('active_branch_id')?.value;

  const data = await apiFetch('/api/dashboard/export-data', {
    method: 'POST',
    body: JSON.stringify({
      range: range ?? "30",
      user,
      activeLabId,
      activeBranchId
    })
  });

  return <RelatorioPrint data={data} reportType={type} />;
}

