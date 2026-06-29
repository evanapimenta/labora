import { getLaboratoryById } from '@/actions/laboratory';
import EditarLaboratorioClient from './EditarLaboratorioClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Editar Laboratório — Labora",
  description: "Edite as informações da matriz do laboratório.",
};

export const dynamic = "force-dynamic";

export default async function EditarLaboratorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lab = await getLaboratoryById(id);

  if (!lab) {
    notFound();
  }

  return <EditarLaboratorioClient lab={lab} />;
}
