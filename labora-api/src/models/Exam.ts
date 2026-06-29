import mongoose, { Schema, Document } from 'mongoose';

export type ExamCategory = string;

export interface IExam extends Document {
  code: string;
  name: string;
  category: ExamCategory;
  price: number;
  duration: string;
  active: boolean;
  description?: string;
  sexSpecific?: boolean;
  sampleType?: string;
  preparationInstructions?: string;
  estimatedResultTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    code: { 
      type: String, 
      required: [true, 'O código do exame é obrigatório'], 
      unique: true,
      trim: true 
    },
    name: { 
      type: String, 
      required: [true, 'O nome do exame é obrigatório'],
      trim: true 
    },
    category: { 
      type: String, 
      required: [true, 'A categoria do exame é obrigatória']
    },
    price: { 
      type: Number, 
      required: [true, 'O preço base é obrigatório'],
      default: 0
    },
    duration: { 
      type: String, 
      required: [true, 'A duração estimada é obrigatória'],
      default: '24h'
    },
    active: { 
      type: Boolean, 
      default: true 
    },
    description: { type: String },
    sexSpecific: { type: Boolean, default: false },
    sampleType: { type: String },
    preparationInstructions: { type: String },
    estimatedResultTime: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);

