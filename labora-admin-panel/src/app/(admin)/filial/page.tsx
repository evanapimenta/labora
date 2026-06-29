import React from 'react';
import { getAccessibleBranches } from '@/lib/branches';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

import { CheckCircle2, Clock, AlertCircle, DollarSign } from "lucide-react";
import FilialUpcomingClient from "./FilialUpcomingClient";

export const dynamic = 'force-dynamic';

export default async function FilialDashboardPage() {
  const { user, userBranches, activeBranch } = await getAccessibleBranches();

  if (user?.scope === 'TECH') {
    redirect('/agendamentos');
  }

  let metrics = [
    { label: "Agendamentos Hoje", value: "0", icon: Clock, gradient: "var(--gradient-primary)" },
    { label: "Realizados", value: "0", icon: CheckCircle2, gradient: "var(--gradient-success)" },
    { label: "Faltas (No-show)", value: "0", icon: AlertCircle, gradient: "var(--gradient-warm)" },
    { label: "Receita do Dia", value: "R$ 0", icon: DollarSign, gradient: "var(--gradient-accent)" },
  ];

  let upcoming: any[] = [];
  let occupationPercentage = 0;
  let occupiedSlotsCount = 0;
  const totalSlotsCapacity = 48;

  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

  if (activeBranch) {
    try {
      const response = await apiFetch(`/api/agendamentos?branchId=${activeBranch._id}&date=${todayStr}&limit=500`);
      const appointments = response.data || [];

      const totalToday = appointments.length;
      const realizadosToday = appointments.filter((a: any) => a.status === 'Realizado' || a.status === 'Concluído').length;
      const canceladosToday = appointments.filter((a: any) => a.status === 'Cancelado').length;

      const receitaToday = appointments
        .filter((a: any) => a.status === 'Realizado' || a.status === 'Concluído')
        .reduce((sum: number, a: any) => {
          const price = a.exam?.price || 0;
          return sum + price;
        }, 0);

      metrics = [
        { label: "Agendamentos Hoje", value: totalToday.toString(), icon: Clock, gradient: "var(--gradient-primary)" },
        { label: "Realizados", value: realizadosToday.toString(), icon: CheckCircle2, gradient: "var(--gradient-success)" },
        { label: "Faltas (No-show)", value: canceladosToday.toString(), icon: AlertCircle, gradient: "var(--gradient-warm)" },
        { label: "Receita do Dia", value: `R$ ${receitaToday.toLocaleString('pt-BR')}`, icon: DollarSign, gradient: "var(--gradient-accent)" },
      ];

      const activeUpcoming = appointments
        .filter((a: any) => a.status !== 'Realizado' && a.status !== 'Cancelado' && a.status !== 'Concluído')
        .sort((a: any, b: any) => a.time.localeCompare(b.time));

      upcoming = activeUpcoming.map((a: any, i: number) => ({
        _id: a._id,
        time: a.time,
        patient: a.patient,
        exam: a.exam?.name || "Exame Indefinido",
        status: a.status,
        room: `Sala 0${(i % 3) + 1}`
      }));

      occupiedSlotsCount = totalToday;
      occupationPercentage = Math.min(100, Math.round((occupiedSlotsCount / totalSlotsCapacity) * 100));

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard da filial via API:", error);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          {activeBranch && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-success/15 text-success mb-2">
              <span className="size-1.5 rounded-full bg-success" /> Unidade ativa
            </span>
          )}
          <h1 className="text-3xl font-semibold tracking-tight">
            {activeBranch ? `Dashboard da ${activeBranch.name}` : 'Painel da Filial'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Visão operacional do dia</p>
        </div>
      </div>

      {activeBranch ? (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-elevated transition-shadow">
                  <div className="size-10 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: m.gradient }}>
                    <Icon className="size-5" />
                  </div>
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                  <div className="text-2xl font-semibold font-display mt-1">{m.value}</div>
                </div>
              );
            })}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h3 className="font-display font-semibold">Próximos agendamentos</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Linha do tempo da tarde</p>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                <FilialUpcomingClient initialUpcoming={upcoming} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold mb-4">Capacidade hoje</h3>
                <div className="flex items-center justify-center py-6">
                  <div className="relative size-40">
                    <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="10" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-primary" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${occupationPercentage * 2.64} 264`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-semibold font-display">{occupationPercentage}%</div>
                      <div className="text-[11px] text-muted-foreground">ocupação</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-center text-muted-foreground mt-4">{occupiedSlotsCount} de {totalSlotsCapacity} horários preenchidos</div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-soft">
          Por favor, selecione uma filial no menu superior para ver as estatísticas da unidade.
        </div>
      )}
    </div>
  );
}
