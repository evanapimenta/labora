import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  appointmentId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'O ID do agendamento é obrigatório'],
      unique: true,
      index: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'A filial é obrigatória'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'A nota é obrigatória'],
      min: [1, 'Nota mínima é 1'],
      max: [5, 'Nota máxima é 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comentário muito longo'],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);
