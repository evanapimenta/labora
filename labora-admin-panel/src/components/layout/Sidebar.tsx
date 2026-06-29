"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Users,
  FlaskConical,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Settings,
  MoreVertical,
  LogOut,
  ChevronRight
} from "lucide-react";
import { logoutAdmin, setActiveLab } from '@/actions/auth';
import { cn } from "@/lib/utils";

const menuItems = [
  { label: 'Dashboard Matriz', path: '/', icon: LayoutDashboard },
  { label: 'Painel da Filial', path: '/filial', icon: Building2 },
  { label: 'Agendamentos', path: '/agendamentos', icon: CalendarDays },
  { label: 'Equipe', path: '/equipe', icon: Users },
  { label: 'Exames', path: '/exames', icon: ClipboardList },
  { label: 'Laboratórios', path: '/laboratorios', icon: FlaskConical },
  { label: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  { label: 'Auditoria', path: '/auditoria', icon: ShieldCheck },
];

interface SidebarProps {
  user: any;
  userLabs: any[];
  activeLab: any;
}

export default function Sidebar({ user, userLabs, activeLab }: SidebarProps) {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : "CA";

  const handleLogout = async () => {
    await logoutAdmin();
  };

  const isSystemScope = user?.scope?.toUpperCase() === 'SYSTEM';
  const isLabScope = user?.scope?.toUpperCase() === 'LAB';

  const userRoleText = (isSystemScope || isLabScope)
    ? (activeLab?.labName || 'Sem Laboratório')
    : (user?.scope === 'BRANCH' ? 'Filial Admin' : (user?.scope === 'TECH' ? 'Técnico' : 'Super Admin'));

  const allowedMenuItems = menuItems.filter(item => {
    if (user?.scope === 'TECH') {
      return item.path === '/agendamentos';
    }
    return true;
  });

  return (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground hidden md:flex flex-col">
      <div className="px-5 py-6 flex items-center gap-2.5">
        <div className="size-9 rounded-xl flex items-center justify-center text-primary-foreground shadow-glow" style={{ background: "var(--gradient-primary)" }}>
          <FlaskConical className="size-5" />
        </div>
        <div>
          <div className="font-semibold tracking-tight" style={{ fontFamily: 'var(--font-montserrat)', fontWeight: 700, fontSize: '1.4rem' }}>Labora</div>
          <div className="text-[11px] text-muted-foreground -mt-0.5">Admin Suite</div>
        </div>
      </div>

      <nav className="px-3 mt-2 flex-1 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Geral</div>

        {allowedMenuItems.map((item) => {
          const active = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-primary" />
              )}
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border relative" ref={dropdownRef}>
        {showDropdown && (
          <div className="absolute bottom-16 left-3 right-3 rounded-xl border border-border bg-card p-1.5 shadow-elevated z-50 flex flex-col gap-1">
            {userLabs && userLabs.length > 0 && (
              <>
                <div className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider border-b border-border">
                  Selecionar Rede
                </div>
                <div className="max-h-40 overflow-y-auto flex flex-col gap-0.5 custom-scroll">
                  {userLabs.map((lab) => {
                    const isSelected = activeLab?._id === lab._id;
                    return (
                      <button
                        key={lab._id}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await setActiveLab(lab._id);
                          window.location.reload();
                        }}
                        className={cn(
                          "w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between",
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted text-foreground/80"
                        )}
                      >
                        <span className="truncate">{lab.labName}</span>
                        {isSelected && (
                          <ChevronRight className="size-3" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-border my-1" />
              </>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              Sair da conta
            </button>
          </div>
        )}

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full p-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors flex items-center gap-3 text-left border-none bg-none cursor-pointer"
          id="sidebar-profile-btn"
        >
          <div className="relative flex-shrink-0">
            <div className="size-9 rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium" style={{ background: "var(--gradient-accent)" }}>
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success border border-sidebar" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold leading-tight truncate">
              {user?.scope === 'TECH' && !user.name.startsWith('Téc. ') ? `Téc. ${user.name}` : (user?.name || "Carlos Admin")}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate" title={userRoleText}>
              {userRoleText}
            </div>
          </div>
          <MoreVertical className="size-4 text-muted-foreground flex-shrink-0" />
        </button>
      </div>
    </aside>
  );
}
