∑import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.join(__dirname, '../.env') });

import User from './models/User';
import Patient from './models/Patient';
import Appointment from './models/Appointment';
import Exam from './models/Exam';
import Branch from './models/Branch';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found in .env');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const exams = await Exam.find().lean() as any[];
  const branches = await Branch.find().lean() as any[];

  if (!exams.length || !branches.length) {
    console.error('No exams or branches found.');
    process.exit(1);
  }

  console.log('Criando 100 pacientes...');
  const newPatients = [];

  for (let i = 0; i < 100; i++) {
    const id = crypto.randomUUID();
    const cpf = Math.floor(Math.random() * 90000000000) + 10000000000;

    // 1. Create User
    const user = await User.create({
      id: id,
      name: `Paciente Teste ${i + 1}`,
      email: `paciente${i + 1}@teste.com`,
      active: true,
      role: 'PATIENT',
      verified: true
    });

    // 2. Create Patient
    const patient = await Patient.create({
      id: id,
      cpf: String(cpf),
      phoneNumber: `119${Math.floor(Math.random() * 90000000)}`,
      gender: ['MASCULINO', 'FEMININO', 'OUTRO'][Math.floor(Math.random() * 3)],
      address: {
        street: 'Rua Exemplo',
        number: String(i + 1),
        neighborhood: 'Bairro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        country: 'Brasil'
      }
    });

    newPatients.push({ name: user.name, cpf: patient.cpf });
  }

  console.log('Criando agendamentos para 2025...');

  // No "Aguardando Resultado"
  const statuses = ['Pendente', 'Confirmado', 'Concluído', 'Cancelado', 'Realizado', 'Check-in'];

  for (let month = 0; month < 12; month++) {
    // Random amount of appointments per month (between 10 and 50)
    const count = Math.floor(Math.random() * 40) + 10;

    for (let j = 0; j < count; j++) {
      const exam = exams[Math.floor(Math.random() * exams.length)];
      const branch = branches[Math.floor(Math.random() * branches.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const patient = newPatients[Math.floor(Math.random() * newPatients.length)];

      const day = Math.floor(Math.random() * 28) + 1;
      const hour = Math.floor(Math.random() * 10) + 8; // 8 to 17

      const aptDate = new Date(2025, month, day);

      await Appointment.create({
        patient: patient.name,
        cpf: patient.cpf,
        date: aptDate.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:00`,
        exam: exam._id,
        branchId: branch._id,
        status: status
      });
    }
  }

  console.log('Seed de 2025 concluído com sucesso!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
