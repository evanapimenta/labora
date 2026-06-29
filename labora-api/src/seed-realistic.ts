import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import Patient from './models/Patient';
import User from './models/User';
import Exam from './models/Exam';
import Branch from './models/Branch';
import Appointment from './models/Appointment';

// Import ExamResult if it exists, otherwise define fallback model
let ExamResult: any;
try {
  ExamResult = require('./models/ExamResult').default;
} catch (e) {
  // fallback if model not found
}

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

  console.log('Limpando agendamentos antigos...');
  await Appointment.deleteMany({});
  if (ExamResult) {
    console.log('Limpando resultados antigos...');
    await ExamResult.deleteMany({});
  }

  console.log('Criando agendamentos realistas baseados na data atual...');

  const today = new Date();
  const statuses = ['Pendente', 'Confirmado', 'Concluído', 'Cancelado', 'Realizado', 'Check-in'];
  
  let appointmentsCreated = 0;
  let resultsCreated = 0;
  let batch: any[] = [];

  // Generate appointments for the last 365 days
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    // Format YYYY-MM-DD
    const dateStr = d.getFullYear() + '-' + 
                    String(d.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(d.getDate()).padStart(2, '0');
    
    // For the last 10 days, make sure we have a dense distribution (1 to 3 appointments per branch per day)
    // For other days, make it sparser (about 10% chance of an appointment per branch)
    const isRecent = i <= 9;

    for (const branch of branches) {
      let count = 0;
      if (isRecent) {
        count = Math.floor(Math.random() * 3) + 1; // 1 to 3
      } else {
        // 12% probability of having 1 or 2 appointments
        if (Math.random() < 0.12) {
          count = Math.floor(Math.random() * 2) + 1; // 1 to 2
        }
      }

      for (let j = 0; j < count; j++) {
        const randomExam = exams[Math.floor(Math.random() * exams.length)];
        const randomPatient = patients[Math.floor(Math.random() * patients.length)];
        const user = users.find(u => u.id === randomPatient.id) || users[0];
        
        const hours = String(Math.floor(Math.random() * 9) + 8).padStart(2, '0'); // 08 to 16
        const minutes = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
        const timeStr = `${hours}:${minutes}`;

        // Older appointments are more likely to be Concluído/Realizado
        // Recent appointments can be Pendente/Confirmado/Check-in
        let status = 'Concluído';
        if (i < 3) {
          status = statuses[Math.floor(Math.random() * statuses.length)];
        } else {
          // 80% Concluído/Realizado/Cancelado, 20% others
          const pastStatuses = ['Concluído', 'Realizado', 'Cancelado', 'Concluído', 'Realizado'];
          status = pastStatuses[Math.floor(Math.random() * pastStatuses.length)];
        }

        batch.push({
          patient: user.name,
          cpf: randomPatient.cpf,
          date: dateStr,
          time: timeStr,
          exam: randomExam._id,
          branchId: branch._id,
          status: status
        });

        if (batch.length >= 1000) {
          const inserted = await Appointment.insertMany(batch);
          appointmentsCreated += inserted.length;

          // Create exam results for Concluído status
          if (ExamResult) {
            const resultBatch = [];
            for (const appt of inserted) {
              if (appt.status === 'Concluído') {
                resultBatch.push({
                  appointmentId: appt._id,
                  fileName: `Resultado_${(randomExam?.name || 'Exame').replace(/\s+/g, '_')}_2026.pdf`,
                  fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                  notes: 'Resultado gerado automaticamente.',
                  uploadedBy: 'Sistema'
                });
                resultsCreated++;
              }
            }
            if (resultBatch.length > 0) {
              await ExamResult.insertMany(resultBatch);
            }
          }

          batch = [];
        }
      }
    }
  }

  if (batch.length > 0) {
    const inserted = await Appointment.insertMany(batch);
    appointmentsCreated += inserted.length;

    if (ExamResult) {
      const resultBatch = [];
      for (const appt of inserted) {
        if (appt.status === 'Concluído') {
          // need to find corresponding exam name
          const examObj = exams.find(e => String(e._id) === String(appt.exam));
          resultBatch.push({
            appointmentId: appt._id,
            fileName: `Resultado_${(examObj?.name || 'Exame').replace(/\s+/g, '_')}_2026.pdf`,
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            notes: 'Resultado gerado automaticamente.',
            uploadedBy: 'Sistema'
          });
          resultsCreated++;
        }
      }
      if (resultBatch.length > 0) {
        await ExamResult.insertMany(resultBatch);
      }
    }
  }

  console.log(`Seed concluído! Criados ${appointmentsCreated} agendamentos e ${resultsCreated} resultados nos últimos 365 dias.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
