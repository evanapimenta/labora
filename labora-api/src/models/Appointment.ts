import mongoose, { Schema, Document } from 'mongoose';

export type AppointmentStatus = "Confirmado" | "Check-in" | "Aguardando Resultado" | "Concluído" | "Realizado" | "Cancelado" | "Pendente";

export interface IAppointment extends Document {
  time: string;
  date: string; // YYYY-MM-DD
  patient: string;
  cpf: string;
  exam: mongoose.Types.ObjectId;
  operator?: mongoose.Types.ObjectId | null;
  status: AppointmentStatus;
  branchId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    time: { 
      type: String, 
      required: [true, 'O horário é obrigatório'] 
    },
    date: { 
      type: String, 
      required: [true, 'A data é obrigatória'],
      index: true 
    },
    patient: { 
      type: String, 
      required: [true, 'O nome do paciente é obrigatório'],
      trim: true 
    },
    cpf: { 
      type: String, 
      required: [true, 'O CPF do paciente é obrigatório'],
      trim: true 
    },
    exam: { 
      type: Schema.Types.ObjectId, 
      ref: 'Exam', 
      required: [true, 'O exame é obrigatório'],
      index: true 
    },
    operator: { 
      type: Schema.Types.ObjectId, 
      ref: 'Admin',
      required: false,
      index: true 
    },
    status: { 
      type: String, 
      required: [true, 'O status é obrigatório'],
      enum: ['Confirmado', 'Check-in', 'Aguardando Resultado', 'Concluído', 'Realizado', 'Cancelado', 'Pendente'],
      default: 'Confirmado'
    },
    branchId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Branch', 
      required: [true, 'A filial é obrigatória'],
      index: true 
    }
  },
  { timestamps: true }
);

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
