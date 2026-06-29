import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  phoneNumber: string;
  scope: 'SYSTEM' | 'LAB' | 'BRANCH' | 'TECH';
  assignedTo: mongoose.Types.ObjectId[];
  status: 'Ativo' | 'Pendente' | 'Inativo';
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: [true, 'Nome é obrigatório'] },
    username: { type: String, required: [true, 'Username é obrigatório'], unique: true },
    email: { 
      type: String, 
      required: [true, 'Email é obrigatório'], 
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    password: { type: String },
    phoneNumber: { type: String, required: [true, 'Telefone é obrigatório'] },
    scope: { type: String, enum: ['SYSTEM', 'LAB', 'BRANCH', 'TECH'], required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, required: true }],
    status: { type: String, enum: ['Ativo', 'Pendente', 'Inativo'], default: 'Ativo' }
  },
  { timestamps: true }
);

if (mongoose.models.Admin) {
  delete mongoose.models.Admin;
}

export default mongoose.model<IAdmin>('Admin', AdminSchema);
