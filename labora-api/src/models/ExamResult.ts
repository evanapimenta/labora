import mongoose, { Schema, Document } from 'mongoose';

export interface IExamResult extends Document {
  appointmentId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  notes?: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamResultSchema = new Schema<IExamResult>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'O ID do agendamento é obrigatório'],
      index: true
    },
    fileName: {
      type: String,
      required: [true, 'O nome do arquivo é obrigatório'],
      trim: true
    },
    fileUrl: {
      type: String,
      required: [true, 'A URL do arquivo é obrigatória'],
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    uploadedBy: {
      type: String,
      required: [true, 'O responsável pelo upload é obrigatório'],
      trim: true,
      default: 'Sistema'
    }
  },
  { timestamps: true }
);

export default mongoose.models.ExamResult || mongoose.model<IExamResult>('ExamResult', ExamResultSchema);
