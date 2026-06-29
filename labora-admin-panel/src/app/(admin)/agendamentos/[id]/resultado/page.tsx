import React from 'react';
import { notFound } from 'next/navigation';
import { Calendar, User, FlaskConical, MapPin } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import ResultForm from './ResultForm';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function UploadResultadoPage({ params }: PageProps) {
  const { id } = await params;

  let appointment: any = null;
  try {
    appointment = await apiFetch(`/api/agendamentos/${id}`);
  } catch (error: any) {
    if (error.status === 404) {
      notFound();
    }
    console.error('Erro ao buscar agendamento via API:', error);
    notFound();
  }

  if (!appointment) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-warning/15 text-warning mb-3">
          <FlaskConical className="size-3.5" /> Aguardando Resultado
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Enviar Resultado</h1>
        <p className="text-muted-foreground mt-1 text-sm">Insira o laudo e anexe o laudo técnico do exame finalizado.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft mb-6">
        <h3 className="font-display font-semibold text-sm mb-4">Dados do Agendamento</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <User className="size-4 text-primary" />
            <div>
              <span className="text-xs text-muted-foreground block">Paciente</span>
              <span className="font-semibold text-foreground">{appointment.patient}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <FlaskConical className="size-4 text-primary" />
            <div>
              <span className="text-xs text-muted-foreground block">Exame</span>
              <span className="font-semibold text-foreground">{appointment.exam?.name || "Exame Indefinido"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Calendar className="size-4 text-primary" />
            <div>
              <span className="text-xs text-muted-foreground block">Data & Horário</span>
              <span className="font-semibold text-foreground">{appointment.date} às {appointment.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <MapPin className="size-4 text-primary" />
            <div>
              <span className="text-xs text-muted-foreground block">Filial</span>
              <span className="font-semibold text-foreground">{appointment.branch?.name || "Sem Filial"}</span>
            </div>
          </div>
        </div>
      </div>

      <ResultForm appointmentId={appointment._id.toString()} patientName={appointment.patient} patientCpf={appointment.cpf} />
    </div>
  );
}
