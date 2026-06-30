"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Check, Pencil, XCircle, ChevronDown, Calendar, UploadCloud, FileText, FlaskConical } from 'lucide-react';
import { updateAppointmentStatus, getAppointments, updateAppointmentDetails, createAppointment } from '@/actions/appointment';
import { getExams } from '@/actions/exam';
import { searchPatients } from '@/actions/patient';
import { getExamResult } from '@/actions/result';
import { setActiveBranch } from '@/actions/auth';
import { cn, formatCPF } from '@/lib/utils';

type Status = "Confirmado" | "Check-in" | "Aguardando Resultado" | "Concluído" | "Realizado" | "Cancelado" | "Pendente";

const statusStyles: Record<Status, string> = {
  Confirmado: "bg-primary/15 text-primary",
  "Check-in": "bg-purple-500/15 text-purple-500",
  "Aguardando Resultado": "bg-warning/15 text-warning",
  Concluído: "bg-success/15 text-success",
  Realizado: "bg-success/15 text-success",
  Cancelado: "bg-destructive/15 text-destructive",
  Pendente: "bg-muted text-muted-foreground",
};

const statusDot: Record<Status, string> = {
  Confirmado: "bg-primary",
  "Check-in": "bg-purple-500",
  "Aguardando Resultado": "bg-warning",
  Concluído: "bg-success",
  Realizado: "bg-success",
  Cancelado: "bg-destructive",
  Pendente: "bg-muted-foreground",
};

interface Appointment {
  _id: string;
  time: string;
  date: string;
  patient: string;
  cpf: string;
  exam: string;
  operator: string;
  status: Status;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

interface AgendamentosClientProps {
  initialAppointments: Appointment[];
  pendingAppointments: Appointment[];
  activeBranch: any;
  userBranches: any[];
  selectedDate: string;
  currentRange?: string;
}

export default function AgendamentosClient({
  initialAppointments,
  pendingAppointments,
  activeBranch,
  userBranches,
  selectedDate,
  currentRange = "all",
}: AgendamentosClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRange, setSelectedRange] = useState(currentRange);
  const [selectedDateState, setSelectedDateState] = useState(selectedDate);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<"agenda" | "pendencias">("agenda");
  // Results view modal
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Edit view modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Create view modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    patient: '',
    cpf: '',
    date: '',
    time: '',
    examId: '',
    status: 'Confirmado' as Status
  });
  const [isCreating, setIsCreating] = useState(false);
  const [examsList, setExamsList] = useState<any[]>([]);

  // Patient search state
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Local appointments state to support optimistic updates
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [localPending, setLocalPending] = useState<Appointment[]>(pendingAppointments);

  // Sync state if props change
  React.useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  React.useEffect(() => {
    setLocalPending(pendingAppointments);
  }, [pendingAppointments]);

  React.useEffect(() => {
    async function loadExams() {
      const exms = await getExams();
      setExamsList(exms);
    }
    loadExams();
  }, []);

  React.useEffect(() => {
    if (patientSearchQuery.length < 2) {
      setPatientResults([]);
      setShowDropdown(false);
      return;
    }
    
    // Only search if the query doesn't match the selected patient name
    // to prevent searching after selecting.
    const selectedResult = patientResults.find(p => p.name === patientSearchQuery);
    if (selectedResult) return;

    const delay = setTimeout(async () => {
      setIsSearchingPatient(true);
      const results = await searchPatients(patientSearchQuery);
      setPatientResults(results);
      setShowDropdown(true);
      setIsSearchingPatient(false);
    }, 400);

    return () => clearTimeout(delay);
  }, [patientSearchQuery]);

  const handleSelectPatient = (p: any) => {
    setPatientSearchQuery(p.name);
    setCreateData(prev => ({
      ...prev,
      patient: p.id,
      cpf: p.cpf || ''
    }));
    setShowDropdown(false);
  };

  React.useEffect(() => {
    setSelectedRange(currentRange);
  }, [currentRange]);

  React.useEffect(() => {
    setSelectedDateState(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDateState(newDate);
    setSelectedRange("custom");

    // Shallow url update
    router.replace(`?range=custom&date=${newDate}`, { scroll: false });

    startTransition(async () => {
      if (activeBranch) {
        const data = await getAppointments(activeBranch._id, newDate);
        setAppointments(data);
      }
    });
  };

  const handleRangeChange = (newRange: string) => {
    setSelectedRange(newRange);
    
    let dateQuery: string | undefined = "2026-06-09";
    const baseDate = "2026-06-09";

    if (newRange === "today") {
      dateQuery = baseDate;
    } else if (newRange === "5days") {
      const start = new Date(baseDate);
      const end = new Date(baseDate);
      end.setDate(end.getDate() + 4);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      dateQuery = `${startStr}:${endStr}`;
    } else if (newRange === "30days") {
      const start = new Date(baseDate);
      const end = new Date(baseDate);
      end.setDate(end.getDate() + 29);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      dateQuery = `${startStr}:${endStr}`;
    } else if (newRange === "custom") {
      dateQuery = selectedDateState;
    } else if (newRange === "all") {
      dateQuery = undefined;
    }

    if (newRange === "custom") {
      router.replace(`?range=custom&date=${selectedDateState}`, { scroll: false });
    } else {
      router.replace(`?range=${newRange}`, { scroll: false });
    }

    startTransition(async () => {
      if (activeBranch) {
        const data = await getAppointments(activeBranch._id, dateQuery);
        setAppointments(data);
      }
    });
  };

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    const previousAppointments = [...appointments];
    const previousPending = [...localPending];

    setAppointments(prev =>
      prev.map(app => (app._id === id ? { ...app, status: newStatus } : app))
    );
    setLocalPending(prev =>
      prev.filter(app => app._id !== id)
    );

    const result = await updateAppointmentStatus(id, newStatus);
    if (!result.success) {
      alert(`Erro: ${result.error}`);
      setAppointments(previousAppointments);
      setLocalPending(previousPending);
    } else {
      router.refresh();
    }
  };

  const handleShowResult = async (appointmentId: string) => {
    const result = await getExamResult(appointmentId);
    if (result) {
      setSelectedResult(result);
      setShowModal(true);
    } else {
      alert('Nenhum detalhe de laudo cadastrado para este exame.');
    }
  };

  const handleEditClick = (appointment: Appointment) => {
    setEditData({
      id: appointment._id,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;
    
    setIsEditing(true);
    const result = await updateAppointmentDetails(editData.id, editData);
    setIsEditing(false);

    if (result.success) {
      setAppointments(prev => prev.map(a => a._id === editData.id ? { ...a, ...editData } : a));
      setLocalPending(prev => prev.map(a => a._id === editData.id ? { ...a, ...editData } : a));
      setShowEditModal(false);
    } else {
      alert(`Erro ao editar: ${result.error}`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBranch) {
      alert("Nenhuma filial selecionada.");
      return;
    }

    setIsCreating(true);
    // Use patientSearchQuery if no user was selected
    const finalPatient = createData.patient || patientSearchQuery;

    const result = await createAppointment({
      ...createData,
      patient: finalPatient,
      branchId: activeBranch._id
    });
    setIsCreating(false);

    if (result.success) {
      // Optimitic add
      const newAppt = result.data.data ? result.data.data : result.data;
      if (newAppt && newAppt._id) {
         setAppointments(prev => [newAppt, ...prev]);
      } else {
         router.refresh();
      }
      setShowCreateModal(false);
      setCreateData({
        patient: '',
        cpf: '',
        date: '',
        time: '',
        examId: '',
        status: 'Confirmado'
      });
      setPatientSearchQuery('');
    } else {
      alert(`Erro ao criar: ${result.error}`);
    }
  };

  const appointmentsToShow = activeTab === "agenda" ? appointments : localPending;

  const filteredAppointments = appointmentsToShow.filter(app => {
    const matchesSearch =
      app.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.cpf.replace(/[.-]/g, '').includes(searchQuery.replace(/[.-]/g, '')) ||
      app.exam.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = activeTab === "pendencias" || statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/15 text-primary mb-2">
            <Calendar className="size-3" /> Agendamentos
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">
            Agenda da Filial — {activeBranch ? activeBranch.name : "Nenhuma unidade selecionada"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie os agendamentos diários dos pacientes</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {activeTab === "agenda" && (
            <>
              <div className="flex items-center gap-1 bg-muted/40 border border-border p-1 rounded-xl h-auto min-h-[40px] overflow-x-auto overflow-y-hidden scrollbar-none [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => handleRangeChange("all")}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                    selectedRange === "all"
                      ? "bg-card text-foreground shadow-sm font-bold border border-border/40"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  Todos
                </button>
                <button
                  onClick={() => handleRangeChange("today")}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                    selectedRange === "today"
                      ? "bg-card text-foreground shadow-sm font-bold border border-border/40"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  Hoje
                </button>
                <button
                  onClick={() => handleRangeChange("5days")}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                    selectedRange === "5days"
                      ? "bg-card text-foreground shadow-sm font-bold border border-border/40"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  Próximos 5 dias
                </button>
                <button
                  onClick={() => handleRangeChange("30days")}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                    selectedRange === "30days"
                      ? "bg-card text-foreground shadow-sm font-bold border border-border/40"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  Próximos 30 dias
                </button>
                <button
                  onClick={() => handleRangeChange("custom")}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                    selectedRange === "custom"
                      ? "bg-card text-foreground shadow-sm font-bold border border-border/40"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  Personalizado
                </button>
              </div>

              {selectedRange === "custom" && (
                <input
                  type="date"
                  value={selectedDateState}
                  onChange={handleDateChange}
                  className="h-10 px-3 rounded-lg border border-border bg-card text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none cursor-pointer animate-in fade-in slide-in-from-left-1 duration-150"
                />
              )}
            </>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 rounded-lg text-primary-foreground text-sm font-medium flex items-center gap-2 shadow-glow cursor-pointer"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="size-4" /> Criar novo
          </button>
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("agenda")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer",
            activeTab === "agenda"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Agenda de Atendimentos
        </button>
        <button
          onClick={() => setActiveTab("pendencias")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === "pendencias"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Pendências de Laudos
          {localPending.length > 0 && (
            <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full border border-destructive/20 animate-pulse">
              {localPending.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por paciente, CPF ou exame..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
          />
        </div>
        {activeTab === "agenda" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 rounded-lg bg-muted/40 border border-border focus:bg-background focus:border-ring focus:outline-none text-sm cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Check-in">Check-in</option>
            <option value="Aguardando Resultado">Aguardando Resultado</option>
            <option value="Concluído">Concluído</option>
            <option value="Pendente">Pendente</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
                <th className="px-6 py-3.5 font-medium">Data/Hora</th>
                <th className="px-6 py-3.5 font-medium">Paciente</th>
                <th className="px-6 py-3.5 font-medium">Exame</th>
                <th className="px-6 py-3.5 font-medium">Operador</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isPending ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted-foreground/15 rounded w-24"></div>
                      <div className="h-3 bg-muted-foreground/10 rounded w-12 mt-1.5"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted-foreground/15 rounded w-32"></div>
                      <div className="h-3 bg-muted-foreground/10 rounded w-20 mt-1.5"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted-foreground/15 rounded w-40"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted-foreground/15 rounded w-28"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-muted-foreground/15 rounded-full w-20"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 bg-muted-foreground/15 rounded w-16 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    {activeTab === "agenda"
                      ? "Nenhum agendamento encontrado para os filtros selecionados."
                      : "Nenhuma pendência de laudo encontrada para esta filial."}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((a) => (
                  <tr key={a._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground tabular-nums">{formatDate(a.date)}</span>
                        <span className="text-xs text-primary font-medium mt-0.5 tabular-nums">{a.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{a.patient}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{formatCPF(a.cpf)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{a.exam}</td>
                    <td className="px-6 py-4 text-muted-foreground">{a.operator}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${statusStyles[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        {a.status === "Check-in" && (
                          <button
                            onClick={() => handleStatusUpdate(a._id, "Aguardando Resultado")}
                            className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-success transition-colors cursor-pointer"
                            title="Realizar Coleta (Aguardando Resultado)"
                          >
                            <FlaskConical className="size-4" />
                          </button>
                        )}

                        {a.status === "Confirmado" && (
                          <button
                            onClick={() => handleStatusUpdate(a._id, "Check-in")}
                            className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-purple-500 transition-colors cursor-pointer"
                            title="Check-in"
                          >
                            <Check className="size-4" />
                          </button>
                        )}

                        {a.status === "Aguardando Resultado" && (
                          <Link
                            href={`/agendamentos/${a._id}/resultado`}
                            className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            title="Subir Resultado"
                          >
                            <UploadCloud className="size-4" />
                          </Link>
                        )}

                        {a.status === "Concluído" && (
                          <button
                            onClick={() => handleShowResult(a._id)}
                            className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-success transition-colors cursor-pointer"
                            title="Ver Resultado"
                          >
                            <FileText className="size-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleEditClick(a)}
                          className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>

                        {a.status !== "Cancelado" && a.status !== "Concluído" && (
                          <button
                            onClick={() => handleStatusUpdate(a._id, "Cancelado")}
                            className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            title="Cancelar"
                          >
                            <XCircle className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-elevated p-6 relative">
            <h3 className="font-display font-semibold text-lg mb-4">Laudo / Resultado Disponível</h3>

            <div className="space-y-4 mb-6">
              <div>
                <span className="text-xs text-muted-foreground block">Arquivo do Laudo</span>
                <span className="font-medium text-sm text-primary flex items-center gap-1.5 mt-1">
                  <FileText className="size-4 flex-shrink-0" /> {selectedResult.fileName}
                </span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Observações do Laudo</span>
                <span className="text-sm mt-1 block bg-muted/40 border border-border p-3 rounded-lg text-muted-foreground whitespace-pre-wrap">
                  {selectedResult.notes || "Sem observações registradas."}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block">Responsável Técnico</span>
                  <span className="text-sm font-medium block mt-1">{selectedResult.uploadedBy}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Data de Emissão</span>
                  <span className="text-sm text-muted-foreground block mt-1">
                    {new Date(selectedResult.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <a
                href={selectedResult.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 rounded-lg border border-border hover:bg-muted text-sm font-semibold transition-colors flex items-center gap-2"
              >
                Download PDF
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="h-10 px-4 rounded-lg text-white text-sm font-semibold transition-colors cursor-pointer"
                style={{ background: "var(--gradient-primary)" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-elevated p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Editar Agendamento</h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Data</label>
                <input
                  type="date"
                  required
                  value={editData.date}
                  onChange={e => setEditData({ ...editData, date: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-muted/40 focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Horário</label>
                <input
                  type="time"
                  required
                  value={editData.time}
                  onChange={e => setEditData({ ...editData, time: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-muted/40 focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Status</label>
                <select
                  value={editData.status}
                  onChange={e => setEditData({ ...editData, status: e.target.value as Status })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-muted/40 focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all cursor-pointer"
                >
                  <option value="Confirmado">Confirmado</option>
                  <option value="Check-in">Check-in</option>
                  <option value="Aguardando Resultado">Aguardando Resultado</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Realizado">Realizado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="h-10 px-4 rounded-lg border border-border hover:bg-muted text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="h-10 px-4 rounded-lg text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {isEditing ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-elevated p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Criar Novo Agendamento</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 relative">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nome do Paciente</label>
                  <input
                    type="text"
                    required
                    placeholder="Buscar ou digitar nome completo"
                    value={patientSearchQuery}
                    onChange={e => {
                      setPatientSearchQuery(e.target.value);
                      if (createData.patient) {
                        // Reset selection if user types something else
                        setCreateData(prev => ({ ...prev, patient: '' }));
                      }
                    }}
                    onFocus={() => {
                      if (patientResults.length > 0) setShowDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-muted/40 focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                  />
                  {isSearchingPatient && (
                    <div className="absolute right-3 top-9 text-muted-foreground text-xs">Buscando...</div>
                  )}
                  {showDropdown && patientResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-elevated max-h-48 overflow-y-auto">
                      {patientResults.map(p => (
                        <div
                          key={p.id}
                          className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => handleSelectPatient(p)}
                        >
                          <div className="text-sm font-medium">{p.name}</div>
                          {p.cpf && <div className="text-xs text-muted-foreground">{formatCPF(p.cpf)}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">CPF</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={createData.cpf}
                    onChange={e => setCreateData({ ...createData, cpf: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-muted/40 focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Exame</label>
                <select
                  required
                  value={createData.examId}
                  onChange={e => setCreateData({ ...createData, examId: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-muted/40 focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all cursor-pointer"
                >
                  <option value="" disabled>Selecione um exame...</option>
                  {examsList.map(ex => (
                    <option key={ex._id} value={ex._id}>{ex.name || ex.nome_exame}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Data</label>
                  <input
                    type="date"
                    required
                    value={createData.date}
                    onChange={e => setCreateData({ ...createData, date: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-muted/40 focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Horário</label>
                  <input
                    type="time"
                    required
                    value={createData.time}
                    onChange={e => setCreateData({ ...createData, time: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-muted/40 focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Status Inicial</label>
                <select
                  value={createData.status}
                  onChange={e => setCreateData({ ...createData, status: e.target.value as Status })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-muted/40 focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all cursor-pointer"
                >
                  <option value="Confirmado">Confirmado</option>
                  <option value="Check-in">Check-in</option>
                  <option value="Aguardando Resultado">Aguardando Resultado</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-10 px-4 rounded-lg border border-border hover:bg-muted text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="h-10 px-4 rounded-lg text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {isCreating ? "Criando..." : "Criar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
