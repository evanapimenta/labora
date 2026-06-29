import type { Metadata } from "next";
import { getExams } from "@/actions/exam";
import ExamesClient from "./ExamesClient";
import { getAccessibleBranches } from "@/lib/branches";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Catálogo de Exames — Labora",
  description: "Gerencie os exames oferecidos pelo laboratório.",
};

export const dynamic = "force-dynamic";

export default async function ExamesPage() {
  const { user } = await getAccessibleBranches();

  if (user?.scope === 'TECH') {
    redirect('/agendamentos');
  }

  const exams = await getExams();

  return <ExamesClient exams={exams} />;
}