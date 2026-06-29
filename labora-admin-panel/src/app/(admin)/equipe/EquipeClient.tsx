"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Edit, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleTeamMemberStatus } from "@/actions/team";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  scope: 'SYSTEM' | 'LAB' | 'BRANCH' | 'TECH';
  assignedTo: string[];
  status: 'Ativo' | 'Pendente' | 'Inativo';
}

interface Branch {
  _id: string;
  name: string;
  laboratoryId?: any;
}

interface Laboratory {
  _id: string;
  name: string;
}

interface ActiveLab {
  _id: string;
  labName: string;
}

interface LabBranch {
  _id: string;
  name: string;
  laboratoryId?: string;
}

interface EquipeClientProps {
  initialTeam: TeamMember[];
  branches: Branch[];
  laboratories: Laboratory[];
  currentUserScope?: string;
  activeLab?: ActiveLab | null;
  labBranches?: LabBranch[];
}

const roleMap: Record<string, string> = {
  SYSTEM: "Super Admin",
  LAB: "Admin Lab",
  BRANCH: "Admin Filial",
  TECH: "Técnico",
};

const roleStyles: Record<string, string> = {
  "Super Admin": "bg-primary/15 text-primary",
  "Admin Lab": "bg-accent text-accent-foreground",
  "Admin Filial": "bg-muted text-muted-foreground",
  "Técnico": "bg-sky-500/15 text-sky-400",
};

const statusStyles: Record<string, string> = {
  "Ativo": "bg-success/15 text-success",
  "Pendente": "bg-warning/15 text-warning",
  "Inativo": "bg-muted text-muted-foreground",
};

const gradients = [
  "var(--gradient-primary)",
  "var(--gradient-accent)",
  "var(--gradient-success)",
  "var(--gradient-warm)",
  "var(--gradient-danger)"
];

export default function EquipeClient({ initialTeam, branches, laboratories, currentUserScope, activeLab, labBranches = [] }: EquipeClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const [team, setTeam] = useState<TeamMember[]>(initialTeam);

  React.useEffect(() => {
    setTeam(initialTeam);
  }, [initialTeam]);

  React.useEffect(() => {
    setBranchFilter('all');
  }, [activeLab?._id]);

  const branchMap = new Map<string, string>();
  branches.forEach(b => branchMap.set(b._id, b.name));

  const laboratoryMap = new Map<string, string>();
  laboratories.forEach(l => laboratoryMap.set(l._id, l.name));

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getBranchDisplay = (member: TeamMember) => {
    if (member.scope === 'SYSTEM') return 'Todas';
    if (!member.assignedTo || member.assignedTo.length === 0) return '-';

    if (member.scope === 'LAB') {
      return member.assignedTo
        .map(id => laboratoryMap.get(id) || 'Laboratório')
        .join(', ');
    }

    return member.assignedTo
      .map(id => branchMap.get(id) || 'Filial')
      .join(', ');
  };

  const handleToggleStatus = async (id: string, currentStatus: 'Ativo' | 'Pendente' | 'Inativo') => {
    const targetNewStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';

    const previousTeam = [...team];
    setTeam(prev =>
      prev.map(member => (member._id === id ? { ...member, status: targetNewStatus } : member))
    );

    const result = await toggleTeamMemberStatus(id, currentStatus);
    if (!result.success) {
      alert(`Erro: ${result.error}`);
      setTeam(previousTeam);
    } else {
      router.refresh();
    }
  };

  const branchToLabMap = new Map<string, string>();
  branches.forEach(b => {
    const lab = (b as any).laboratory || b.laboratoryId;
    const labId = lab && typeof lab === 'object'
      ? (lab.id || lab._id)
      : lab;
    if (labId) {
      branchToLabMap.set(b._id, String(labId));
    }
  });

  const activeLabId = activeLab?._id;

  const filteredTeam = team.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesLab = true;
    if (activeLabId) {
      if (member.scope === 'SYSTEM') {
        matchesLab = true;
      } else if (member.scope === 'LAB') {
        matchesLab = member.assignedTo.includes(activeLabId);
      } else if (member.scope === 'BRANCH' || member.scope === 'TECH') {
        matchesLab = member.assignedTo.some(branchId => branchToLabMap.get(branchId) === activeLabId);
      } else {
        matchesLab = false;
      }
    }

    let matchesBranch = true;
    if (branchFilter !== 'all') {
      if (member.scope === 'SYSTEM' || member.scope === 'LAB') {
        matchesBranch = true;
      } else if (member.scope === 'BRANCH' || member.scope === 'TECH') {
        matchesBranch = member.assignedTo.includes(branchFilter);
      } else {
        matchesBranch = false;
      }
    }

    const mappedRole = roleMap[member.scope] || member.scope;
    const matchesRole = roleFilter === 'all' || mappedRole === roleFilter;

    return matchesSearch && matchesLab && matchesBranch && matchesRole;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Gestão de equipe</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie administradores e operadores do sistema</p>
        </div>
        {currentUserScope === 'SYSTEM' && (
          <Link
            href="/register"
            className="h-10 px-4 rounded-lg text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:opacity-95 transition-opacity cursor-pointer shadow-glow"
            style={{ background: "var(--gradient-primary)", textDecoration: 'none' }}
          >
            <UserPlus className="size-4" />
            Cadastrar Membro
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-card border border-border focus:border-ring focus:outline-none text-sm transition-colors"
          />
        </div>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={!activeLab || labBranches.length === 0}
          title={!activeLab ? "Selecione um laboratório no cabeçalho" : labBranches.length === 0 ? "Este laboratório não tem filiais" : undefined}
        >
          <option value="all">Todas as filiais</option>
          {labBranches.map(b => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        >
          <option value="all">Todos os cargos</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Admin Lab">Admin Lab</option>
          <option value="Admin Filial">Admin Filial</option>
          <option value="Técnico">Técnico</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-6 py-3">Membro</th>
                <th className="text-left font-medium px-6 py-3">Cargo</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
                <th className="text-right font-medium px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-muted-foreground">
                    Nenhum membro da equipe encontrado.
                  </td>
                </tr>
              ) : (
                filteredTeam.map((m, i) => {
                  const roleName = roleMap[m.scope] || m.scope;
                  return (
                    <tr key={m._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: gradients[i % gradients.length] }}>
                            {getInitials(m.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {m.name}
                            </div>
                            <div className="text-xs text-muted-foreground">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", roleStyles[roleName] || "bg-muted text-muted-foreground")}>
                          {roleName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", statusStyles[m.status || 'Ativo'] || "bg-muted text-muted-foreground")}>
                          {m.status || 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer" aria-label="Editar Permissões" title="Editar Permissões">
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(m._id, m.status || 'Ativo')}
                            disabled={isPending}
                            className={cn(
                              "shrink-0 w-10 h-6 rounded-full p-0.5 flex items-center cursor-pointer transition-colors duration-200 ease-in-out",
                              (m.status || 'Ativo') === 'Ativo'
                                ? "bg-success justify-end"
                                : "bg-muted-foreground/40 justify-start",
                              isPending && "opacity-60 cursor-wait"
                            )}
                            title={(m.status || 'Ativo') === 'Ativo' ? "Desativar" : "Ativar"}
                            aria-label={(m.status || 'Ativo') === 'Ativo' ? "Desativar" : "Ativar"}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
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
