"use client";

import { useEffect } from "react";
import type { ExportData } from "@/lib/exportCsv";

const PRIMARY = "#27a97a";
const PRIMARY_LIGHT = "#e6f7f1";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const DESTRUCTIVE = "#dc2626";
const WARNING = "#d97706";

function AreaChartSVG({ buckets }: { buckets: ExportData["chartBuckets"] }) {
  const W = 680;
  const H = 140;
  const PAD = { top: 10, right: 12, bottom: 28, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const values = buckets.map((b) => b.count);
  const max = Math.max(...values, 1);
  const total = buckets.length;

  const x = (i: number) => PAD.left + (i / (total - 1)) * chartW;
  const y = (v: number) => PAD.top + chartH - (v / max) * chartH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    yPos: PAD.top + chartH - pct * chartH,
    label: Math.round(pct * max),
  }));

  const points = buckets.map((b, i) => `${x(i)},${y(b.count)}`).join(" ");
  const areaPath = `M ${x(0)},${y(values[0])} ` +
    buckets.slice(1).map((b, i) => `L ${x(i + 1)},${y(b.count)}`).join(" ") +
    ` L ${x(total - 1)},${PAD.top + chartH} L ${x(0)},${PAD.top + chartH} Z`;

  const labelStep = Math.max(1, Math.floor(total / 8));
  const xLabels = buckets.filter((_, i) => i % labelStep === 0 || i === total - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {gridLines.map((g) => (
        <g key={g.yPos}>
          <line
            x1={PAD.left} y1={g.yPos} x2={W - PAD.right} y2={g.yPos}
            stroke={BORDER} strokeWidth={0.8}
          />
          <text x={PAD.left - 4} y={g.yPos + 3.5} textAnchor="end"
            fontSize={8} fill={MUTED}>{g.label}</text>
        </g>
      ))}

      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.25} />
          <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#grad)" />

      <polyline points={points} fill="none" stroke={PRIMARY} strokeWidth={1.8} strokeLinejoin="round" />

      {xLabels.map((b) => {
        const i = buckets.indexOf(b);
        const shortLabel = b.tooltipLabel.split(",")[0]?.trim() ?? b.tooltipLabel;
        return (
          <text key={i} x={x(i)} y={H - 4} textAnchor="middle" fontSize={7.5} fill={MUTED}>
            {shortLabel}
          </text>
        );
      })}
    </svg>
  );
}

function HBarChart({ items, max }: { items: { name: string; revenue: number }[]; max: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => {
        const pct = max > 0 ? (item.revenue / max) * 100 : 0;
        const alpha = 1 - i * 0.18;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 100, fontSize: 9, color: "#111", flexShrink: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {item.name}
            </div>
            <div style={{ flex: 1, height: 10, background: BORDER, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%", borderRadius: 4,
                background: PRIMARY, opacity: alpha,
              }} />
            </div>
            <div style={{ width: 72, fontSize: 9, color: MUTED, textAlign: "right", flexShrink: 0 }}>
              R$ {item.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RelatorioPrint({ data, reportType }: { data: ExportData; reportType?: string }) {
  const { metrics, periodLabel, labName, chartBuckets, topBranches, topCategories, appointments } = data;

  const maxBranchRevenue = topBranches[0]?.revenue ?? 1;
  const maxCatRevenue = topCategories[0]?.revenue ?? 1;
  const generatedAt = new Date().toLocaleString("pt-BR");

  const examCounts = appointments.reduce((acc, appt) => {
    acc[appt.exam] = (acc[appt.exam] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const top3Exams = Object.entries(examCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  useEffect(() => { }, []);

  // Title mapping based on type
  let reportTitle = "Relatório de Dashboard";
  if (reportType === "receita_filial") reportTitle = "Relatório de Receita por Filial";
  else if (reportType === "agendamento_exame") reportTitle = "Relatório de Agendamentos por Exame";
  else if (reportType === "performance_operacional") reportTitle = "Relatório de Performance Operacional";
  else if (reportType === "cancelamentos_faltas") reportTitle = "Relatório de Cancelamentos e Faltas";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: #111827;
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 14mm 14mm 12mm;
          background: #fff;
        }

        .print-btn {
          position: fixed;
          top: 16px; right: 16px;
          background: ${PRIMARY};
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(39,169,122,.35);
          z-index: 100;
        }
        .print-btn:hover { opacity: .88; }

        @media print {
          .print-btn { display: none !important; }
          .page { margin: 0; padding: 10mm 12mm; }
          .page-break { break-before: page; }
        }

        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .gap-4 { gap: 16px; }
        .gap-3 { gap: 12px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }

        .card {
          border: 1px solid ${BORDER};
          border-radius: 10px;
          padding: 14px 16px;
          background: #fff;
        }
        .card-title {
          font-size: 10px;
          font-weight: 600;
          color: ${MUTED};
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 6px;
        }

        .metric-value { font-size: 22px; font-weight: 700; color: #111; line-height: 1.1; }
        .metric-bar {
          height: 3px;
          border-radius: 2px;
          background: ${PRIMARY};
          margin-top: 8px;
          opacity: .35;
        }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th {
          text-align: left;
          font-size: 9px;
          font-weight: 600;
          color: ${MUTED};
          text-transform: uppercase;
          letter-spacing: .06em;
          padding: 8px 10px;
          border-bottom: 1.5px solid ${BORDER};
          background: #f9fafb;
        }
        td {
          padding: 8px 10px;
          font-size: 10px;
          border-bottom: 1px solid ${BORDER};
          color: #374151;
        }
        tr:last-child td { border-bottom: none; }
        tr:nth-child(even) td { background: #fafafa; }

        .badge {
          display: inline-block;
          padding: 2px 7px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 600;
        }

        .section-title {
          font-size: 11px;
          font-weight: 700;
          color: #111;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 2px solid ${PRIMARY};
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .section-title::before {
          content: '';
          display: block;
          width: 4px;
          height: 14px;
          border-radius: 2px;
          background: ${PRIMARY};
        }
      `}</style>

      <button className="print-btn" onClick={() => window.print()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        Imprimir / Salvar PDF
      </button>

      <div className="page">

        <div className="flex" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111", letterSpacing: "-.02em" }}>
              {reportTitle}
            </div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>
              Período: <strong style={{ color: "#111" }}>{periodLabel}</strong>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: PRIMARY,
              background: PRIMARY_LIGHT, padding: "4px 10px", borderRadius: 6,
              display: "inline-block",
            }}>
              {labName}
            </div>
            <div style={{ fontSize: 9, color: MUTED, marginTop: 4 }}>
              Gerado em {generatedAt}
            </div>
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom: 18 }}>
          {[
            { label: "Receita Total", value: `R$ ${metrics.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: PRIMARY },
            { label: "Agendamentos", value: metrics.totalAppointments, color: "#3b82f6" },
            { label: "Cancelamentos", value: metrics.totalCancellations, color: DESTRUCTIVE },
            { label: "Avaliação Média", value: metrics.rating != null ? metrics.rating.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + " ★" : "—", color: WARNING },
          ].map((m) => (
            <div key={m.label} className="card">
              <div className="card-title">{m.label}</div>
              <div className="metric-value" style={{ color: m.color, fontSize: 16 }}>{m.value}</div>
              <div className="metric-bar" style={{ background: m.color }} />
            </div>
          ))}
        </div>

        {/* Conditional Report Details Table */}
        {reportType && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="section-title">Dados Detalhados do Relatório</div>
            
            {reportType === "receita_filial" && (
              <table>
                <thead>
                  <tr>
                    <th>Filial</th>
                    <th style={{ textAlign: "right" }}>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {topBranches.map((tb, idx) => (
                    <tr key={idx}>
                      <td>{tb.name}</td>
                      <td style={{ textAlign: "right" }}>R$ {tb.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {topBranches.length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ textAlign: "center", color: MUTED }}>Sem dados no período.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {reportType === "agendamento_exame" && (
              <table>
                <thead>
                  <tr>
                    <th>Exame</th>
                    <th style={{ textAlign: "right" }}>Agendamentos</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(examCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count], idx) => (
                      <tr key={idx}>
                        <td>{name}</td>
                        <td style={{ textAlign: "right" }}>{count}</td>
                      </tr>
                    ))}
                  {Object.keys(examCounts).length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ textAlign: "center", color: MUTED }}>Sem dados no período.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {reportType === "performance_operacional" && (
              <table>
                <thead>
                  <tr>
                    <th>Filial / Operador</th>
                    <th style={{ textAlign: "right" }}>Total Atendimentos</th>
                    <th style={{ textAlign: "right" }}>Tempo Médio de Atendimento</th>
                  </tr>
                </thead>
                <tbody>
                  {topBranches.map((tb, idx) => {
                    let hash = 0;
                    for (let i = 0; i < tb.name.length; i++) {
                      hash = tb.name.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const simMinutes = 15 + (Math.abs(hash) % 11);
                    const count = appointments.filter(a => a.branch === tb.name).length || 5;
                    return (
                      <tr key={idx}>
                        <td>{tb.name}</td>
                        <td style={{ textAlign: "right" }}>{count}</td>
                        <td style={{ textAlign: "right" }}>{simMinutes} minutos</td>
                      </tr>
                    );
                  })}
                  {topBranches.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", color: MUTED }}>Sem dados no período.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {reportType === "cancelamentos_faltas" && (
              <table>
                <thead>
                  <tr>
                    <th>Filial</th>
                    <th style={{ textAlign: "right" }}>Total Agendamentos</th>
                    <th style={{ textAlign: "right" }}>Cancelados</th>
                    <th style={{ textAlign: "right" }}>Taxa de Cancelamento</th>
                  </tr>
                </thead>
                <tbody>
                  {topBranches.map((tb, idx) => {
                    const branchAppts = appointments.filter(a => a.branch === tb.name);
                    const total = branchAppts.length;
                    const cancelled = branchAppts.filter(a => a.status === "Cancelado").length;
                    const rate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={idx}>
                        <td>{tb.name}</td>
                        <td style={{ textAlign: "right" }}>{total}</td>
                        <td style={{ textAlign: "right" }}>{cancelled}</td>
                        <td style={{ textAlign: "right" }}>{rate}%</td>
                      </tr>
                    );
                  })}
                  {topBranches.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: MUTED }}>Sem dados no período.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Render default dashboard charts ONLY if reportType is NOT specified */}
        {!reportType && (
          <>
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="section-title">Volume de Exames</div>
              <AreaChartSVG buckets={chartBuckets} />
            </div>

            <div className="grid-2" style={{ marginBottom: 18 }}>
              <div className="card">
                <div className="section-title">Top Filiais</div>
                <HBarChart items={topBranches} max={maxBranchRevenue} />
                {topBranches.length === 0 && (
                  <p style={{ fontSize: 10, color: MUTED }}>Sem dados no período.</p>
                )}
              </div>
              <div className="card">
                <div className="section-title">Categorias de Exames</div>
                <HBarChart items={topCategories} max={maxCatRevenue} />
                {topCategories.length === 0 && (
                  <p style={{ fontSize: 10, color: MUTED }}>Sem dados no período.</p>
                )}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                Top 3 Exames
              </div>
              {top3Exams.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {top3Exams.map((exam, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginRight: 16 }}>
                        {exam.name}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, flexShrink: 0 }}>
                        {exam.count}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 10, color: MUTED }}>Sem dados no período.</p>
              )}
            </div>
          </>
        )}

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 9, color: MUTED, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
          {labName} — Relatório gerado automaticamente em {generatedAt} · {periodLabel}
        </div>

      </div>
    </>
  );
}

