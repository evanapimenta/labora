export interface ExportData {
  periodLabel: string;
  labName: string;
  metrics: {
    totalRevenue: number;
    totalAppointments: number;
    totalCancellations: number;
    rating: number | null;
  };
  chartBuckets: Array<{ tooltipLabel: string; count: number }>;
  topBranches: Array<{ name: string; revenue: number }>;
  topCategories: Array<{ name: string; revenue: number }>;
  appointments: Array<{
    patient: string;
    exam: string;
    branch: string;
    date: string;
    time: string;
    status: string;
    price: number;
  }>;
}

function cell(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function row(...values: (string | number | null | undefined)[]): string {
  return values.map(cell).join(";");
}

function section(title: string): string {
  return `\n${cell(title)}\n`;
}

export function buildDashboardCsv(d: ExportData): string {
  const lines: string[] = [];

  lines.push("\uFEFF");

  lines.push(row("Relatório de Dashboard", d.periodLabel));
  lines.push(row("Gerado em", new Date().toLocaleString("pt-BR")));

  lines.push(section("MÉTRICAS DO PERÍODO"));
  lines.push(row("Indicador", "Valor"));
  lines.push(row("Receita Total (R$)", d.metrics.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })));
  lines.push(row("Agendamentos", d.metrics.totalAppointments));
  lines.push(row("Cancelamentos", d.metrics.totalCancellations));
  lines.push(row("Avaliação Média", d.metrics.rating != null ? d.metrics.rating.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "—"));

  lines.push(section("VOLUME DE EXAMES POR PERÍODO"));
  lines.push(row("Período", "Total de Exames"));
  d.chartBuckets.forEach(b => {
    lines.push(row(b.tooltipLabel, b.count));
  });

  lines.push(section("TOP FILIAIS (por receita)"));
  lines.push(row("Filial", "Receita (R$)"));
  d.topBranches.forEach(b => {
    lines.push(row(b.name, b.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })));
  });

  lines.push(section("CATEGORIAS DE EXAMES (por receita)"));
  lines.push(row("Categoria", "Receita (R$)"));
  d.topCategories.forEach(c => {
    lines.push(row(c.name, c.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })));
  });

  return lines.join("\n");
}
