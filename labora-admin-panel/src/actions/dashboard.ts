"use server";

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/session';
import { apiFetch } from '@/lib/api-client';

export async function getConsolidatedDashboardData(range?: string) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const user = session ? await verifyToken(session) : null;
    const activeLabId = cookieStore.get('active_lab_id')?.value;
    const activeBranchId = cookieStore.get('active_branch_id')?.value;

    const data = await apiFetch('/api/dashboard/consolidated', {
      method: 'POST',
      body: JSON.stringify({
        range,
        user,
        activeLabId,
        activeBranchId
      })
    });
    return data;
  } catch (error: any) {
    console.error('Erro ao buscar dados consolidados do dashboard via API:', error);
    return {
      success: false,
      error: error.message,
      metrics: { 
        totalRevenue: 0, 
        totalAppointments: 0, 
        totalCancellations: 0, 
        revenueDelta: "0%",
        revenuePositive: true,
        appointmentsDelta: "0%",
        appointmentsPositive: true,
        cancellationsDelta: "0%",
        cancellationsPositive: true,
        rating: 0,
        ratingDelta: "0%",
        ratingPositive: true
      },
      chartData: Array(12).fill(0),
      chartLabels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
      chartTopExams: Array(12).fill([]),
      topBranches: [],
      topCategories: [],
      recentAppointments: []
    };
  }
}
