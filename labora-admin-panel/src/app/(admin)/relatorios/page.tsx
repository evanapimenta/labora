import { getAccessibleBranches } from "@/lib/branches";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { user, userBranches, activeBranch, activeLab } = await getAccessibleBranches();

  if (user?.scope === 'TECH') {
    redirect('/agendamentos');
  }

  let appointments: any[] = [];
  try {
    const response = await apiFetch('/api/agendamentos?limit=5000');
    appointments = response.data || [];
  } catch (error) {
    console.error('Erro ao carregar dados dos agendamentos para o relatório:', error);
  }

  return (
    <ReportsClient
      initialAppointments={appointments}
      userBranches={userBranches || []}
      activeBranch={activeBranch}
      activeLab={activeLab}
    />
  );
}

