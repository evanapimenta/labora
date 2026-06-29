"use client";

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { FlaskConical, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { loginAdmin } from '@/actions/auth';

const initialState = {
  success: false,
  error: '',
  usernameOrEmail: '',
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12" style={{ background: "var(--gradient-primary)" }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-md text-primary-foreground">
          <div className="size-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-8">
            <FlaskConical className="size-6" />
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-tight leading-tight">
            Operação laboratorial, finalmente sem fricção.
          </h2>
          <p className="mt-4 text-primary-foreground/80 leading-relaxed text-sm">
            Gestão multi-filiais, agendamentos inteligentes e relatórios em tempo real — tudo em um único painel elegante.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { v: "+2.8k", l: "exames/dia" },
              { v: "98,4%", l: "uptime" },
              { v: "4,9", l: "satisfação" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl font-semibold font-display">{s.v}</div>
                <div className="text-xs text-primary-foreground/70">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden size-11 rounded-xl flex items-center justify-center text-primary-foreground mb-6" style={{ background: "var(--gradient-primary)" }}>
            <FlaskConical className="size-5" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Entre com sua conta administrativa</p>

          <form action={formAction} className="mt-8 space-y-4">
            {state?.error && (
              <div className="p-3.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold leading-relaxed border border-destructive/20">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="usernameOrEmail" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Usuário ou e-mail
              </label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                required
                defaultValue={state?.usernameOrEmail || ''}
                placeholder="Ex: carlossilva ou carlos@labora.com.br"
                className="w-full h-11 px-3.5 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">Senha</label>
                <Link href="/primeiro-acesso" className="text-xs text-primary hover:underline font-semibold" style={{ textDecoration: 'none' }}>Primeiro acesso?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  placeholder="Digite sua senha"
                  className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-lg text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition-opacity mt-6 cursor-pointer"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Acessar painel <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
