import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string; // UUID string matching Spring's UUID format
  name: string;
  email: string;
  password?: string;
  active: boolean;
  role?: 'PATIENT' | 'SYSTEM' | 'LAB' | 'BRANCH' | null;
  imagePathUrl?: String;
  token?: string | null;
  verified: boolean;
  tokenExpiresIn?: Date | null;
  lastLoginAt?: Date | null;
  settings?: any;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: [true, 'Nome é obrigatório'] },
    email: { 
      type: String, 
      required: [true, 'Email é obrigatório'], 
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    password: { type: String },
    active: { type: Boolean, default: false },
    role: { 
      type: String, 
      enum: ['PATIENT', 'SYSTEM', 'LAB', 'BRANCH'], 
      required: false,
      default: null
    },
    imagePathUrl: { type: String },
    token: { type: String, default: null },
    verified: { type: Boolean, default: false },
    tokenExpiresIn: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    settings: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true, collection: 'users' }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
