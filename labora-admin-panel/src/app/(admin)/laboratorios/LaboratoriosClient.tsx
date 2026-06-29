"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, Plus, MapPin, Phone, Building2, Edit, ToggleLeft, ToggleRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleLaboratoryStatus } from '@/actions/laboratory';
import { toggleBranchStatus } from '@/actions/branch';

function formatPhone(phone: string | undefined | null) {
  if (!phone) return 'Telefone não cadastrado';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

function formatCnpj(cnpj: string | undefined | null) {
  if (!cnpj) return 'CNPJ não cadastrado';
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  return cnpj;
}

interface LaboratoriosClientProps {
  labs: any[];
  branches: any[];
}

export default function LaboratoriosClient({ labs, branches }: LaboratoriosClientProps) {
  const [activeTab, setActiveTab] = useState<'labs' | 'branches'>('labs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleToggleLab = async (id: string) => {
    startTransition(async () => {
      await toggleLaboratoryStatus(id);
    });
  };

  const handleToggleBranch = async (id: string) => {
    startTransition(async () => {
      await toggleBranchStatus(id);
    });
  };

  const filteredLabs = labs.filter(lab =>
    lab.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.cnpj?.includes(searchQuery) ||
    lab.address?.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBranches = branches.filter(branch => {
    const labName = branch.laboratory?.name || branch.laboratoryId?.name || '';
    return (
      branch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      labName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address?.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Gestão de Rede</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie laboratórios e suas filiais</p>
        </div>
        <div className="flex gap-2.5">
          {activeTab === 'labs' ? (
            <Link href="/laboratorios/novo" className="h-10 px-4 rounded-lg text-primary-foreground text-sm font-medium flex items-center gap-2 shadow-glow hover:opacity-95 transition-opacity" style={{ background: "var(--gradient-primary)", textDecoration: 'none' }}>
              <Plus className="size-4" /> Novo Laboratório
            </Link>
          ) : (
            <Link href="/filiais/nova" className="h-10 px-4 rounded-lg text-primary-foreground text-sm font-medium flex items-center gap-2 shadow-glow hover:opacity-95 transition-opacity" style={{ background: "var(--gradient-primary)", textDecoration: 'none' }}>
              <Plus className="size-4" /> Nova Filial
            </Link>
          )}
        </div>
      </div>

      <div className="flex border-b border-border mb-6 gap-6">
        <button
          onClick={() => { setActiveTab('labs'); setSearchQuery(''); }}
          className={cn(
            "pb-3 text-sm font-semibold relative transition-colors cursor-pointer flex items-center gap-2",
            activeTab === 'labs' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="size-4" />
          Laboratórios ({labs.length})
          {activeTab === 'labs' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('branches'); setSearchQuery(''); }}
          className={cn(
            "pb-3 text-sm font-semibold relative transition-colors cursor-pointer flex items-center gap-2",
            activeTab === 'branches' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MapPin className="size-4" />
          Filiais ({branches.length})
          {activeTab === 'branches' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'labs' ? "Buscar por nome, CNPJ ou cidade..." : "Buscar por filial, laboratório ou cidade..."}
          className="w-full h-10 pl-10 pr-3 rounded-lg bg-card border border-border focus:border-ring focus:outline-none text-sm transition-colors"
        />
      </div>

      {activeTab === 'labs' ? (
        filteredLabs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-soft">
            <Building2 className="size-10 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm">Nenhum laboratório cadastrado ou encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLabs.map((lab) => {
              const labBranchesCount = branches.filter(b => {
                const bLabId = b.laboratory?.id || b.laboratoryId?._id || b.laboratoryId;
                return String(bLabId) === String(lab._id);
              }).length;
              const isAct = lab.status !== 'Inativo';
              return (
                <div key={lab._id} className={cn("group rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between", !isAct && "opacity-75 bg-muted/20")}>
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("size-11 rounded-xl flex items-center justify-center text-white", isAct ? "shadow-glow" : "grayscale")} style={{ background: isAct ? "var(--gradient-primary)" : "var(--muted-foreground)" }}>
                        <Building2 className="size-5" />
                      </div>
                      <div className="flex gap-0.5">
                        <Link href={`/laboratorios/editar/${lab._id}`} className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer" aria-label="Editar">
                          <Edit className="size-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleLab(lab._id)}
                          disabled={isPending}
                          className={cn(
                            "size-8 rounded-md hover:bg-muted flex items-center justify-center transition-colors cursor-pointer",
                            isAct ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted"
                          )}
                          title={isAct ? "Desativar Laboratório" : "Ativar Laboratório"}
                        >
                          {isAct ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                        </button>
                      </div>
                    </div>
                    <h3 className="font-display font-semibold text-lg truncate" title={lab.name}>{lab.name}</h3>
                    <div className="mt-1 text-xs text-muted-foreground tabular-nums">{formatCnpj(lab.cnpj)}</div>

                    <div className="mt-5 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="size-3.5" /> {formatPhone(lab.phoneNumber)}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="size-3.5" /> {lab.email || 'Email não cadastrado'}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-3.5" /> {lab.address?.city || 'Cidade'}, {lab.address?.state || 'UF'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        {labBranchesCount} {labBranchesCount === 1 ? "filial" : "filiais"}
                      </span>
                      <span className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        isAct ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        {isAct ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <button className="text-xs font-semibold text-primary hover:underline cursor-pointer">Gerenciar →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        filteredBranches.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-soft">
            <MapPin className="size-10 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm">Nenhuma filial cadastrada ou encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBranches.map((branch) => {
              const isAct = branch.status !== 'Inativa';
              return (
                <div key={branch._id} className={cn("group rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between", !isAct && "opacity-75 bg-muted/20")}>
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("size-11 rounded-xl flex items-center justify-center text-white", isAct ? "shadow-glow" : "grayscale")} style={{ background: isAct ? "var(--gradient-accent)" : "var(--muted-foreground)" }}>
                        <MapPin className="size-5" />
                      </div>
                      <div className="flex gap-0.5">
                        <Link href={`/filiais/editar/${branch._id}`} className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer" aria-label="Editar">
                          <Edit className="size-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleBranch(branch._id)}
                          disabled={isPending}
                          className={cn(
                            "size-8 rounded-md hover:bg-muted flex items-center justify-center transition-colors cursor-pointer",
                            isAct ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted"
                          )}
                          title={isAct ? "Desativar Filial" : "Ativar Filial"}
                        >
                          {isAct ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                        </button>
                      </div>
                    </div>
                    <h3 className="font-display font-semibold text-lg truncate" title={branch.name}>{branch.name}</h3>
                    <div className="mt-1">
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground truncate max-w-[200px]" title={branch.laboratory?.name || branch.laboratoryId?.name}>
                        {branch.laboratory?.name || branch.laboratoryId?.name || 'Sem Laboratório'}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="size-3.5" /> {formatPhone(branch.phoneNumber)}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-3.5" /> {branch.address?.city || 'Cidade'}, {branch.address?.state || 'UF'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full",
                      isAct ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    )}>
                      {branch.status || 'Inativa'}
                    </span>
                    <button className="text-xs font-semibold text-primary hover:underline cursor-pointer">Ver agenda →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
