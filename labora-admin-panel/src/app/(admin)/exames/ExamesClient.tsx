"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Droplet, FlaskConical, Activity, TestTube } from "lucide-react";

type Category = "Sangue" | "Urina" | "Hormonal" | "Imagem";

interface Exam {
  _id: string;
  name: string;
  category: Category;
  price: number;
  duration: string;
  active: boolean;
}

const categoryStyles: Record<Category, { bg: string; text: string; icon: any }> = {
  Sangue: { bg: "bg-destructive/15", text: "text-destructive", icon: Droplet },
  Urina: { bg: "bg-warning/15", text: "text-warning", icon: FlaskConical },
  Hormonal: { bg: "bg-primary/15", text: "text-primary", icon: Activity },
  Imagem: { bg: "bg-accent", text: "text-accent-foreground", icon: TestTube },
};

interface ExamesClientProps {
  exams: Exam[];
}

export default function ExamesClient({ exams }: ExamesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      (e.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExams = exams.length;
  const activeExamsList = exams.filter((e) => e.active);
  const activeExams = activeExamsList.length;
  const uniqueCategories = new Set(exams.map((e) => e.category)).size;
  const avgPrice = activeExams > 0 ? activeExamsList.reduce((acc, e) => acc + (e.price || 0), 0) / activeExams : 0;

  const counts = [
    { label: "Exames cadastrados", value: totalExams.toString() },
    { label: "Ativos", value: activeExams.toString() },
    { label: "Categorias", value: uniqueCategories.toString() },
    { label: "Preço médio", value: `R$ ${avgPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Catálogo de Exames</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie os exames oferecidos pelo laboratório</p>
        </div>
        <Link
          href="/exames/novo"
          className="h-10 px-4 rounded-lg text-primary-foreground text-sm font-medium flex items-center gap-2 shadow-glow cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="size-4" /> Novo Exame
        </Link>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {counts.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className="text-2xl font-semibold font-display mt-1">{c.value}</div>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:outline-none text-sm cursor-pointer"
        >
          <option value="all">Todas as Categorias</option>
          {Array.from(new Set(exams.map((e) => e.category))).filter(Boolean).sort().map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
                <th className="px-6 py-3.5 font-medium">Nome do Exame</th>
                <th className="px-6 py-3.5 font-medium">Categoria</th>
                <th className="px-6 py-3.5 font-medium">Preço Base</th>
                <th className="px-6 py-3.5 font-medium">Prazo</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    Nenhum exame encontrado.
                  </td>
                </tr>
              ) : (
                filteredExams.map((e) => {
                  const cat = categoryStyles[e.category] || { bg: "bg-muted", text: "text-muted-foreground", icon: Activity };
                  const Icon = cat.icon;
                  return (
                    <tr key={e._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{e.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
                          <Icon className="size-3" />
                          {e.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium tabular-nums">
                        R$ {(e.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground tabular-nums">{e.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${e.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                          <span className={`size-1.5 rounded-full ${e.active ? "bg-success" : "bg-muted-foreground"}`} />
                          {e.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <button className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer" title="Editar">
                            <Pencil className="size-4" />
                          </button>
                          <button className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors cursor-pointer" title="Remover">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
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
