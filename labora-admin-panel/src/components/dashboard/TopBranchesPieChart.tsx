"use client";

import React, { useState, useRef } from "react";

interface BranchData {
  name: string;
  revenue: number;
}

interface TopBranchesPieChartProps {
  branches: BranchData[];
  inline?: boolean;
}

export default function TopBranchesPieChart({ branches = [], inline = false }: TopBranchesPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const validBranches = branches.filter((b) => b && b.name && b.revenue > 0);
  const totalRevenue = validBranches.reduce((sum, b) => sum + b.revenue, 0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const getTooltipStyle = () => {
    const containerWidth = containerRef.current?.offsetWidth ?? 300;
    const TOOLTIP_WIDTH = 185;
    const wouldOverflowRight = tooltipPos.x + 12 + TOOLTIP_WIDTH > containerWidth;
    return {
      left: wouldOverflowRight ? tooltipPos.x - 12 : tooltipPos.x + 12,
      top: tooltipPos.y - 12,
      transform: wouldOverflowRight
        ? "translate3d(-100%, -100%, 0)"
        : "translate3d(0, -100%, 0)",
      backgroundColor: "var(--color-card)",
    };
  };

  const size = 200;
  const center = size / 2;
  const outerRadius = 80;
  const innerRadius = 50;

  let currentAngle = 0;
  const slices = validBranches.map((b, i) => {
    const percentage = totalRevenue > 0 ? (b.revenue / totalRevenue) * 100 : 0;
    const sliceAngle = percentage === 100 ? 359.99 : (b.revenue / totalRevenue) * 360;

    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const midAngle = startAngle + sliceAngle / 2;
    const midAngleRad = ((midAngle - 90) * Math.PI) / 180;

    const breakoutDistance = 6;
    const tx = Math.cos(midAngleRad) * breakoutDistance;
    const ty = Math.sin(midAngleRad) * breakoutDistance;

    const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
    const endAngleRad = ((endAngle - 90) * Math.PI) / 180;

    const xOutStart = center + outerRadius * Math.cos(startAngleRad);
    const yOutStart = center + outerRadius * Math.sin(startAngleRad);
    const xOutEnd = center + outerRadius * Math.cos(endAngleRad);
    const yOutEnd = center + outerRadius * Math.sin(endAngleRad);

    const xInStart = center + innerRadius * Math.cos(startAngleRad);
    const yInStart = center + innerRadius * Math.sin(startAngleRad);
    const xInEnd = center + innerRadius * Math.cos(endAngleRad);
    const yInEnd = center + innerRadius * Math.sin(endAngleRad);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    const pathData = `
      M ${xOutStart} ${yOutStart}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${xOutEnd} ${yOutEnd}
      L ${xInEnd} ${yInEnd}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${xInStart} ${yInStart}
      Z
    `;

    return {
      ...b,
      percentage,
      pathData,
      tx,
      ty,
      colorClass: [
        "bg-[oklch(0.62_0.16_165)]",
        "bg-[oklch(0.68_0.16_220)]",
        "bg-[oklch(0.78_0.15_70)]",
        "bg-[oklch(0.6_0.18_320)]",
      ][i % 4],
      gradientId: `donut-grad-${i}`,
      gradientRef: `url(#donut-grad-${i})`,
    };
  });

  const gradientConfigs = [
    { from: "oklch(0.62 0.16 165)", to: "oklch(0.55 0.18 195)" },
    { from: "oklch(0.68 0.16 220)", to: "oklch(0.62 0.18 270)" },
    { from: "oklch(0.78 0.15 70)", to: "oklch(0.7 0.18 35)" },
    { from: "oklch(0.6 0.18 320)", to: "oklch(0.5 0.22 360)" },
  ];

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className="relative w-full">
      {validBranches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
          Sem dados para o período
        </div>
      ) : (
        <>
          <div className={inline ? "flex items-center justify-center gap-10" : "flex flex-col items-center"}>

            <div className={`relative shrink-0 flex items-center justify-center select-none ${inline ? "w-[40%] aspect-square max-w-[300px]" : "size-[200px]"}`}>
              <svg viewBox={`0 0 ${size} ${size}`} className="size-full overflow-visible relative z-10">
                <defs>
                  {slices.map((slice, i) => {
                    const config = gradientConfigs[i % gradientConfigs.length];
                    return (
                      <linearGradient key={slice.gradientId} id={slice.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={config.from} />
                        <stop offset="100%" stopColor={config.to} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <g>
                  {slices.map((slice, i) => {
                    const isHovered = hoveredIndex === i;
                    const isAnyHovered = hoveredIndex !== null;
                    return (
                      <path
                        key={slice.name}
                        d={slice.pathData}
                        fill={slice.gradientRef}
                        className="transition-all duration-300 ease-out"
                        style={{
                          transform: isHovered ? `translate(${slice.tx}px, ${slice.ty}px)` : "translate(0, 0)",
                          opacity: isAnyHovered && !isHovered ? 0.35 : 1,
                          cursor: "pointer",
                        }}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  })}
                </g>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none">
                <span className={`uppercase tracking-wider text-muted-foreground font-semibold ${inline ? "text-[10px] sm:text-xs" : "text-[10px]"}`}>
                  Receita Total
                </span>
                <span className={`font-semibold font-display text-foreground mt-0.5 tabular-nums ${inline ? "text-sm sm:text-base" : "text-sm"}`}>
                  R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className={`space-y-1.5 ${inline ? "" : "w-full mt-6"}`}>
              {slices.map((slice, i) => (
                <div
                  key={slice.name}
                  className={`flex items-start gap-2.5 py-1.5 px-2 rounded-lg transition-all duration-200 cursor-pointer ${hoveredIndex === i ? "bg-muted/50" : "hover:bg-muted/30"
                    }`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className={`size-2 rounded-full shrink-0 mt-1 ${slice.colorClass}`} />
                  <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                    <span className="text-xs font-semibold text-foreground leading-tight truncate">
                      {slice.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] tabular-nums">
                      <span>R$ {slice.revenue.toLocaleString("pt-BR")}</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="font-bold text-primary bg-primary/10 px-1 rounded-md">
                        {slice.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hoveredIndex !== null && (
            <div
              className="absolute z-50 pointer-events-none bg-card border border-border p-3 rounded-xl shadow-elevated text-xs flex flex-col gap-1 min-w-[170px] transition-all duration-75"
              style={getTooltipStyle()}
            >
              <div className="font-semibold text-foreground border-b border-border pb-1 mb-1 truncate">
                {slices[hoveredIndex].name}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Receita:</span>
                <span className="font-medium text-foreground tabular-nums">
                  R$ {slices[hoveredIndex].revenue.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Participação:</span>
                <span className="font-bold text-primary tabular-nums">
                  {slices[hoveredIndex].percentage.toFixed(1).replace(".", ",")}%
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
