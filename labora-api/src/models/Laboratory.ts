import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface ILaboratory extends Document {
  name?: string;
  labName?: string;
  cnpj: string;
  phoneNumber: string;
  email: string;
  address: IAddress;
  status: string;
  superAdmin?: string | null; // UUID string referencing User
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
  longitude: { type: Number },
});

const LaboratorySchema = new Schema<ILaboratory>(
  {
    name: { type: String },
    labName: { type: String },
    cnpj: { type: String, required: [true, 'CNPJ é obrigatório'], unique: true },
    phoneNumber: { 
      type: String, 
      required: [true, 'Telefone da matriz é obrigatório'],
      match: [/^\d{10,11}$/, 'Número de telefone inválido']
    },
    email: { 
      type: String, 
      required: [true, 'Email do laboratório é obrigatório'],
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    address: { type: AddressSchema, required: true },
    status: { type: String, default: 'Ativo' },
    superAdmin: { type: String, ref: 'User', default: null }
  },
  { timestamps: true, collection: 'labs' }
);

export default mongoose.models.Laboratory || mongoose.model<ILaboratory>('Laboratory', LaboratorySchema);

