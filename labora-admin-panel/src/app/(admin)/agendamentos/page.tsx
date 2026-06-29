import type { Metadata } from "next";
import { getAccessibleBranches } from "@/lib/branches";
import { getAppointments } from "@/actions/appointment";
import AgendamentosClient from "./AgendamentosClient";

export const metadata: Metadata = {
  title: "Agendamentos — Labora",
  description: "Agenda diária de pacientes e exames da filial.",
};

interface PageProps {
  searchParams: Promise<{
    date?: string;
    range?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AgendamentosPage({ searchParams }: PageProps) {
  const { userBranches, activeBranch } = await getAccessibleBranches();
  
  const params = await searchParams;
  const range = params.range || "all";
  const selectedDate = params.date || "2026-06-09";

  let dateQuery: string | undefined = "2026-06-09";
  const baseDate = "2026-06-09";

  if (range === "today") {
    dateQuery = baseDate;
  } else if (range === "5days") {
    const start = new Date(baseDate);
    const end = new Date(baseDate);
    end.setDate(end.getDate() + 4);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    dateQuery = `${startStr}:${endStr}`;
  } else if (range === "30days") {
    const start = new Date(baseDate);
    const end = new Date(baseDate);
    end.setDate(end.getDate() + 29);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    dateQuery = `${startStr}:${endStr}`;
  } else if (range === "custom") {
    dateQuery = selectedDate;
  } else if (range === "all") {
    dateQuery = undefined;
  }

  const initialAppointments = activeBranch
    ? await getAppointments(activeBranch._id, dateQuery)
    : [];

  const pendingAppointments = activeBranch
    ? await getAppointments(activeBranch._id, undefined, "Aguardando Resultado")
    : [];

  return (
    <AgendamentosClient
      initialAppointments={initialAppointments}
      pendingAppointments={pendingAppointments}
      activeBranch={activeBranch}
      userBranches={userBranches}
      selectedDate={selectedDate}
      currentRange={range}
    />
  );
}
