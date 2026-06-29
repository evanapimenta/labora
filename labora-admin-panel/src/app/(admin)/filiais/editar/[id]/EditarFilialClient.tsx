"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { updateBranch } from '@/actions/branch';
import styles from '../../../laboratorios/novo/form.module.css';

export default function EditarFilialClient({ branch, labs }: { branch: any, labs: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateBranch(branch._id, formData);

    setLoading(false);
    if (result.success) {
      alert('Filial atualizada com sucesso!');
      router.push('/laboratorios');
    } else {
      alert('Erro ao atualizar: ' + result.error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/laboratorios" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors" style={{ textDecoration: 'none' }}>
        <ChevronLeft className="size-4" /> Voltar para listagem
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Editar Filial</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-8">Atualize os dados da filial</p>

      <form className="rounded-2xl border border-border bg-card shadow-soft p-7 space-y-8" onSubmit={handleSubmit}>
        {/* Main Data Section */}
        <section className="space-y-5">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground">Dados principais</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="laboratoryId" className={styles.label}>Laboratório Matriz *</label>
              <select id="laboratoryId" name="laboratoryId" className={styles.select} required defaultValue={branch.laboratoryId}>
                <option value="">Selecione um laboratório</option>
                {labs.map(lab => (
                  <option key={lab._id} value={lab._id}>{lab.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="name" className={styles.label}>Nome da Filial *</label>
              <input type="text" id="name" name="name" required className={styles.input} placeholder="Ex: Filial Centro" defaultValue={branch.name} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="phone" className={styles.label}>Telefone *</label>
              <input type="text" id="phone" name="phone" required pattern="\d{10,11}" title="Telefone com 10 ou 11 dígitos numéricos" className={styles.input} placeholder="(00) 00000-0000" defaultValue={branch.phoneNumber} />
            </div>
            <div>
              <label htmlFor="email" className={styles.label}>E-mail de contato *</label>
              <input type="email" id="email" name="email" required className={styles.input} placeholder="filial@laboratorio.com.br" defaultValue={branch.email} />
            </div>
            <div>
              <label htmlFor="openingHours" className={styles.label}>Horário de Funcionamento *</label>
              <input type="text" id="openingHours" name="openingHours" required className={styles.input} placeholder="Ex: Seg a Sex, 07:00 - 18:00" defaultValue={branch.openingHours} />
            </div>
          </div>
        </section>

        <div className="border-t border-border" />

        <section className="space-y-5">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground">Endereço da filial</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="zipCode" className={styles.label}>CEP *</label>
              <input type="text" id="zipCode" name="zipCode" required className={styles.input} placeholder="00000-000" defaultValue={branch.address?.zipCode} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="street" className={styles.label}>Logradouro (Rua, Av.) *</label>
              <input type="text" id="street" name="street" required className={styles.input} placeholder="Av. Principal" defaultValue={branch.address?.street} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="number" className={styles.label}>Número *</label>
              <input type="text" id="number" name="number" required className={styles.input} placeholder="100" defaultValue={branch.address?.number} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="complement" className={styles.label}>Complemento</label>
              <input type="text" id="complement" name="complement" className={styles.input} placeholder="Sala, Andar, etc." defaultValue={branch.address?.complement} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="neighborhood" className={styles.label}>Bairro *</label>
              <input type="text" id="neighborhood" name="neighborhood" required className={styles.input} placeholder="Centro" defaultValue={branch.address?.neighborhood} />
            </div>
            <div>
              <label htmlFor="city" className={styles.label}>Cidade *</label>
              <input type="text" id="city" name="city" required className={styles.input} placeholder="São Paulo" defaultValue={branch.address?.city} />
            </div>
            <div>
              <label htmlFor="state" className={styles.label}>Estado *</label>
              <input type="text" id="state" name="state" required maxLength={2} className={styles.input} placeholder="Ex: SP" defaultValue={branch.address?.state} />
            </div>
          </div>

          <div className="w-full md:w-1/3">
            <label htmlFor="country" className={styles.label}>País *</label>
            <input type="text" id="country" name="country" required className={styles.input} defaultValue={branch.address?.country || "Brasil"} />
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            className="h-11 px-5 rounded-lg border border-border bg-card hover:bg-muted text-sm font-semibold transition-colors cursor-pointer"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-11 px-6 rounded-lg text-primary-foreground text-sm font-semibold shadow-glow hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer"
            style={{ background: "var(--gradient-accent)" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Atualizar Filial
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
