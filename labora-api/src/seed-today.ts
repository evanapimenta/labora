import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import Patient from './models/Patient';
import User from './models/User';
import Exam from './models/Exam';
import Branch from './models/Branch';
import Appointment from './models/Appointment';

async function seedToday() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found in .env');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const patients = await Patient.find().lean() as any[];
  const exams = await Exam.find().lean() as any[];
  const branches = await Branch.find().lean() as any[];
  const users = await User.find({ id: { $in: patients.map(p => p.id) } }).lean() as any[];

  if (!patients.length || !exams.length || !branches.length || !users.length) {
    console.error('Missing data to seed.');
    process.exit(1);
  }

  let created = 0;
  
  // Create 5 appointments specifically for TODAY for each branch
  // Format today as YYYY-MM-DD
  const todayDate = new Date();
  const dateStr = todayDate.getFullYear() + '-' + String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + String(todayDate.getDate()).padStart(2, '0');

  for (const branch of branches) {
    for (let i = 0; i < 5; i++) {
      const hours = String(8 + i * 2).padStart(2, '0'); // 08, 10, 12, 14, 16
      const timeStr = `${hours}:00`;

      const randomExam = exams[Math.floor(Math.random() * exams.length)];
      const randomPatient = patients[Math.floor(Math.random() * patients.length)];
      const user = users.find(u => u.id === randomPatient.id) || users[0];
      
      const statuses = ['Pendente', 'Realizado', 'Cancelado', 'Check-in'];
      let status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // se for pendente e a hora for de manhã, mudar pra check-in ou algo assim
      if (hours === '08' || hours === '10') status = 'Realizado';

      await Appointment.create({
        patient: user.name,
        cpf: randomPatient.cpf,
        date: dateStr,
        time: timeStr,
        exam: randomExam._id,
        branchId: branch._id,
        status: status
      });
      created++;
    }
  }

  console.log(`Successfully created ${created} appointments for exactly TODAY (${dateStr}).`);
  await mongoose.disconnect();
}

seedToday().catch(console.error);
