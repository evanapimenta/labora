import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import Appointment from './models/Appointment';
import Exam from './models/Exam';
import Branch from './models/Branch';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found in .env');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const exams = await Exam.find().limit(5).lean() as any[];
  const branches = await Branch.find().limit(3).lean() as any[];

  if (!exams.length || !branches.length) {
    console.error('No exams or branches found to create appointments.');
    process.exit(1);
  }

  console.log('Seeding monthly appointments for the last 12 months...');
  
  const statuses = ['Pendente', 'Confirmado', 'Concluído', 'Cancelado'];

  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    
    // Create random number of appointments per month, growing towards present
    const count = Math.floor(Math.random() * 10) + (12 - i) * 5; 
    
    for (let j = 0; j < count; j++) {
      const exam = exams[Math.floor(Math.random() * exams.length)];
      const branch = branches[Math.floor(Math.random() * branches.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const day = Math.floor(Math.random() * 28) + 1;
      const hour = Math.floor(Math.random() * 10) + 8; // 8 to 17
      
      const aptDate = new Date(d.getFullYear(), d.getMonth(), day);
      
      await Appointment.create({
        patient: `Random Patient ${Math.floor(Math.random() * 1000)}`,
        cpf: `123456789${Math.floor(Math.random() * 10)}`,
        date: aptDate.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:00`,
        exam: exam._id,
        branchId: branch._id,
        status: status
      });
    }
  }

  console.log('Seed completed successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
