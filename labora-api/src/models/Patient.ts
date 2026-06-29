import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  id: string; // matches User's UUID string
  birthDate?: string; // YYYY-MM-DD
  cpf: string;
  phoneNumber?: string;
  gender?: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  weight?: number;
  height?: number;
  address?: {
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
  };
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
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

const PatientSchema = new Schema<IPatient>(
  {
    id: { type: String, required: true, unique: true },
    birthDate: { type: String },
    cpf: { type: String, required: [true, 'CPF é obrigatório'], unique: true },
    phoneNumber: { type: String },
    gender: { type: String, enum: ['MASCULINO', 'FEMININO', 'OUTRO'] },
    weight: { type: Number },
    height: { type: Number },
    address: { type: AddressSchema },
    emergencyContactName: { type: String },
    emergencyContactNumber: { type: String }
  },
  { timestamps: true, collection: 'patients' }
);

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
