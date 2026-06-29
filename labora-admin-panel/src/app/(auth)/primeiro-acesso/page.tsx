"use client";

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { FlaskConical, ArrowRight, Loader2, Eye, EyeOff, KeyRound, ChevronLeft } from "lucide-react";
import { setFirstAccessPassword } from '@/actions/auth';

const initialState = {
  success: false,
  error: '',
  usernameOrEmail: '',
};

export default function PrimeiroAcessoPage() {
  const [state, formAction, isPending] = useActionState(setFirstAccessPassword, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12" style={{ background: "var(--gradient-primary)" }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-md text-primary-foreground">
          <div className="size-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-8">
            <KeyRound className="size-6" />
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-tight leading-tight">
            Defina sua senha e comece a usar.
          </h2>
          <p className="mt-4 text-primary-foreground/80 leading-relaxed text-sm">
            Sua conta foi criada por um administrador. Crie uma senha forte para acessar o painel.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6"
            style={{ textDecoration: 'none' }}
          >
            <ChevronLeft className="size-3.5" /> Voltar para o login
          </Link>

          <div className="lg:hidden size-11 rounded-xl flex items-center justify-center text-primary-foreground mb-6" style={{ background: "var(--gradient-primary)" }}>
            <FlaskConical className="size-5" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Primeiro acesso</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Defina a senha que você usará para entrar no painel.
          </p>

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
                placeholder="Ex: joaosilva ou joao@labora.com.br"
                className="w-full h-11 px-3.5 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Nova senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="Mínimo de 8 caracteres"
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

            <div>
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  minLength={8}
                  placeholder="Repita a senha"
                  className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-lg text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition-opacity mt-6 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Definir senha e entrar <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
