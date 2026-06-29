"use client";

import React, { useState } from "react";
import { User, Lock, Save, Shield, Eye, EyeOff } from "lucide-react";
import { updateProfile } from "@/actions/user";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ConfiguracoesClient({ user }: { user: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"perfil" | "seguranca">("perfil");

  const formatPhone = (value: string) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (_, d1, d2, d3) => {
        let r = "";
        if (d1) r += `(${d1}`;
        if (d2) r += `) ${d2}`;
        if (d3) r += `-${d3}`;
        return r;
      });
    }
    return digits.replace(/(\d{2})(\d{0,5})(\d{0,4})/, (_, d1, d2, d3) => {
      let r = "";
      if (d1) r += `(${d1}`;
      if (d2) r += `) ${d2}`;
      if (d3) r += `-${d3}`;
      return r;
    }).slice(0, 15);
  };
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: formatPhone(user?.phoneNumber || ""),
    oldPassword: "",
    password: "",
    confirmPassword: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (activeTab === "seguranca") {
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: "error", text: "As senhas não conferem." });
        return;
      }
      if (formData.password.length < 8) {
        setMessage({ type: "error", text: "A senha deve ter pelo menos 8 caracteres." });
        return;
      }
    }

    setIsSubmitting(true);

    const payload = activeTab === "perfil" 
      ? { name: formData.name, username: formData.username, email: formData.email, phoneNumber: formData.phoneNumber }
      : { oldPassword: formData.oldPassword, password: formData.password };

    const adminId = user._id || user.userId || user.id;
    const result = await updateProfile(adminId, payload);

    setIsSubmitting(false);

    if (result.success) {
      setMessage({ type: "success", text: "Configurações salvas com sucesso!" });
      if (activeTab === "seguranca") {
        setFormData({ ...formData, oldPassword: "", password: "", confirmPassword: "" });
      }
    } else {
      setMessage({ type: "error", text: result.error || "Erro ao salvar configurações." });
    }
  };

  const userRoleText = user?.scope === 'SYSTEM' ? 'Super Admin' : 
                       user?.scope === 'LAB' ? 'Admin da Rede' : 
                       user?.scope === 'BRANCH' ? 'Admin da Filial' : 'Técnico';

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1 text-sm">Gerencie seu perfil e credenciais de acesso</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Tabs - Segmented Control */}
        <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-2xl w-fit mx-auto border border-border/50">
          <button
            onClick={() => { setActiveTab("perfil"); setMessage(null); }}
            className={cn(
              "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
              activeTab === "perfil" 
                ? "bg-background shadow-soft text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <User className="size-4" />
            Meu Perfil
          </button>
          <button
            onClick={() => { setActiveTab("seguranca"); setMessage(null); }}
            className={cn(
              "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
              activeTab === "seguranca" 
                ? "bg-background shadow-soft text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Lock className="size-4" />
            Segurança
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full">
          <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {activeTab === "perfil" ? <User className="size-5 text-primary" /> : <Lock className="size-5 text-primary" />}
                {activeTab === "perfil" ? "Informações do Perfil" : "Alterar Senha"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "perfil" 
                  ? "Atualize seus dados pessoais e informações de contato." 
                  : "Mantenha sua conta segura atualizando sua senha periodicamente."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {message && (
                <div className={`p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                  {message.text}
                </div>
              )}

              {activeTab === "perfil" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Nome Completo</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Nome de Usuário</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        required
                        className="w-full h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">E-mail</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Telefone</label>
                      <input
                        type="text"
                        value={formData.phoneNumber}
                        onChange={e => setFormData({ ...formData, phoneNumber: formatPhone(e.target.value) })}
                        required
                        className="w-full h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-xl border border-border bg-muted/20 flex items-start gap-3">
                    <Shield className="size-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Nível de Acesso: {userRoleText}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Para alterar seu nível de acesso, entre em contato com o administrador do sistema.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "seguranca" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Senha Antiga</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        value={formData.oldPassword}
                        onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                        required
                        placeholder="Sua senha atual"
                        className="w-full h-11 px-3 pr-10 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showOldPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                        placeholder="Mínimo de 8 caracteres"
                        className="w-full h-11 px-3 pr-10 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-1.5 block">Confirmar Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        placeholder="Repita a nova senha"
                        className="w-full h-11 px-3 pr-10 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-lg text-white font-semibold flex items-center gap-2 shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Save className="size-4" />
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
