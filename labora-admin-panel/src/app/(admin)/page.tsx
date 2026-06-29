import Link from "next/link";
import { redirect } from "next/navigation";
import {
  DollarSign,
  CalendarCheck,
  XCircle,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

import { getConsolidatedDashboardData } from "@/actions/dashboard";
import RangeFilter from "@/components/dashboard/RangeFilter";
import TopBranchesPieChart from "@/components/dashboard/TopBranchesPieChart";
import VolumeExamesBarChart from "@/components/dashboard/VolumeExamesBarChart";
import ExportButton from "@/components/dashboard/ExportButton";
import StatusFilter from "@/components/dashboard/StatusFilter";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/session";

export const dynamic = "force-dynamic";

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

interface PageProps {
  searchParams: Promise<{
    range?: string;
    status?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { range, status } = await searchParams;

  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const sessionUser = session ? await verifyToken(session) : null;

  if (sessionUser?.scope === 'TECH') {
    redirect('/agendamentos');
  }

  const data = await getConsolidatedDashboardData(range);
  const userName: string = sessionUser?.name?.split(" ")[0] ?? "Usuário";
  const dbMetrics = data.metrics;
  const series = data.chartData || Array(12).fill(0);
  const chartLabels = data.chartLabels || ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const max = Math.max(...series) || 1;
  const recentExams = data.recentAppointments || [];

  const selectedStatus = status || "all";
  const filteredExams = selectedStatus === "all"
    ? recentExams
    : recentExams.filter((e: any) => e.status === selectedStatus);

  const metrics = [
    {
      label: "Receita Total",
      value: `R$ ${dbMetrics?.totalRevenue.toLocaleString("pt-BR") || "0"}`,
      delta: dbMetrics?.revenueDelta || "0%",
      positive: dbMetrics?.revenuePositive ?? true,
      icon: DollarSign,
      gradient: "var(--gradient-primary)"
    },
    {
      label: "Agendamentos",
      value: dbMetrics?.totalAppointments.toString() || "0",
      delta: dbMetrics?.appointmentsDelta || "0%",
      positive: dbMetrics?.appointmentsPositive ?? true,
      icon: CalendarCheck,
      gradient: "var(--gradient-accent)"
    },
    {
      label: "Cancelamentos",
      value: dbMetrics?.totalCancellations.toString() || "0",
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
          <RangeFilter currentRange={range || "30"} />
          <ExportButton range={range} />
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          const Arrow = m.positive ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={m.label} className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft group hover:shadow-elevated transition-shadow isolate" style={{ transform: "translateZ(0)" }}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">

        <div className="lg:col-span-2 flex">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft flex flex-col w-full">
            <VolumeExamesBarChart
              series={series}
              chartLabels={chartLabels}
              tooltipLabels={data.chartTooltipLabels || chartLabels}
              periodLabel={data.chartPeriodLabel || "Últimos 30 dias"}
              appointmentsDelta={dbMetrics?.appointmentsDelta || "0%"}
              appointmentsPositive={dbMetrics?.appointmentsPositive ?? true}
              topExams={data.chartTopExams || Array(12).fill([])}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display font-semibold mb-1">Top filiais</h3>
          <p className="text-xs text-muted-foreground mb-5">Por receita no período</p>
          <TopBranchesPieChart branches={data.topBranches || []} />
        </div>

      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-border">
          <div>
            <h3 className="font-display font-semibold">Exames recentes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Atualizado há 2 minutos</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusFilter currentStatus={selectedStatus} />
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
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h3 className="font-display font-semibold mb-1">Categorias de exames</h3>
        <p className="text-xs text-muted-foreground mb-5">Por receita no período</p>
        <TopBranchesPieChart branches={data.topCategories || []} inline />
      </div>
    </div>
  );
}
