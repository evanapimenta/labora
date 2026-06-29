import type { Metadata } from "next";
import NovoExameClient from "./NovoExameClient";

import { getExams } from "@/actions/exam";

export const metadata: Metadata = {
  title: "Novo Exame — Labora",
  description: "Cadastrar um novo exame no catálogo",
};

export default async function NovoExamePage() {
  const exams = await getExams();
  const categories = Array.from(new Set(exams.map((e: any) => e.category || e.categoria))).filter(Boolean).sort() as string[];
  
  return <NovoExameClient categories={categories} />;
}
