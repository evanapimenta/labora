import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './Laboratory';

export interface IBranch extends Document {
  name: string;
  laboratoryId: mongoose.Types.ObjectId;
  phoneNumber: string;
  email: string;
  openingHours: string;
  address: IAddress;
  status: string;
  admin?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  number: { type: String, required: true },
  complement: { type: String },
  neighborhood: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'Brasil' },
  latitude: { type: Number },
  longitude: { type: Number }
});

const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: [true, 'O nome não pode estar em branco'] },
    laboratoryId: { type: Schema.Types.ObjectId, ref: 'Laboratory', required: [true, 'Informe o id do laboratório'] },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\d{10,11}$/, 'Número de telefone inválido']
    },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    openingHours: { type: String, required: [true, 'Horário de funcionamento não pode estar em branco'] },
    address: { type: AddressSchema, required: true },
    status: { type: String, default: 'Ativa' },
    admin: { type: String, ref: 'User', default: null }
  },
  { timestamps: true }
);

export default mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);

