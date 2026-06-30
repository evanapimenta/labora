"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  CalendarCheck,
  XCircle,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart2,
} from "lucide-react";

import { getConsolidatedDashboardData } from "@/actions/dashboard";
import TopBranchesPieChart from "@/components/dashboard/TopBranchesPieChart";
import VolumeExamesBarChart from "@/components/dashboard/VolumeExamesBarChart";
import ExportButton from "@/components/dashboard/ExportButton";

const statusStyles: Record<string, string> = {
  "Realizado": "bg-success/15 text-success",
  "Check-in": "bg-warning/15 text-warning",
  "Confirmado": "bg-primary/15 text-primary",
  "Cancelado": "bg-destructive/15 text-destructive",
  "Pendente": "bg-muted text-muted-foreground",
  "Aguardando Resultado": "bg-warning/15 text-warning",
  "Concluído": "bg-success/15 text-success",
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

interface DashboardClientProps {
  initialData: any;
  userName: string;
  sessionUser: any;
}

export default function DashboardClient({
  initialData,
  userName,
  sessionUser,
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState("30");
  const [statusFilter, setStatusFilter] = useState("all");

  // Sync with initialData if props change (e.g. from page/layout reload)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRange = e.target.value;
    setRange(newRange);

    // Shallow update the URL range parameter so the URL stays in sync
    router.replace(`?range=${newRange}`, { scroll: false });

    // Fetch the new data inside a transition
    startTransition(async () => {
      const newData = await getConsolidatedDashboardData(newRange);
      setData(newData);
    });
  };

  const dbMetrics = data?.metrics;
  const series = data?.chartData || Array(12).fill(0);
  const chartLabels = data?.chartLabels || ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const recentExams = data?.recentAppointments || [];

  const filteredExams = statusFilter === "all"
    ? recentExams
    : recentExams.filter((e: any) => e.status === statusFilter);

  const metrics = [
    {
      label: "Receita Total",
      value: `R$ ${dbMetrics?.totalRevenue?.toLocaleString("pt-BR") || "0"}`,
      delta: dbMetrics?.revenueDelta || "0%",
      positive: dbMetrics?.revenuePositive ?? true,
      icon: DollarSign,
      gradient: "var(--gradient-primary)"
    },
    {
      label: "Agendamentos",
      value: dbMetrics?.totalAppointments?.toString() || "0",
      delta: dbMetrics?.appointmentsDelta || "0%",
      positive: dbMetrics?.appointmentsPositive ?? true,
      icon: CalendarCheck,
      gradient: "var(--gradient-accent)"
    },
    {
      label: "Cancelamentos",
      value: dbMetrics?.totalCancellations?.toString() || "0",
      delta: dbMetrics?.cancellationsDelta || "0%",
      positive: dbMetrics?.cancellationsPositive ?? true,
      icon: XCircle,
      gradient: "var(--gradient-danger)"
    },
    {
      label: "Avaliação",
      value: dbMetrics?.rating != null ? dbMetrics.rating.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—",
      delta: dbMetrics?.ratingDelta || "+0,00",
      positive: dbMetrics?.ratingPositive ?? true,
      icon: Star,
      gradient: "var(--gradient-warm)"
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-medium text-primary mb-2 flex items-center gap-1.5">
            <Activity className="size-3.5" /> Painel consolidado
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Bom dia, {userName} <span className="gradient-text">.</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Aqui está o resumo das suas operações de hoje.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={range}
            onChange={handleRangeChange}
            className="h-10 px-4 rounded-lg bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="30">Últimos 30 dias</option>
            <option value="7">Últimos 7 dias</option>
            <option value="month">Este mês</option>
            <option value="year">Último ano</option>
          </select>
          <ExportButton range={range} />
        </div>
      </div>

      {/* METRICS SECTION */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {isPending
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft animate-pulse isolate"
                style={{ transform: "translateZ(0)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-xl bg-muted-foreground/15"></div>
                  <div className="h-4 bg-muted-foreground/15 rounded w-10"></div>
                </div>
                <div className="mt-5">
                  <div className="h-3 bg-muted-foreground/10 rounded w-20"></div>
                  <div className="h-7 bg-muted-foreground/15 rounded w-24 mt-2"></div>
                </div>
              </div>
            ))
          : metrics.map((m) => {
              const Icon = m.icon;
              const Arrow = m.positive ? ArrowUpRight : ArrowDownRight;
              return (
                <div
                  key={m.label}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft group hover:shadow-elevated transition-shadow isolate"
                  style={{ transform: "translateZ(0)" }}
                >
                  <div className="absolute -top-12 -right-12 size-32 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" style={{ background: m.gradient }} />
                  <div className="flex items-start justify-between relative">
                    <div className="size-10 rounded-xl flex items-center justify-center text-white" style={{ background: m.gradient }}>
                      <Icon className="size-5" />
                    </div>
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${m.positive ? "text-success" : "text-destructive"}`}>
                      <Arrow className="size-3" /> {m.delta}
                    </span>
                  </div>
                  <div className="mt-5 relative">
                    <div className="text-xs text-muted-foreground">{m.label}</div>
                    <div className="text-2xl font-semibold font-display mt-1 tracking-tight">{m.value}</div>
                  </div>
                </div>
              );
            })}
      </section>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2 flex">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft flex flex-col w-full">
            {isPending ? (
              <div className="flex-1 min-h-[350px] flex flex-col justify-between animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="h-5 bg-muted-foreground/15 rounded w-32"></div>
                    <div className="h-3 bg-muted-foreground/10 rounded w-48 mt-1.5"></div>
                  </div>
                  <div className="h-6 bg-muted-foreground/15 rounded w-20"></div>
                </div>
                <div className="flex-1 bg-muted-foreground/10 rounded-xl flex items-center justify-center">
                  <BarChart2 className="size-8 text-muted-foreground/20 animate-bounce" />
                </div>
              </div>
            ) : (
              <VolumeExamesBarChart
                series={series}
                chartLabels={chartLabels}
                tooltipLabels={data.chartTooltipLabels || chartLabels}
                periodLabel={data.chartPeriodLabel || "Últimos 30 dias"}
                appointmentsDelta={dbMetrics?.appointmentsDelta || "0%"}
                appointmentsPositive={dbMetrics?.appointmentsPositive ?? true}
                topExams={data.chartTopExams || Array(12).fill([])}
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display font-semibold mb-1">Top filiais</h3>
          <p className="text-xs text-muted-foreground mb-5">Por receita no período</p>
          {isPending ? (
            <div className="h-64 bg-muted-foreground/10 rounded-xl animate-pulse flex items-center justify-center">
              <div className="size-36 rounded-full border-8 border-muted-foreground/15 border-t-transparent animate-spin"></div>
            </div>
          ) : (
            <TopBranchesPieChart branches={data.topBranches || []} />
          )}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="mt-5 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-border">
          <div>
            <h3 className="font-display font-semibold">Exames recentes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Atualizado há 2 minutos</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 rounded-lg bg-muted/60 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer font-medium text-foreground"
            >
              <option value="all">Todos os Status</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Check-in">Check-in</option>
              <option value="Aguardando Resultado">Aguardando Resultado</option>
              <option value="Realizado">Realizado</option>
              <option value="Pendente">Pendente</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <Link href="/agendamentos" className="text-xs font-medium text-primary hover:underline cursor-pointer">Ver todos</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-6 py-3">Paciente</th>
                <th className="text-left font-medium px-6 py-3">Exame</th>
                <th className="text-left font-medium px-6 py-3">Filial</th>
                <th className="text-left font-medium px-6 py-3">Data/Hora</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
              </tr>
            </thead>
            {isPending ? (
              <tbody className="animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-6 py-3.5"><div className="h-4 bg-muted-foreground/15 rounded w-32"></div></td>
                    <td className="px-6 py-3.5"><div className="h-4 bg-muted-foreground/15 rounded w-48"></div></td>
                    <td className="px-6 py-3.5"><div className="h-4 bg-muted-foreground/15 rounded w-24"></div></td>
                    <td className="px-6 py-3.5"><div className="h-4 bg-muted-foreground/15 rounded w-28"></div></td>
                    <td className="px-6 py-3.5"><div className="h-5 bg-muted-foreground/15 rounded-full w-20"></div></td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      Nenhum exame recente encontrado com este status.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((e: any, i: number) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium">{e.patient}</td>
                      <td className="px-6 py-3.5 text-muted-foreground max-w-[240px] truncate" title={e.exam}>{e.exam}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{e.branch}</td>
                      <td className="px-6 py-3.5 text-muted-foreground tabular-nums">
                        {e.date ? `${formatDate(e.date)} - ` : ""}{e.time}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyles[e.status] || "bg-muted text-muted-foreground"}`}>{e.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h3 className="font-display font-semibold mb-1">Categorias de exames</h3>
        <p className="text-xs text-muted-foreground mb-5">Por receita no período</p>
        {isPending ? (
          <div className="h-64 bg-muted-foreground/10 rounded-xl animate-pulse flex items-center justify-center">
            <div className="size-36 rounded-full border-8 border-muted-foreground/15 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <TopBranchesPieChart branches={data.topCategories || []} inline />
        )}
      </div>
    </div>
  );
}
