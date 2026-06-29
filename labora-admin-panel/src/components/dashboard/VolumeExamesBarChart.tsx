"use client";

import React from "react";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Dot,
} from "recharts";

interface ExamEntry {
  name: string;
  count: number;
}

interface ChartDataPoint {
  label: string;
  tooltipLabel: string;
  total: number;
  top3: ExamEntry[];
}

interface VolumeExamesBarChartProps {
  series: number[];
  chartLabels: string[];
  tooltipLabels?: string[];
  periodLabel?: string;
  title?: string;
  appointmentsDelta: string;
  appointmentsPositive: boolean;
  topExams?: ExamEntry[][];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const { tooltipLabel, total, top3 } = payload[0].payload;

  return (
    <div className="bg-card border border-border p-3 rounded-xl shadow-elevated text-xs flex flex-col gap-1 min-w-[180px] max-w-[280px]">
      <div className="font-semibold text-foreground border-b border-border pb-1 mb-1">
        {tooltipLabel}
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">Total:</span>
        <span className="font-bold text-primary tabular-nums">{total} exames</span>
      </div>
      {top3?.length > 0 && (
        <div className="border-t border-border pt-1.5 mt-1">
          <div className="text-[9px] text-muted-foreground font-bold mb-1 uppercase tracking-wider">
            Top 3 exames
          </div>
          <ul className="space-y-1">
            {top3.map((ex, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center gap-3 text-[10px] text-foreground"
              >
                <span className="truncate flex-1 font-medium" title={ex.name}>
                  {ex.name}
                </span>
                <span className="font-bold text-primary/90 tabular-nums shrink-0">
                  {ex.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ActiveDot(props: React.ComponentProps<typeof Dot>) {
  const { cx, cy } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="var(--color-primary)"
      stroke="var(--color-card)"
      strokeWidth={2}
    />
  );
}

export default function VolumeExamesBarChart({
  series = [],
  chartLabels = [],
  tooltipLabels = [],
  periodLabel = "Últimos 30 dias",
  title = "Volume de exames",
  appointmentsDelta = "0%",
  appointmentsPositive = true,
  topExams = [],
}: VolumeExamesBarChartProps) {
  const hasData = series.some((v) => v > 0);

  const data: ChartDataPoint[] = series.map((v, i) => ({
    label: chartLabels[i] ?? String(i + 1),
    tooltipLabel: tooltipLabels[i] ?? chartLabels[i] ?? String(i + 1),
    total: v,
    top3: topExams[i] ?? [],
  }));

  return (
    <div className="w-full select-none flex flex-col flex-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{periodLabel}</p>
        </div>
        {appointmentsDelta && (
          <div
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              appointmentsPositive
                ? "text-success bg-success/10"
                : "text-destructive bg-destructive/10"
            }`}
          >
            {appointmentsPositive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {appointmentsDelta}
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground flex-1">
          <BarChart2 className="size-8 opacity-25" />
          <span className="text-sm font-medium opacity-50">
            Sem dados para o período
          </span>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                strokeOpacity={0.5}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                interval="preserveStartEnd"
                minTickGap={40}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                width={40}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "var(--color-border)",
                  strokeWidth: 1,
                  strokeDasharray: "4 2",
                }}
              />

              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={<ActiveDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
