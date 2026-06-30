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
import Admin from './models/Admin';

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

  // Obter ou criar um operador TECH
  const techAdmins = await Admin.find({ scope: 'TECH' }).lean() as any[];
  let techAdminId: mongoose.Types.ObjectId;
  if (techAdmins.length === 0) {
    console.log('Nenhum operador TECH encontrado. Criando operador TECH de teste...');
    const newTech = await Admin.create({
      id: Math.floor(Math.random() * 9000) + 1000,
      name: 'Técnico de Laboratório',
      username: 'tecnico_seed_2025_appt',
      email: 'tecnico_2025_appt@seed.com',
      phoneNumber: '11999999999',
      scope: 'TECH',
      assignedTo: [branches[0]._id],
      status: 'Ativo'
    });
    techAdminId = newTech._id;
  } else {
    techAdminId = techAdmins[Math.floor(Math.random() * techAdmins.length)]._id;
  }

  console.log(`Found ${patients.length} patients, ${exams.length} exams, ${branches.length} branches.`);

  let appointmentsCreated = 0;
  let resultsCreated = 0;

  for (const patient of patients) {
    const user = users.find(u => u.id === patient.id);
    if (!user) continue;

    // Generate between 3 and 10 appointments for each patient in 2025
    const numAppointments = Math.floor(Math.random() * 8) + 3;

    for (let i = 0; i < numAppointments; i++) {
      // Random date in 2025
      const start = new Date(2025, 0, 1).getTime();
      const end = new Date(2025, 11, 31).getTime();
      const randomTime = new Date(start + Math.random() * (end - start));
      
      const dateStr = randomTime.toISOString().split('T')[0];
      const hours = String(Math.floor(Math.random() * 9) + 8).padStart(2, '0'); // 08 to 16
      const minutes = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
      const timeStr = `${hours}:${minutes}`;

      const randomExam = exams[Math.floor(Math.random() * exams.length)];
      const randomBranch = branches[Math.floor(Math.random() * branches.length)];
      
      // Weights for statuses: more likely to be completed in the past
      const statuses = ['Pendente', 'Confirmado', 'Concluído', 'Concluído', 'Concluído', 'Cancelado'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const appt = await Appointment.create({
        patient: user.id,
        cpf: patient.cpf,
        date: dateStr,
        time: timeStr,
        exam: randomExam._id,
        branchId: randomBranch._id,
        status: status,
        operator: techAdminId
      });
      appointmentsCreated++;

      if (status === 'Concluído') {
        await ExamResult.create({
          appointmentId: appt._id,
          fileName: `Resultado_${(randomExam?.name || 'Exame_Generico').replace(/\s+/g, '_')}_2025.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          notes: 'Exame realizado com sucesso. Resultado gerado por script de seed 2025.',
          uploadedBy: 'Sistema Automático'
        });
        resultsCreated++;
      }
    }
  }

  console.log(`Seed completed successfully! Created ${appointmentsCreated} appointments and ${resultsCreated} results in 2025.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
