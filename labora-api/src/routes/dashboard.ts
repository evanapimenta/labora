import { Router } from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import Exam from '../models/Exam';
import Branch from '../models/Branch';
import Rating from '../models/Rating';
import Laboratory from '../models/Laboratory';
import Admin from '../models/Admin';
import User from '../models/User';

const router = Router();

const stripLabName = (name: string): string => {
  const stripped = name.trim();
  const parts = stripped.split(/\s*[-–—]\s*/);
  if (parts.length > 1) {
    return parts.slice(1).join(" - ").trim();
  }
  return stripped;
};

const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateRanges = (range?: string) => {
  const today = new Date();
  let currentStart = '';
  let currentEnd = '';
  let prevStart = '';
  let prevEnd = '';

  if (range === '7') {
    const dStart = new Date(today);
    dStart.setDate(today.getDate() - 6);
    currentStart = formatDate(dStart);
    currentEnd = formatDate(today);

    const pStart = new Date(today);
    pStart.setDate(today.getDate() - 14);
    const pEnd = new Date(today);
    pEnd.setDate(today.getDate() - 8);
    prevStart = formatDate(pStart);
    prevEnd = formatDate(pEnd);
  } else if (range === 'month') {
    const firstDayCur = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayCur = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    currentStart = formatDate(firstDayCur);
    currentEnd = formatDate(lastDayCur);

    const firstDayPrev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayPrev = new Date(today.getFullYear(), today.getMonth(), 0);
    prevStart = formatDate(firstDayPrev);
    prevEnd = formatDate(lastDayPrev);
  } else if (range === 'year') {
    const dStart = new Date(today);
    dStart.setDate(today.getDate() - 365);
    currentStart = formatDate(dStart);
    currentEnd = formatDate(today);

    const pStart = new Date(today);
    pStart.setDate(today.getDate() - 731);
    const pEnd = new Date(today);
    pEnd.setDate(today.getDate() - 366);
    prevStart = formatDate(pStart);
    prevEnd = formatDate(pEnd);
  } else {
    const dStart = new Date(today);
    dStart.setDate(today.getDate() - 29);
    currentStart = formatDate(dStart);
    currentEnd = formatDate(today);

    const pStart = new Date(today);
    pStart.setDate(today.getDate() - 59);
    const pEnd = new Date(today);
    pEnd.setDate(today.getDate() - 30);
    prevStart = formatDate(pStart);
    prevEnd = formatDate(pEnd);
  }

  return { currentStart, currentEnd, prevStart, prevEnd, today };
};

async function resolveAccessibleBranches(user: any, activeLabId?: string, activeBranchId?: string) {
  const db = mongoose.connection.db;
  if (!db) {
    return { userBranches: [], activeBranch: null, activeLab: null };
  }

  const labsCollection = db.collection('labs');
  const branchesCollection = db.collection('branches');

  let userLabs: any[] = [];
  if (user.scope === 'SYSTEM') {
    const allLabs = await labsCollection.find({}, { projection: { _id: 1, labName: 1 } }).toArray();
    userLabs = allLabs.map(lab => ({
      _id: lab._id.toString(),
      labName: lab.labName
    }));
  } else {
    const adminDoc = await Admin.findById(user.userId).lean() as any;
    if (adminDoc && adminDoc.assignedTo && adminDoc.assignedTo.length > 0) {
      const assignedLabs = await labsCollection.find(
        { _id: { $in: adminDoc.assignedTo } },
        { projection: { _id: 1, labName: 1 } }
      ).toArray();
      userLabs = assignedLabs.map(lab => ({
        _id: lab._id.toString(),
        labName: lab.labName
      }));
    }
  }

  let activeLab: any = null;
  if (activeLabId) {
    activeLab = userLabs.find(l => l._id === activeLabId) || null;
  }
  if (!activeLab && userLabs.length > 0) {
    activeLab = userLabs[0];
  }

  let branchQuery: any = {};
  if (user.scope === 'SYSTEM') {
    if (activeLab) {
      branchQuery = { laboratoryId: new mongoose.Types.ObjectId(activeLab._id) };
    } else {
      branchQuery = {};
    }
  } else if (user.scope === 'LAB') {
    const adminDoc = await Admin.findById(user.userId).lean() as any;
    if (adminDoc && adminDoc.assignedTo && adminDoc.assignedTo.length > 0) {
      const assignedLabIds = adminDoc.assignedTo.map((id: any) => new mongoose.Types.ObjectId(id));
      if (activeLab) {
        branchQuery = { laboratoryId: new mongoose.Types.ObjectId(activeLab._id) };
      } else {
        branchQuery = { laboratoryId: { $in: assignedLabIds } };
      }
    } else {
      branchQuery = { _id: { $in: [] } };
    }
  } else if (user.scope === 'BRANCH' || user.scope === 'TECH') {
    const adminDoc = await Admin.findById(user.userId).lean() as any;
    if (adminDoc && adminDoc.assignedTo && adminDoc.assignedTo.length > 0) {
      const assignedBranchIds = adminDoc.assignedTo.map((id: any) => new mongoose.Types.ObjectId(id));
      branchQuery = { _id: { $in: assignedBranchIds } };
    } else {
      branchQuery = { _id: { $in: [] } };
    }
  } else {
    branchQuery = { _id: { $in: [] } };
  }

  const foundBranches = await branchesCollection.find(branchQuery, { projection: { _id: 1, name: 1, laboratoryId: 1 } }).toArray();
  const userBranches = foundBranches.map(branch => ({
    _id: branch._id.toString(),
    name: branch.name,
    laboratoryId: branch.laboratoryId?.toString()
  }));

  let activeBranch: any = null;
  if (activeBranchId) {
    activeBranch = userBranches.find(b => b._id === activeBranchId) || null;
  }
  if (!activeBranch && userBranches.length > 0) {
    activeBranch = userBranches[0];
  }

  return { userBranches, activeBranch, activeLab };
}

router.post('/consolidated', async (req, res) => {
  const { range, user, activeLabId, activeBranchId } = req.body;

  try {
    void Branch;

    const labDoc = await Laboratory.findOne({}).lean() as any;

    const { userBranches } = await resolveAccessibleBranches(user, activeLabId, activeBranchId);

    const query: any = {};
    if (user && userBranches && userBranches.length > 0) {
      const branchObjectIds = userBranches.map(b => new mongoose.Types.ObjectId(b._id));
      query.branchId = { $in: branchObjectIds };
    }

    const exams = await Exam.find({}).lean() as any[];
    const examIdPriceMap = new Map<string, number>();
    const examIdCategoryMap = new Map<string, string>();
    exams.forEach(e => {
      examIdPriceMap.set(e._id.toString(), e.price);
      examIdCategoryMap.set(e._id.toString(), e.category || e.categoria || 'Outros');
    });

    const { currentStart, currentEnd, prevStart, prevEnd, today } = getDateRanges(range);

    const dataQuery: any = { ...query };
    dataQuery.$or = [
      { date: { $gte: currentStart, $lte: currentEnd } },
      { date: { $gte: prevStart, $lte: prevEnd } }
    ];

    const appointments = await Appointment.find(dataQuery)
      .populate('branchId', 'name')
      .populate('exam')
      .lean() as any[];

    // Date calculation moved to getDateRanges()

    let currentRevenue = 0;
    let currentAppointments = 0;
    let currentCancellations = 0;
    let prevRevenue = 0;
    let prevAppointments = 0;
    let prevCancellations = 0;

    appointments.forEach(a => {
      const isCurrentPeriod = a.date && a.date >= currentStart && a.date <= currentEnd;
      const isPrevPeriod = a.date && a.date >= prevStart && a.date <= prevEnd;

      let price = 0;
      if (a.exam) {
        if (typeof a.exam === 'object' && a.exam.price !== undefined) {
          price = a.exam.price;
        } else {
          price = examIdPriceMap.get(a.exam.toString()) || 0;
        }
      }

      const isCompleted = a.status === 'Realizado' || a.status === 'Concluído';

      if (isCurrentPeriod) {
        currentAppointments += 1;
        if (isCompleted) {
          currentRevenue += price;
        }
        if (a.status === 'Cancelado') {
          currentCancellations += 1;
        }
      } else if (isPrevPeriod) {
        prevAppointments += 1;
        if (isCompleted) {
          prevRevenue += price;
        }
        if (a.status === 'Cancelado') {
          prevCancellations += 1;
        }
      }
    });

    const calculateDelta = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const diff = ((current - previous) / previous) * 100;
      const rounded = parseFloat(diff.toFixed(1));
      if (rounded === 0) return "0%";
      const sign = rounded > 0 ? "+" : "";
      return `${sign}${rounded.toFixed(1).replace('.', ',')}%`;
    };

    const revenueDelta = calculateDelta(currentRevenue, prevRevenue);
    const revenuePositive = currentRevenue >= prevRevenue;

    const appointmentsDelta = calculateDelta(currentAppointments, prevAppointments);
    const appointmentsPositive = currentAppointments >= prevAppointments;

    const cancellationsDelta = calculateDelta(currentCancellations, prevCancellations);
    const diffCancellations = prevCancellations === 0 ? 0 : ((currentCancellations - prevCancellations) / prevCancellations) * 100;
    const cancellationsPositive = diffCancellations <= 0;

    const MONTHS_FULL = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const MONTHS_SHORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    const WEEK_DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

    type ChartBucket = { dateKey: string; label: string; tooltipLabel: string; count: number; examsMap: Map<string, number> };
    const chartBuckets: ChartBucket[] = [];
    let chartPeriodLabel = 'Últimos 12 meses';
    let monthlyGranularity = false;

    if (range === 'year') {
      monthlyGranularity = true;
      chartPeriodLabel = 'Últimos 12 meses';
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        chartBuckets.push({
          dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: MONTHS_SHORT[d.getMonth()],
          tooltipLabel: `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`,
          count: 0,
          examsMap: new Map(),
        });
      }
    } else if (range === '7') {
      chartPeriodLabel = 'Últimos 7 dias';
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const ds = formatDate(d);
        chartBuckets.push({
          dateKey: ds,
          label: String(d.getDate()),
          tooltipLabel: `${WEEK_DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()]} de ${d.getFullYear()}`,
          count: 0,
          examsMap: new Map(),
        });
      }
    } else if (range === 'month') {
      chartPeriodLabel = `${MONTHS_FULL[today.getMonth()]} ${today.getFullYear()}`;
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= lastDay; day++) {
        const d = new Date(today.getFullYear(), today.getMonth(), day);
        const ds = formatDate(d);
        chartBuckets.push({
          dateKey: ds,
          label: String(day),
          tooltipLabel: `${WEEK_DAYS[d.getDay()]}, ${day} de ${MONTHS_FULL[d.getMonth()]} de ${d.getFullYear()}`,
          count: 0,
          examsMap: new Map(),
        });
      }
    } else {
      chartPeriodLabel = 'Últimos 30 dias';
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const ds = formatDate(d);
        chartBuckets.push({
          dateKey: ds,
          label: `${d.getDate()}/${d.getMonth() + 1}`,
          tooltipLabel: `${WEEK_DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()]} de ${d.getFullYear()}`,
          count: 0,
          examsMap: new Map(),
        });
      }
    }

    appointments.forEach(a => {
      if (!a.date) return;
      const key = monthlyGranularity ? a.date.substring(0, 7) : a.date;
      const bucket = chartBuckets.find(b => b.dateKey === key);
      if (bucket) {
        bucket.count++;
        const examName = a.exam?.name || a.exam?.nome_exame || 'Exame Indefinido';
        bucket.examsMap.set(examName, (bucket.examsMap.get(examName) || 0) + 1);
      }
    });

    const chartData = chartBuckets.map(b => b.count);
    const chartLabels = chartBuckets.map(b => b.label);
    const chartTooltipLabels = chartBuckets.map(b => b.tooltipLabel);
    const chartTopExams = chartBuckets.map(b =>
      Array.from(b.examsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }))
    );

    const branchRevenueMap = new Map<string, number>();
    appointments.forEach(a => {
      const isCurrentPeriod = a.date && a.date >= currentStart && a.date <= currentEnd;
      const isCompleted = a.status === 'Realizado' || a.status === 'Concluído';
      if (isCurrentPeriod && isCompleted) {
        const branchName = stripLabName(a.branchId?.name || 'Sem Filial');

        let price = 0;
        if (a.exam) {
          if (typeof a.exam === 'object' && a.exam.price !== undefined) {
            price = a.exam.price;
          } else {
            price = examIdPriceMap.get(a.exam.toString()) || 0;
          }
        }

        branchRevenueMap.set(branchName, (branchRevenueMap.get(branchName) || 0) + price);
      }
    });

    const topBranches = Array.from(branchRevenueMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    const categoryRevenueMap = new Map<string, number>();
    appointments.forEach(a => {
      const isCurrentPeriod = a.date && a.date >= currentStart && a.date <= currentEnd;
      const isCompleted = a.status === 'Realizado' || a.status === 'Concluído';
      if (isCurrentPeriod && isCompleted) {
        let price = 0;
        let category = 'Outros';

        if (a.exam) {
          if (typeof a.exam === 'object') {
            price = a.exam.price || 0;
            category = a.exam.category || a.exam.categoria || 'Outros';
          } else {
            price = examIdPriceMap.get(a.exam.toString()) || 0;
            category = examIdCategoryMap.get(a.exam.toString()) || 'Outros';
          }
        }

        categoryRevenueMap.set(category, (categoryRevenueMap.get(category) || 0) + price);
      }
    });

    const topCategories = Array.from(categoryRevenueMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const recentAppointmentsDocs = await Appointment.find(query)
      .sort({ date: -1, time: -1 })
      .limit(5)
      .populate('branchId', 'name')
      .populate('exam')
      .lean() as any[];

    const patientIds = [...new Set(recentAppointmentsDocs.map(a => a.patient))];
    const users = await User.find({ id: { $in: patientIds } }).select('id name').lean();
    const userMap = new Map(users.map((u: any) => [u.id, u.name]));

    const recentAppointments = recentAppointmentsDocs.map(a => ({
      patient: userMap.get(a.patient) || a.patient,
      exam: a.exam?.name || a.exam?.nome_exame || 'Exame Indefinido',
      branch: stripLabName(a.branchId?.name || 'Sem Filial'),
      date: a.date,
      time: a.time,
      status: a.status
    }));

    void Rating;
    const ratingQuery: any = {};
    if (query.branchId) ratingQuery.branchId = query.branchId;

    const [currentRatings, prevRatings] = await Promise.all([
      Rating.find({
        ...ratingQuery,
        createdAt: { $gte: new Date(currentStart), $lte: new Date(currentEnd + 'T23:59:59Z') }
      }).lean() as Promise<any[]>,
      Rating.find({
        ...ratingQuery,
        createdAt: { $gte: new Date(prevStart), $lte: new Date(prevEnd + 'T23:59:59Z') }
      }).lean() as Promise<any[]>,
    ]);

    const avg = (arr: any[]) =>
      arr.length > 0 ? arr.reduce((s, r) => s + r.rating, 0) / arr.length : null;

    const currentAvgRating = avg(currentRatings);
    const prevAvgRating = avg(prevRatings);

    let ratingDelta = "+0,00";
    let ratingPositive = true;
    if (currentAvgRating !== null && prevAvgRating !== null) {
      const diff = currentAvgRating - prevAvgRating;
      const rounded = parseFloat(diff.toFixed(2));
      ratingPositive = rounded >= 0;
      if (rounded === 0) {
        ratingDelta = "+0,00";
      } else {
        ratingDelta = `${rounded > 0 ? '+' : ''}${rounded.toFixed(2).replace('.', ',')}`;
      }
    }

    return res.json({
      success: true,
      metrics: {
        totalRevenue: currentRevenue,
        totalAppointments: currentAppointments,
        totalCancellations: currentCancellations,
        revenueDelta,
        revenuePositive,
        appointmentsDelta,
        appointmentsPositive,
        cancellationsDelta,
        cancellationsPositive,
        rating: currentAvgRating !== null ? Math.round(currentAvgRating * 100) / 100 : null,
        ratingDelta,
        ratingPositive
      },
      chartData,
      chartLabels,
      chartTooltipLabels,
      chartTopExams,
      chartPeriodLabel,
      topBranches,
      topCategories,
      recentAppointments
    });
  } catch (error: any) {
    console.error('Erro ao consolidar dados de dashboard:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/export-data', async (req, res) => {
  const { range, user, activeLabId, activeBranchId } = req.body;

  try {
    void Branch;
    void Rating;

    const labDoc = await Laboratory.findOne({}).lean() as any;
    const labName = labDoc?.name || labDoc?.labName || "Laboratório";

    const { userBranches } = await resolveAccessibleBranches(user, activeLabId, activeBranchId);

    const query: Record<string, unknown> = {};
    if (user && userBranches && userBranches.length > 0) {
      query.branchId = {
        $in: userBranches.map((b: { _id: string }) => new mongoose.Types.ObjectId(b._id)),
      };
    }

    const exams = await Exam.find({}).lean() as any[];
    const examIdPriceMap = new Map<string, number>();
    const examIdCategoryMap = new Map<string, string>();
    exams.forEach((e) => {
      examIdPriceMap.set(e._id.toString(), e.price ?? 0);
      examIdCategoryMap.set(e._id.toString(), e.category || e.categoria || "Outros");
    });

    const { currentStart, currentEnd, today } = getDateRanges(range);

    const dataQuery: Record<string, unknown> = { ...query };
    dataQuery.date = { $gte: currentStart, $lte: currentEnd };

    const appointments = await Appointment.find(dataQuery)
      .populate("branchId", "name")
      .populate("exam")
      .lean() as any[];

    const appointmentsPatientIds = [...new Set(appointments.map(a => a.patient))];
    const appointmentsUsers = await User.find({ id: { $in: appointmentsPatientIds } }).select('id name').lean();
    const appointmentsUserMap = new Map(appointmentsUsers.map((u: any) => [u.id, u.name]));

    let periodLabel = "";

    const buckets: Array<{ dateKey: string; tooltipLabel: string; count: number }> = [];
    let monthlyGranularity = false;

    if (range === "7") {
      periodLabel = `Últimos 7 dias`;
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        buckets.push({
          dateKey: formatDate(d),
          tooltipLabel: `${WEEK_DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()]}`,
          count: 0,
        });
      }
    } else if (range === "month") {
      periodLabel = `${MONTHS_FULL[today.getMonth()]} ${today.getFullYear()}`;
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      for (let day = 1; day <= last.getDate(); day++) {
        const d = new Date(today.getFullYear(), today.getMonth(), day);
        buckets.push({
          dateKey: formatDate(d),
          tooltipLabel: `${WEEK_DAYS[d.getDay()]}, ${day} de ${MONTHS_FULL[d.getMonth()]}`,
          count: 0,
        });
      }
    } else if (range === "year") {
      monthlyGranularity = true;
      periodLabel = "Últimos 12 meses";
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        buckets.push({
          dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          tooltipLabel: `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`,
          count: 0,
        });
      }
    } else {
      periodLabel = "Últimos 30 dias";
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        buckets.push({
          dateKey: formatDate(d),
          tooltipLabel: `${d.getDate()} de ${MONTHS_FULL[d.getMonth()]}`,
          count: 0,
        });
      }
    }

    const resolvePrice = (a: any): number => {
      if (!a.exam) return 0;
      if (typeof a.exam === "object" && a.exam.price !== undefined) return a.exam.price;
      return examIdPriceMap.get(a.exam.toString()) ?? 0;
    };
    const resolveCategory = (a: any): string => {
      if (!a.exam) return "Outros";
      if (typeof a.exam === "object") return a.exam.category || a.exam.categoria || "Outros";
      return examIdCategoryMap.get(a.exam.toString()) ?? "Outros";
    };
    const resolveExamName = (a: any): string =>
      a.exam?.name ?? a.exam?.nome_exame ?? "Exame Indefinido";

    appointments.forEach((a) => {
      if (!a.date) return;
      const key = monthlyGranularity ? a.date.substring(0, 7) : a.date;
      const bucket = buckets.find((b) => b.dateKey === key);
      if (bucket) bucket.count++;
    });

    let totalRevenue = 0;
    let totalAppointments = 0;
    let totalCancellations = 0;
    const branchRevenueMap = new Map<string, number>();
    const categoryRevenueMap = new Map<string, number>();
    const detail: any[] = [];

    appointments.forEach((a) => {
      const inPeriod = a.date && a.date >= currentStart && a.date <= currentEnd;
      if (!inPeriod) return;

      const price = resolvePrice(a);
      const isCompleted = a.status === "Realizado" || a.status === "Concluído";
      const branchName = stripLabName(a.branchId?.name ?? "Sem Filial");

      totalAppointments++;
      if (isCompleted) {
        totalRevenue += price;
        branchRevenueMap.set(branchName, (branchRevenueMap.get(branchName) ?? 0) + price);
        const cat = resolveCategory(a);
        categoryRevenueMap.set(cat, (categoryRevenueMap.get(cat) ?? 0) + price);
      }
      if (a.status === "Cancelado") totalCancellations++;

      detail.push({
        patient: appointmentsUserMap.get(a.patient) || a.patient || "",
        exam: resolveExamName(a),
        branch: branchName,
        date: a.date ?? "",
        time: a.time ?? "",
        status: a.status ?? "",
        price,
      });
    });

    detail.sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));

    const topBranches = Array.from(branchRevenueMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const topCategories = Array.from(categoryRevenueMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const ratingDocs = await Rating.find({
      ...(query.branchId ? { branchId: query.branchId } : {}),
      createdAt: {
        $gte: new Date(currentStart),
        $lte: new Date(currentEnd + "T23:59:59Z"),
      },
    }).lean() as any[];
    const rating =
      ratingDocs.length > 0
        ? ratingDocs.reduce((s: number, r: any) => s + r.rating, 0) / ratingDocs.length
        : null;

    return res.json({
      periodLabel,
      labName,
      metrics: {
        totalRevenue,
        totalAppointments,
        totalCancellations,
        rating: rating != null ? Math.round(rating * 100) / 100 : null,
      },
      chartBuckets: buckets,
      topBranches,
      topCategories,
      appointments: detail,
    });
  } catch (error: any) {
    console.error('Erro ao buscar dados de exportação de dashboard:', error);
    return res.status(500).json({ error: error.message });
  }
});

const WEEK_DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const MONTHS_FULL = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default router;
