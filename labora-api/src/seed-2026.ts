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

  console.log('Criando agendamentos para 2026...');
  
  const statuses = ['Pendente', 'Confirmado', 'Concluído', 'Cancelado', 'Realizado', 'Check-in'];

  for (let month = 0; month < 12; month++) {
    const count = Math.floor(Math.random() * 40) + 10; 
    
    for (let j = 0; j < count; j++) {
      const exam = exams[Math.floor(Math.random() * exams.length)];
      const branch = branches[Math.floor(Math.random() * branches.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const p = patients[Math.floor(Math.random() * patients.length)];
      const patientName = `Paciente Teste ${Math.floor(Math.random() * 100)}`; // Since we didn't populate User names perfectly back, just fake it or use Patient cpf
      
      const day = Math.floor(Math.random() * 28) + 1;
      const hour = Math.floor(Math.random() * 10) + 8; // 8 to 17
      
      const aptDate = new Date(2026, month, day);
      
      await Appointment.create({
        patient: patientName,
        cpf: p.cpf,
        date: aptDate.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:00`,
        exam: exam._id,
        branchId: branch._id,
        status: status
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
