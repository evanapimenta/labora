import { getBranchById } from '@/actions/branch';
import { getLaboratories } from '@/actions/laboratory';
import EditarFilialClient from './EditarFilialClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Editar Filial — Labora",
  description: "Edite as informações da filial do laboratório.",
};

export const dynamic = "force-dynamic";

export default async function EditarFilialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const branch = await getBranchById(id);
  const labs = await getLaboratories();

  if (!branch) {
    notFound();
  }

  return <EditarFilialClient branch={branch} labs={labs} />;
}
