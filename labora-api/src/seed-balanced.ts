import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

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
  const patients = await Patient.find().limit(100).lean() as any[];

  if (!exams.length || !branches.length || !patients.length) {
    console.error('No exams, branches or patients found.');
    process.exit(1);
  }

  console.log('Limpando agendamentos antigos...');
  await Appointment.deleteMany({});

  console.log(`Criando agendamentos suaves para 2025 e 2026 em TODAS as ${branches.length} filiais...`);
  
  const statuses = ['Pendente', 'Confirmado', 'Concluído', 'Cancelado', 'Realizado', 'Check-in'];
  
  const startDate = new Date(2025, 0, 1);
  const endDate = new Date(2026, 11, 31);
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let batch = [];

  for (let i = 0; i <= totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateString = d.toISOString().split('T')[0];
    
    for (const branch of branches) {
      const baseCount = 10 + ((i / totalDays) * 10); // Grows from 10 to 20
      
      // Just a gentle random variance between 0.85x and 1.15x
      const randomVariance = 0.85 + (Math.random() * 0.3);
      
      const count = Math.max(1, Math.floor(baseCount * randomVariance));
      
      for (let j = 0; j < count; j++) {
        const exam = exams[Math.floor(Math.random() * exams.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const p = patients[Math.floor(Math.random() * patients.length)];
        const patientName = `Paciente ${Math.floor(Math.random() * 100)}`; 
        const hour = Math.floor(Math.random() * 10) + 8; // 8 to 17
        
        batch.push({
          patient: patientName,
          cpf: p.cpf,
          date: dateString,
          time: `${hour.toString().padStart(2, '0')}:00`,
          exam: exam._id,
          branchId: branch._id,
          status: status
        });

        if (batch.length >= 15000) {
          await Appointment.insertMany(batch);
          batch = [];
        }
      }
    }
  }

  if (batch.length > 0) {
    await Appointment.insertMany(batch);
  }

  console.log('Seed suave concluído com sucesso!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
