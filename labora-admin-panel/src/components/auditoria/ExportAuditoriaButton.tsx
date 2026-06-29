"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function ExportAuditoriaButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/export/auditoria");
      if (!res.ok) throw new Error("Falha ao gerar CSV");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? "auditoria.csv";

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      Exportar CSV
    </button>
  );
}
