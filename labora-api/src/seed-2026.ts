import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import Patient from './models/Patient';
import User from './models/User';
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
  const existingUsers = await User.find({ role: 'PATIENT' }).lean() as any[];
  const existingPatients = await Patient.find({ id: { $in: existingUsers.map(u => u.id) } }).lean() as any[];

  const userPatientPairs = existingPatients.map(p => {
    const u = existingUsers.find(usr => usr.id === p.id);
    return u ? { id: u.id, name: u.name, cpf: p.cpf } : null;
  }).filter(Boolean) as { id: string; name: string; cpf: string }[];

  if (!exams.length || !branches.length || !userPatientPairs.length) {
    console.error('No exams, branches or patients found. Please run seed-2025 first.');
    process.exit(1);
  }

  // Obter ou criar um operador TECH
  const techAdmins = await Admin.find({ scope: 'TECH' }).lean() as any[];
  let techAdminId: mongoose.Types.ObjectId;
  if (techAdmins.length === 0) {
    console.log('Nenhum operador TECH encontrado. Criando operador TECH de teste...');
    const newTech = await Admin.create({
      id: Math.floor(Math.random() * 9000) + 1000,
      name: 'Técnico de Laboratório',
      username: 'tecnico_seed_2026',
      email: 'tecnico_2026@seed.com',
      phoneNumber: '11999999999',
      scope: 'TECH',
      assignedTo: [branches[0]._id],
      status: 'Ativo'
    });
    techAdminId = newTech._id;
  } else {
    techAdminId = techAdmins[Math.floor(Math.random() * techAdmins.length)]._id;
  }

  console.log('Criando agendamentos para 2026...');
  
  const statuses = ['Pendente', 'Confirmado', 'Concluído', 'Cancelado', 'Realizado', 'Check-in'];

  for (let month = 0; month < 12; month++) {
    const count = Math.floor(Math.random() * 40) + 10; 
    
    for (let j = 0; j < count; j++) {
      const exam = exams[Math.floor(Math.random() * exams.length)];
      const branch = branches[Math.floor(Math.random() * branches.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const patient = userPatientPairs[Math.floor(Math.random() * userPatientPairs.length)];
      
      const day = Math.floor(Math.random() * 28) + 1;
      const hour = Math.floor(Math.random() * 10) + 8; // 8 to 17
      
      const aptDate = new Date(2026, month, day);
      
      await Appointment.create({
        patient: patient.id,
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

  console.log('Seed de 2026 concluído com sucesso!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
