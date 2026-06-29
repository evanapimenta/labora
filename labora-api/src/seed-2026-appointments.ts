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
import ExamResult from './models/ExamResult';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found in .env');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const patients = await Patient.find().lean() as any[];
  const exams = await Exam.find().lean() as any[];
  const branches = await Branch.find().lean() as any[];
  const users = await User.find({ id: { $in: patients.map(p => p.id) } }).lean() as any[];

  if (!patients.length || !exams.length || !branches.length || !users.length) {
    console.error('Missing patients, users, exams, or branches. Cannot seed.');
    process.exit(1);
  }

  console.log(`Found ${patients.length} patients, ${exams.length} exams, ${branches.length} branches.`);

  let appointmentsCreated = 0;
  let resultsCreated = 0;

  const today = new Date();
  const endOfYear = new Date('2027-01-01T00:00:00Z');
  
  for (const branch of branches) {
    // Generate around 10 appointments for each branch
    const numAppointments = Math.floor(Math.random() * 5) + 8; // 8 to 12

    for (let i = 0; i < numAppointments; i++) {
      // Random date between today and Jan 1, 2027
      const randomTime = new Date(today.getTime() + Math.random() * (endOfYear.getTime() - today.getTime()));
      
      const dateStr = randomTime.toISOString().split('T')[0];
      const hours = String(Math.floor(Math.random() * 9) + 8).padStart(2, '0'); // 08 to 16
      const minutes = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
      const timeStr = `${hours}:${minutes}`;

      const randomExam = exams[Math.floor(Math.random() * exams.length)];
      const randomPatient = patients[Math.floor(Math.random() * patients.length)];
      const user = users.find(u => u.id === randomPatient.id) || users[0];
      
      const statuses = ['Pendente', 'Confirmado', 'Concluído', 'Cancelado', 'Aguardando Resultado'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const appt = await Appointment.create({
        patient: user.name,
        cpf: randomPatient.cpf,
        date: dateStr,
        time: timeStr,
        exam: randomExam._id,
        branchId: branch._id,
        status: status
      });
      appointmentsCreated++;

      if (status === 'Concluído') {
        await ExamResult.create({
          appointmentId: appt._id,
          fileName: `Resultado_${(randomExam?.name || 'Exame_Generico').replace(/\s+/g, '_')}_2026.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          notes: 'Exame realizado com sucesso. Resultado gerado por script de seed 2026.',
          uploadedBy: 'Sistema Automático'
        });
        resultsCreated++;
      }
    }
  }

  console.log(`Seed completed successfully! Created ${appointmentsCreated} appointments and ${resultsCreated} results between now and 2027.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
