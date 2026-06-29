"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createExam } from "@/actions/exam";

export default function NovoExameClient({ categories = [] }: { categories?: string[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Sangue",
    price: "",
    duration: "24h",
    sampleType: "",
    preparationInstructions: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0
    };

    const result = await createExam(payload);
    
    if (result.success) {
      router.push("/exames");
    } else {
      alert(`Erro ao criar exame: ${result.error}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/exames"
          className="size-10 flex items-center justify-center rounded-full bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Novo Exame</h1>
          <p className="text-muted-foreground mt-1 text-sm">Preencha os detalhes para cadastrar um novo exame</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                Nome do Exame <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                placeholder="Ex: Hemograma Completo"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                Categoria <span className="text-destructive">*</span>
              </label>
              {!isNewCategory ? (
                <div className="flex gap-2">
                  <select
                    required
                    value={formData.category}
                    onChange={e => {
                      if (e.target.value === "new_category") {
                        setIsNewCategory(true);
                        setFormData({ ...formData, category: "" });
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="flex-1 h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all cursor-pointer"
                  >
                    <option value="" disabled>Selecione uma categoria...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="new_category" className="font-semibold text-primary">+ Adicionar nova categoria</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1 h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                    placeholder="Digite a nova categoria..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewCategory(false);
                      setFormData({ ...formData, category: categories[0] || "Sangue" });
                    }}
                    className="h-11 px-3 rounded-lg border border-border bg-muted/40 hover:bg-muted text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                Preço Base (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                Prazo Estimado (Duração)
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                placeholder="Ex: 24h, 2 dias"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                Tipo de Amostra
              </label>
              <input
                type="text"
                value={formData.sampleType}
                onChange={e => setFormData({ ...formData, sampleType: e.target.value })}
                className="w-full h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                placeholder="Ex: Sangue venoso, Urina matinal"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                Instruções de Preparo
              </label>
              <textarea
                value={formData.preparationInstructions}
                onChange={e => setFormData({ ...formData, preparationInstructions: e.target.value })}
                className="w-full p-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all resize-none h-24"
                placeholder="Ex: Jejum de 8 horas, não realizar exercícios intensos..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all resize-none h-24"
                placeholder="Breve descrição do objetivo clínico do exame..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
            <Link
              href="/exames"
              className="h-11 px-6 rounded-lg flex items-center justify-center font-semibold border border-border hover:bg-muted text-sm transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-lg text-white font-semibold flex items-center gap-2 shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Save className="size-4" />
              {isSubmitting ? "Salvando..." : "Salvar Exame"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
