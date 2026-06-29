import { Router } from 'express';
import Exam from '../models/Exam';

const router = Router();

function formatDurationFromHours(hours: unknown): string | null {
  if (typeof hours !== "number" || !Number.isFinite(hours) || hours <= 0) return null;
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `${days} dia${days > 1 ? "s" : ""}`;
  }
  return `${hours}h`;
}

function formatDescription(desc: string | null | undefined): string | null {
  if (!desc) return null;
  return desc
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean)
    .join('\n\n');
}

function mapExam(e: any) {
  if (!e) return null;
  const informacoes_gerais = e.informacoes_gerais ?? null;
  
  const duration =
    e.duration ?? 
    formatDurationFromHours(informacoes_gerais?.tempo_resultado_horas) ?? 
    "N/A";

  const description = 
    formatDescription(e.description ?? informacoes_gerais?.descricao) ?? 
    null;

  const sampleType = 
    e.sampleType ?? 
    e.tipo_amostra ?? 
    informacoes_gerais?.tipo_amostra ?? 
    null;

  let preparationInstructions = e.preparationInstructions ?? null;
  if (!preparationInstructions && informacoes_gerais) {
    const parts: string[] = [];
    if (informacoes_gerais.jejum) {
      parts.push(`• Jejum: ${informacoes_gerais.jejum}`);
    }
    if (informacoes_gerais.restricoes_e_preparo) {
      if (Array.isArray(informacoes_gerais.restricoes_e_preparo)) {
        parts.push(...informacoes_gerais.restricoes_e_preparo.map((item: string) => `• ${item.trim()}`));
      } else if (typeof informacoes_gerais.restricoes_e_preparo === 'string') {
        parts.push(`• ${informacoes_gerais.restricoes_e_preparo.trim()}`);
      }
    }
    if (parts.length > 0) {
      preparationInstructions = parts.join('\n');
    }
  }

  const estimatedResultTime = 
    e.estimatedResultTime ?? 
    (duration !== "N/A" ? duration : null) ?? 
    null;

  return {
    _id: String(e._id),
    id: String(e._id),
    code: e.code ?? e.codigo_exame ?? null,
    name: e.name ?? e.nome_exame ?? "Exame Indefinido",
    category: e.category ?? e.categoria ?? "Outros",
    categoria: e.categoria ?? e.category ?? "Outros",
    tipo_amostra: e.tipo_amostra ?? null,
    restricao_sexo: e.restricao_sexo ?? null,
    price: typeof e.price === "number" ? e.price : 0,
    duration,
    active: e.active !== undefined ? e.active : true,
    description,
    sexSpecific: e.sexSpecific ?? false,
    sampleType,
    preparationInstructions,
    estimatedResultTime,
    informacoes_gerais,
    createdAt: e.createdAt ?? null,
    updatedAt: e.updatedAt ?? null,
  };
}

router.get('/', async (req, res) => {
  try {
    const { active, category, q, limit, skip } = req.query;

    const filter: Record<string, unknown> = {};

    if (active === "true") filter.active = { $ne: false };
    if (active === "false") filter.active = false;

    if (category) {
      filter.$or = [{ category }, { categoria: category }];
    }

    if (q) {
      const re = new RegExp((q as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const orMatch = [{ name: re }, { nome_exame: re }];
      filter.$or = filter.$or
        ? [...(filter.$or as object[]), ...orMatch]
        : orMatch;
    }

    const limitVal = Math.min(Number(limit ?? 100) || 100, 500);
    const skipVal = Math.max(Number(skip ?? 0) || 0, 0);

    const [items, total] = await Promise.all([
      Exam.find(filter)
        .sort({ name: 1 })
        .skip(skipVal)
        .limit(limitVal)
        .lean(),
      Exam.countDocuments(filter),
    ]);

    const data = items.map((e: any) => mapExam(e));

    return res.json({ total, count: data.length, skip: skipVal, limit: limitVal, data });
  } catch (error: any) {
    console.error("[GET /api/exames]", error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/categorias', async (req, res) => {
  try {
    const exams = await Exam.find({ active: { $ne: false } }, { category: 1, categoria: 1 }).lean();
    const categories = new Set<string>();
    for (const e of exams) {
      const cat = e.category || e.categoria || 'Outros';
      categories.add(cat);
    }
    const sortedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b));
    return res.json(sortedCategories);
  } catch (error: any) {
    console.error("[GET /api/exames/categorias]", error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await Exam.findById(id).lean() as any;
    if (!exam) {
      return res.status(404).json({ error: 'Exame não encontrado.' });
    }
    return res.json(mapExam(exam));
  } catch (error: any) {
    console.error('Erro ao buscar exame por ID:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, category, description, sexSpecific, sampleType, preparationInstructions, estimatedResultTime, price, duration, code } = req.body;
  try {
    const examCode = code || 'EXM-' + Math.floor(100000 + Math.random() * 900000);
    const newExam = new Exam({
      code: examCode,
      name,
      category: category || 'Sangue',
      description,
      sexSpecific: sexSpecific || false,
      sampleType,
      preparationInstructions,
      estimatedResultTime: estimatedResultTime || duration || '24h',
      price: price || 0,
      duration: duration || estimatedResultTime || '24h',
      active: true
    });
    await newExam.save();
    return res.status(201).json(newExam);
  } catch (error: any) {
    console.error('Erro ao criar exame:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, description, sexSpecific, sampleType, preparationInstructions, estimatedResultTime, price, duration } = req.body;
  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (sexSpecific !== undefined) updateData.sexSpecific = sexSpecific;
    if (sampleType !== undefined) updateData.sampleType = sampleType;
    if (preparationInstructions !== undefined) updateData.preparationInstructions = preparationInstructions;
    if (estimatedResultTime !== undefined) {
      updateData.estimatedResultTime = estimatedResultTime;
      updateData.duration = estimatedResultTime;
    }
    if (price !== undefined) updateData.price = price;
    if (duration !== undefined) updateData.duration = duration;

    const updated = await Exam.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Exame não encontrado.' });
    }
    return res.json(updated);
  } catch (error: any) {
    console.error('Erro ao atualizar exame:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Exam.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Exame não encontrado.' });
    }
    return res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao desativar exame:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;

