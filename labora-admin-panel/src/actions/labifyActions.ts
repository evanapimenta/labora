"use server";

import { apiFetch } from '@/lib/api';

export interface BranchDTO {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  openingHours?: string;
  active: boolean;
  status: 'Ativa' | 'Inativa';
  laboratoryId?: string;
  laboratoryName?: string;
  adminId?: string;
}

export interface LaboratoryDTO {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phoneNumber?: string;
  active: boolean;
  status: 'Ativo' | 'Inativo';
  superAdminId?: string;
}

export interface ExamDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  category?: string;
  price?: string;
  active: boolean;
}

export interface ExamOfferingDTO {
  id: string;
  branchId: string;
  examId: number;
  examCode: string;
  examName: string;
  price: string;
  active: boolean;
}

export type AppointmentStatus =
  | 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'
  | 'AGENDADO' | 'REALIZADO' | 'CANCELADO' | 'AUSENTE'
  | 'AGUARDANDO_RESULTADOS' | 'CONCLUIDO';

export interface AppointmentDTO {
  id: string;
  examId: number;
  examName: string;
  examCode?: string;
  patientName?: string;
  scheduledFor?: string;
  scheduledAt?: string;
  branchId: string;
  branchName?: string;
  status: AppointmentStatus;
}


export async function listGlobalExams(): Promise<ExamDTO[]> {
  return apiFetch<ExamDTO[]>('/api/v1/public/exams', { auth: false });
}

export async function listBranchExams(branchId: string): Promise<ExamOfferingDTO[]> {
  return apiFetch<ExamOfferingDTO[]>(
    `/api/v1/public/branches/${encodeURIComponent(branchId)}/exams`,
    { auth: false },
  );
}

export async function listManageableLabs(): Promise<LaboratoryDTO[]> {
  return apiFetch<LaboratoryDTO[]>('/api/v1/super-admin/labs');
}

export async function getLab(id: string): Promise<LaboratoryDTO> {
  return apiFetch<LaboratoryDTO>(`/api/v1/super-admin/labs/${encodeURIComponent(id)}`);
}

export async function updateLab(id: string, payload: Partial<LaboratoryDTO> & {
  addressDTO?: Record<string, unknown>;
}): Promise<LaboratoryDTO> {
  return apiFetch<LaboratoryDTO>(`/api/v1/super-admin/labs/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function toggleLabStatus(id: string): Promise<LaboratoryDTO> {
  return apiFetch<LaboratoryDTO>(`/api/v1/super-admin/labs/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
  });
}

export async function createLab(payload: {
  name: string;
  cnpj: string;
  email: string;
  phoneNumber: string;
  addressDTO: Record<string, unknown>;
}): Promise<LaboratoryDTO> {
  return apiFetch<LaboratoryDTO>('/api/v1/system/labs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listVisibleBranches(): Promise<BranchDTO[]> {
  return apiFetch<BranchDTO[]>('/api/v1/admin/branches');
}

export async function listBranchesByLab(labId: string): Promise<{ content: BranchDTO[] }> {
  return apiFetch<{ content: BranchDTO[] }>(
    `/api/v1/super-admin/labs/${encodeURIComponent(labId)}/branches`,
  );
}

export async function getBranch(branchId: string): Promise<BranchDTO> {
  return apiFetch<BranchDTO>(`/api/v1/admin/branches/${encodeURIComponent(branchId)}`);
}

export async function createBranch(labId: string, payload: {
  name: string;
  email: string;
  phoneNumber: string;
  openingHours: string;
  addressDTO: Record<string, unknown>;
}): Promise<BranchDTO> {
  return apiFetch<BranchDTO>(
    `/api/v1/super-admin/labs/${encodeURIComponent(labId)}/branches`,
    { method: 'POST', body: JSON.stringify({ ...payload, laboratoryId: labId }) },
  );
}

export async function updateBranch(branchId: string, payload: Partial<BranchDTO> & {
  addressDTO?: Record<string, unknown>;
}): Promise<BranchDTO> {
  return apiFetch<BranchDTO>(
    `/api/v1/super-admin/branches/${encodeURIComponent(branchId)}`,
    { method: 'PUT', body: JSON.stringify(payload) },
  );
}

export async function toggleBranchStatus(branchId: string): Promise<BranchDTO> {
  return apiFetch<BranchDTO>(
    `/api/v1/super-admin/branches/${encodeURIComponent(branchId)}/status`,
    { method: 'PATCH' },
  );
}

export async function listBranchAppointments(branchId: string, page = 0, size = 20): Promise<{
  content: AppointmentDTO[];
  totalElements: number;
  totalPages: number;
}> {
  const qs = new URLSearchParams({ page: String(page), size: String(size) });
  return apiFetch(
    `/api/v1/admin/branches/${encodeURIComponent(branchId)}/appointments?${qs.toString()}`,
  );
}

export async function getAppointment(appointmentId: string): Promise<AppointmentDTO> {
  return apiFetch<AppointmentDTO>(
    `/api/v1/admin/appointments/${encodeURIComponent(appointmentId)}`,
  );
}

export async function checkInAppointment(appointmentId: string): Promise<AppointmentDTO> {
  return apiFetch<AppointmentDTO>(
    `/api/v1/admin/appointments/${encodeURIComponent(appointmentId)}/check-in`,
    { method: 'POST' },
  );
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<AppointmentDTO> {
  return apiFetch<AppointmentDTO>(
    `/api/v1/admin/appointments/${encodeURIComponent(appointmentId)}/status`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
  );
}

export async function uploadExamResult(
  appointmentId: string,
  file: File,
  notes?: string,
): Promise<unknown> {
  const form = new FormData();
  form.append('file', file);
  if (notes) form.append('notes', notes);

  return apiFetch(
    `/api/v1/admin/appointments/${encodeURIComponent(appointmentId)}/result`,
    { method: 'POST', body: form },
  );
}

export async function getResultDownloadUrl(appointmentId: string): Promise<{ url: string }> {
  return apiFetch<{ url: string }>(
    `/api/v1/patient/appointments/${encodeURIComponent(appointmentId)}/result`,
  );
}

export async function rateAppointment(
  appointmentId: string,
  rating: number,
  comment?: string,
): Promise<unknown> {
  return apiFetch(
    `/api/v1/patient/appointments/${encodeURIComponent(appointmentId)}/rating`,
    { method: 'POST', body: JSON.stringify({ rating, comment }) },
  );
}

export interface TeamMemberDTO {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

export async function listTeam(): Promise<TeamMemberDTO[]> {
  return apiFetch<TeamMemberDTO[]>('/api/v1/super-admin/team');
}

export async function toggleUserStatus(userId: string, active: boolean): Promise<TeamMemberDTO> {
  return apiFetch<TeamMemberDTO>(
    `/api/v1/system/users/${encodeURIComponent(userId)}/status`,
    { method: 'PATCH', body: JSON.stringify({ active }) },
  );
}

export async function offerExam(input: {
  branchId: string;
  examId: number;
  price: string;
}): Promise<ExamOfferingDTO> {
  return apiFetch<ExamOfferingDTO>(
    `/api/v1/super-admin/branches/${encodeURIComponent(input.branchId)}/offerings`,
    { method: 'POST', body: JSON.stringify({ examId: input.examId, price: input.price }) },
  );
}
