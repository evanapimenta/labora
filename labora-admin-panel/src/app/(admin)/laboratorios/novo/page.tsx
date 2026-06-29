"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { createLaboratory } from '@/actions/laboratory';

function Field({ label, id, name, required, ...props }: { label: string; id: string; name: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-muted-foreground mb-1.5 block">
        {label} {required && "*"}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        {...props}
        className="w-full h-11 px-3.5 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
      />
    </div>
  );
}

export default function NovoLaboratorioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createLaboratory(formData);

    setLoading(false);
    if (result.success) {
      alert('Laboratório criado com sucesso!');
      router.push('/laboratorios');
    } else {
      alert('Erro ao criar: ' + result.error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/laboratorios" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors" style={{ textDecoration: 'none' }}>
        <ChevronLeft className="size-4" /> Voltar para listagem
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Novo Laboratório</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-8">Cadastre a matriz de um novo laboratório</p>

      <form className="rounded-2xl border border-border bg-card shadow-soft p-7 space-y-8" onSubmit={handleSubmit}>
        <section className="space-y-5">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground">Dados principais</h3>
          <Field
            label="Nome do Laboratório"
            id="name"
            name="name"
            required
            placeholder="Ex: Labora Saúde"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="CNPJ"
              id="cnpj"
              name="cnpj"
              required
              placeholder="00.000.000/0000-00"
            />
            <Field
              label="Telefone"
              id="phone"
              name="phone"
              required
              pattern="\d{10,11}"
              title="Telefone com 10 ou 11 dígitos numéricos"
              placeholder="(00) 00000-0000"
            />
          </div>
          <Field
            label="E-mail de contato"
            type="email"
            id="email"
            name="email"
            required
            placeholder="contato@laboratorio.com.br"
          />
        </section>

        <div className="border-t border-border" />

        <section className="space-y-5">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground">Endereço da matriz</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="CEP"
              id="zipCode"
              name="zipCode"
              required
              placeholder="00000-000"
            />
            <div className="md:col-span-2">
              <Field
                label="Logradouro (Rua, Av.)"
                id="street"
                name="street"
                required
                placeholder="Av. Paulista"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Número"
              id="number"
              name="number"
              required
              placeholder="1000"
            />
            <div className="md:col-span-2">
              <Field
                label="Complemento"
                id="complement"
                name="complement"
                placeholder="Sala, Andar, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Bairro"
              id="neighborhood"
              name="neighborhood"
              required
              placeholder="Bela Vista"
            />
            <Field
              label="Cidade"
              id="city"
              name="city"
              required
              placeholder="São Paulo"
            />
            <Field
              label="Estado"
              id="state"
              name="state"
              required
              maxLength={2}
              placeholder="Ex: SP"
            />
          </div>

          <div className="w-full md:w-1/3">
            <Field
              label="País"
              id="country"
              name="country"
              required
              defaultValue="Brasil"
            />
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
            style={{ background: "var(--gradient-primary)" }}
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
                Salvar Laboratório
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
