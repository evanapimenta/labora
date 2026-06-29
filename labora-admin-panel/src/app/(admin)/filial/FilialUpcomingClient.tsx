"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, XCircle, FlaskConical, UploadCloud } from 'lucide-react';
import { updateAppointmentStatus } from '@/actions/appointment';

type Status = "Confirmado" | "Check-in" | "Aguardando Resultado" | "Concluído" | "Realizado" | "Cancelado" | "Pendente";

interface UpcomingAppointment {
  _id: string;
  time: string;
  patient: string;
  exam: string;
  room: string;
  status: Status;
}

interface FilialUpcomingClientProps {
  initialUpcoming: UpcomingAppointment[];
}

export default function FilialUpcomingClient({ initialUpcoming }: FilialUpcomingClientProps) {
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<UpcomingAppointment[]>(initialUpcoming);
  const [isPending, startTransition] = useTransition();

  // Sync state if props change
  React.useEffect(() => {
    setUpcoming(initialUpcoming);
  }, [initialUpcoming]);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    const previousUpcoming = [...upcoming];

    // Optimistic UI update
    // If it's cancelled or completed/realizado, we might want to remove it from "Próximos agendamentos"
    // Since page.tsx filters out 'Realizado', 'Cancelado', 'Concluído'
    if (newStatus === "Cancelado" || newStatus === "Realizado" || newStatus === "Concluído") {
      setUpcoming(prev => prev.filter(app => app._id !== id));
    } else {
      setUpcoming(prev =>
        prev.map(app => (app._id === id ? { ...app, status: newStatus } : app))
      );
    }

    const result = await updateAppointmentStatus(id, newStatus);
    if (!result.success) {
      alert(`Erro: ${result.error}`);
      setUpcoming(previousUpcoming); // Revert
    } else {
      // Refresh the route to update the server component's pie chart
      startTransition(() => {
        router.refresh();
      });
    }
  };

  if (upcoming.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-muted-foreground text-sm">
        Nenhum agendamento pendente para hoje.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {upcoming.map((u, i) => (
        <div key={u._id} className="px-6 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
          <div className="text-sm font-medium tabular-nums w-14 text-primary">{u.time}</div>
          <div className="flex-1">
            <div className="font-medium text-sm flex flex-wrap items-center gap-2">
              <span>{u.patient}</span>
              {u.status === "Check-in" && (
                <span className="bg-purple-500/15 text-purple-500 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">Check-in</span>
              )}
              {u.status === "Aguardando Resultado" && (
                <span className="bg-warning/15 text-warning text-[10px] px-2.5 py-0.5 rounded-full font-semibold">Aguardando Resultado</span>
              )}
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">{u.room}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{u.exam}</div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1 justify-end ml-2">
            {u.status === "Check-in" && (
              <button
                onClick={() => handleStatusUpdate(u._id, "Aguardando Resultado")}
                className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-success transition-colors cursor-pointer"
                title="Realizar Coleta (Aguardando Resultado)"
              >
                <FlaskConical className="size-4" />
              </button>
            )}

            {(u.status === "Confirmado" || u.status === "Pendente") && (
              <button
                onClick={() => handleStatusUpdate(u._id, "Check-in")}
                className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-purple-500 transition-colors cursor-pointer"
                title="Check-in"
              >
                <Check className="size-4" />
              </button>
            )}

            {u.status === "Aguardando Resultado" && (
              <Link
                href={`/agendamentos/${u._id}/resultado`}
                className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                title="Subir Resultado"
              >
                <UploadCloud className="size-4" />
              </Link>
            )}

            <button
              onClick={() => handleStatusUpdate(u._id, "Cancelado")}
              className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              title="Cancelar"
            >
              <XCircle className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
