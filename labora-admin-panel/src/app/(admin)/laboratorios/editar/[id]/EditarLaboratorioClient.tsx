"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { updateLaboratory } from '@/actions/laboratory';

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
        className="w-full h-11 px-3.5 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all read-only:opacity-60 read-only:cursor-not-allowed read-only:bg-muted/80 disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}

const formatCNPJ = (val: string) => {
  let v = val.replace(/\D/g, "");
  if (v.length > 14) v = v.slice(0, 14);
  return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
};

const formatPhone = (val: string) => {
  let v = val.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 10) {
    return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (v.length > 6) {
    return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (v.length > 2) {
    return v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  }
  return v.replace(/^(\d*)/, "($1");
};

const formatCEP = (val: string) => {
  let v = val.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 5) {
    return v.replace(/^(\d{5})(\d{1,3}).*/, "$1-$2");
  }
  return v;
};

export default function EditarLaboratorioClient({ lab }: { lab: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [cnpj, setCnpj] = useState(formatCNPJ(lab.cnpj || ""));
  const [phone, setPhone] = useState(formatPhone(lab.phoneNumber || ""));
  const [cep, setCep] = useState(formatCEP(lab.address?.zipCode || ""));
  const [country, setCountry] = useState(lab.address?.country === "Brazil" ? "Brasil" : (lab.address?.country || "Brasil"));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const unmaskedPhone = formData.get('phone')?.toString().replace(/\D/g, '');
    const unmaskedZipCode = formData.get('zipCode')?.toString().replace(/\D/g, '');
    const unmaskedCnpj = formData.get('cnpj')?.toString().replace(/\D/g, '');

    if (unmaskedPhone) formData.set('phone', unmaskedPhone);
    if (unmaskedZipCode) formData.set('zipCode', unmaskedZipCode);
    if (unmaskedCnpj) formData.set('cnpj', unmaskedCnpj);

    const result = await updateLaboratory(lab._id, formData);

    setLoading(false);
    if (result.success) {
      alert('Laboratório atualizado com sucesso!');
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
      <h1 className="text-3xl font-semibold tracking-tight">Editar Laboratório</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-8">Atualize os dados da matriz</p>

      <form className="rounded-2xl border border-border bg-card shadow-soft p-7 space-y-8" onSubmit={handleSubmit}>
        {/* Main Data Section */}
        <section className="space-y-5">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground">Dados principais</h3>
          <Field
            label="Nome do Laboratório"
            id="name"
            name="name"
            defaultValue={lab.name}
            required
            placeholder="Ex: Labora Saúde"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="CNPJ"
              id="cnpj"
              name="cnpj"
              value={cnpj}
              readOnly
              required
              placeholder="00.000.000/0000-00"
            />
            <Field
              label="Telefone"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              required
              placeholder="(00) 00000-0000"
            />
          </div>
          <Field
            label="E-mail de contato"
            type="email"
            id="email"
            name="email"
            defaultValue={lab.email}
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
              value={cep}
              onChange={(e) => setCep(formatCEP(e.target.value))}
              required
              placeholder="00000-000"
            />
            <div className="md:col-span-2">
              <Field
                label="Logradouro (Rua, Av.)"
                id="street"
                name="street"
                defaultValue={lab.address?.street}
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
              defaultValue={lab.address?.number}
              required
              placeholder="1000"
            />
            <div className="md:col-span-2">
              <Field
                label="Complemento"
                id="complement"
                name="complement"
                defaultValue={lab.address?.complement}
                placeholder="Sala, Andar, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Bairro"
              id="neighborhood"
              name="neighborhood"
              defaultValue={lab.address?.neighborhood}
              required
              placeholder="Bela Vista"
            />
            <Field
              label="Cidade"
              id="city"
              name="city"
              defaultValue={lab.address?.city}
              required
              placeholder="São Paulo"
            />
            <Field
              label="Estado"
              id="state"
              name="state"
              defaultValue={lab.address?.state}
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
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
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
                Atualizar Laboratório
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
