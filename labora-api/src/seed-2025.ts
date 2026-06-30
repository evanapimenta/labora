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
import Admin from './models/Admin';

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

  // Get existing users & patients
  const existingUsers = await User.find({ role: 'PATIENT' }).lean() as any[];
  const existingPatients = await Patient.find({ id: { $in: existingUsers.map(u => u.id) } }).lean() as any[];

  let newPatients = existingPatients.map(p => {
    const u = existingUsers.find(usr => usr.id === p.id);
    return u ? { name: u.name, cpf: p.cpf } : null;
  }).filter(Boolean) as { name: string; cpf: string }[];

  if (newPatients.length === 0) {
    console.log('Nenhum paciente existente encontrado. Criando 100 pacientes de teste...');
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
  } else {
    console.log(`Usando os ${newPatients.length} pacientes existentes na collection users.`);
  }

  // Obter ou criar um operador TECH
  const techAdmins = await Admin.find({ scope: 'TECH' }).lean() as any[];
  let techAdminId: mongoose.Types.ObjectId;
  if (techAdmins.length === 0) {
    console.log('Nenhum operador TECH encontrado. Criando operador TECH de teste...');
    const newTech = await Admin.create({
      id: Math.floor(Math.random() * 9000) + 1000,
      name: 'Técnico de Laboratório',
      username: 'tecnico_seed',
      email: 'tecnico@seed.com',
      phoneNumber: '11999999999',
      scope: 'TECH',
      assignedTo: [branches[0]._id],
      status: 'Ativo'
    });
    techAdminId = newTech._id;
  } else {
    techAdminId = techAdmins[Math.floor(Math.random() * techAdmins.length)]._id;
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
        status: status,
        operator: techAdminId
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
