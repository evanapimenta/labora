import React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import ExportAuditoriaButton from "@/components/auditoria/ExportAuditoriaButton";
import { getAccessibleBranches } from "@/lib/branches";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Action = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "OTHER";

const actionStyles: Record<string, { text: string; bg: string }> = {
  CREATE: { text: "text-success", bg: "bg-success/10" },
  UPDATE: { text: "text-warning", bg: "bg-warning/10" },
  DELETE: { text: "text-destructive", bg: "bg-destructive/10" },
  LOGIN: { text: "text-primary", bg: "bg-primary/10" },
  LOGOUT: { text: "text-muted-foreground", bg: "bg-muted" },
  OTHER: { text: "text-muted-foreground", bg: "bg-muted" },
};

const actionIcon: Record<string, React.ReactNode> = {
  CREATE: <Plus className="size-3" />,
  UPDATE: <Pencil className="size-3" />,
  DELETE: <Trash2 className="size-3" />,
  LOGIN: <ArrowRight className="size-3" />,
  LOGOUT: <ArrowRight className="size-3" />,
  OTHER: <ArrowRight className="size-3" />,
};

export default async function AuditoriaPage() {
  const { user } = await getAccessibleBranches();

  if (user?.scope === 'TECH') {
    redirect('/agendamentos');
  }

  let logs: any[] = [];

  try {
    const rawLogs = await apiFetch('/api/audit-logs');
    logs = rawLogs.map((l: any) => ({
      id: l._id || l.id,
      createdAt: new Date(l.createdAt).toLocaleString("pt-BR"),
      action: (l.action ?? "OTHER") as string,
      entity: l.entity ?? "—",
      userName: l.user?.name ?? l.userName ?? "Sistema",
      userRole: l.user?.role ?? l.userRole ?? "",
      ip: l.ip ?? "—",
      details: l.details ?? l.description ?? "",
    }));
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria via API:', error);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-medium text-primary mb-2 flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" /> Trilha de auditoria
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Logs de auditoria <span className="gradient-text">.</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Acompanhe o histórico de ações críticas no sistema.
          </p>
        </div>
        <ExportAuditoriaButton />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-border">
          <div>
            <h3 className="font-display font-semibold">Eventos recentes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Últimos 100 registros</p>
          </div>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {logs.length} eventos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-6 py-3">Data/Hora</th>
                <th className="text-left font-medium px-6 py-3">Ação</th>
                <th className="text-left font-medium px-6 py-3">Entidade</th>
                <th className="text-left font-medium px-6 py-3">Usuário</th>
                <th className="text-left font-medium px-6 py-3">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center px-6 py-10 text-muted-foreground">
                    Nenhum log de auditoria registrado no sistema.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const s = actionStyles[log.action] ?? actionStyles["OTHER"];
                  return (
                    <tr key={log.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3.5 text-muted-foreground tabular-nums whitespace-nowrap">
                        {log.createdAt}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                          {actionIcon[log.action] ?? actionIcon["OTHER"]}
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-medium">{log.entity}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium leading-tight">{log.userName}</div>
                        {log.userRole && (
                          <div className="text-[11px] text-muted-foreground">{log.userRole}</div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground max-w-[320px] truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
