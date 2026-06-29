"use client";

import React, { useState, useActionState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, UserPlus } from "lucide-react";
import { registerAdmin } from '@/actions/auth';

interface RegisterClientProps {
  labs: { _id: string; labName: string }[];
  branches: { _id: string; name: string }[];
}

const initialState = {
  success: false,
  error: '',
};

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

export default function RegisterClient({ labs, branches }: RegisterClientProps) {
  const router = useRouter();
  const [scope, setScope] = useState<'LAB' | 'BRANCH' | 'TECH'>('LAB');
  const [state, formAction, isPending] = useActionState(registerAdmin, initialState);

  const isLabScope = scope === 'LAB';
  const linkLabel = isLabScope ? 'Laboratórios' : 'Filiais';

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/equipe"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        style={{ textDecoration: 'none' }}
      >
        <ChevronLeft className="size-4" /> Voltar para equipe
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Novo Administrador</h1>
      <p className="text-muted-foreground mt-1 text-sm mb-8">Registre uma nova credencial administrativa no sistema.</p>

      <form action={formAction} className="rounded-2xl border border-border bg-card shadow-soft p-7 space-y-8">
        {state?.error && (
          <div className="p-3.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20">
            {state.error}
          </div>
        )}

        <section className="space-y-5">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground">Dados Pessoais</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Nome Completo"
              id="name"
              name="name"
              required
              placeholder="João Silva"
            />
            <Field
              label="Nome de Usuário"
              id="username"
              name="username"
              required
              placeholder="joaosilva"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="E-mail"
              type="email"
              id="email"
              name="email"
              required
              placeholder="joao@labora.com.br"
            />
            <Field
              label="Telefone"
              id="phoneNumber"
              name="phoneNumber"
              required
              placeholder="11999998888"
            />
          </div>

          <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-xs text-muted-foreground leading-relaxed">
            A senha será definida pelo próprio membro no primeiro acesso ao sistema.
            Compartilhe com ele(a) o link de login e o usuário/e-mail cadastrado aqui.
          </div>
        </section>

        <div className="border-t border-border" />

        <section className="space-y-5">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground">Permissões e Vínculos</h3>

          <div>
            <label htmlFor="scope" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              Nível de Acesso (Escopo) *
            </label>
            <select
              id="scope"
              name="scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as 'LAB' | 'BRANCH' | 'TECH')}
              className="w-full h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:outline-none text-sm transition-all"
            >
              <option value="LAB">Administrador de Laboratório (Matriz)</option>
              <option value="BRANCH">Administrador de Filial</option>
              <option value="TECH">Técnico / Operador</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">
              Vincular a quais {linkLabel}? *
            </label>
            <div className="rounded-xl border border-border bg-card/50 p-4 max-h-48 overflow-y-auto space-y-2.5 custom-scroll">
              {isLabScope ? (
                labs.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4 italic">
                    Nenhum laboratório disponível
                  </div>
                ) : (
                  labs.map((lab) => (
                    <label key={lab._id} className="flex items-center gap-3 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="assignedTo"
                        value={lab._id}
                        className="size-5 rounded-md border-border bg-muted/50 text-primary focus:ring-ring focus:ring-2 focus:ring-offset-0 focus:ring-offset-background accent-primary cursor-pointer transition-all"
                      />
                      <span className="text-foreground/90 font-medium text-base">{lab.labName}</span>
                    </label>
                  ))
                )
              ) : (
                branches.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4 italic">
                    Nenhuma filial disponível
                  </div>
                ) : (
                  branches.map((branch) => (
                    <label key={branch._id} className="flex items-center gap-3 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="assignedTo"
                        value={branch._id}
                        className="size-5 rounded-md border-border bg-muted/50 text-primary focus:ring-ring focus:ring-2 focus:ring-offset-0 focus:ring-offset-background accent-primary cursor-pointer transition-all"
                      />
                      <span className="text-foreground/90 font-medium text-base">{branch.name}</span>
                    </label>
                  ))
                )
              )}
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            className="h-11 px-5 rounded-lg border border-border bg-card hover:bg-muted text-sm font-semibold transition-colors cursor-pointer"
            onClick={() => router.push('/equipe')}
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="h-11 px-6 rounded-lg text-primary-foreground text-sm font-semibold shadow-glow hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                Cadastrar Membro
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
