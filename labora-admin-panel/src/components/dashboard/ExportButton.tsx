"use client";

import { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";

interface ExportButtonProps {
  range?: string;
}

export default function ExportButton({ range }: ExportButtonProps) {
  const [csvLoading, setCsvLoading] = useState(false);

  const params = new URLSearchParams();
  if (range) params.set("range", range);

  const handleCsv = async () => {
    if (csvLoading) return;
    setCsvLoading(true);
    try {
      const res = await fetch(`/api/export/dashboard?${params.toString()}`);
      if (!res.ok) throw new Error("Falha ao gerar CSV");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? "relatorio-dashboard.csv";
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setCsvLoading(false);
    }
  };

  const handlePdf = () => {
    window.open(`/relatorio?${params.toString()}`, "_blank");
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePdf}
        className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors"
      >
        <FileText className="size-4" />
        PDF
      </button>

      <button
        onClick={handleCsv}
        disabled={csvLoading}
        className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
      >
        {csvLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        CSV
      </button>
    </div>
  );
}
