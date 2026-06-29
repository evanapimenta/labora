import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import Appointment from './models/Appointment';
import Branch from './models/Branch';
import Laboratory from './models/Laboratory';

async function cleanup() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found in .env');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const branches = await Branch.find({}, { _id: 1, name: 1, laboratoryId: 1 }).lean() as any[];
  console.log(`Found ${branches.length} total branches.`);

  let branchesDeleted = 0;
  for (const branch of branches) {
    const appointmentCount = await Appointment.countDocuments({ branchId: branch._id });
    if (appointmentCount === 0) {
      console.log(`Deleting branch: ${branch.name} (No appointments)`);
      await Branch.deleteOne({ _id: branch._id });
      branchesDeleted++;
    }
  }

  console.log(`Deleted ${branchesDeleted} branches without appointments.`);

  const labs = await Laboratory.find({}, { _id: 1, name: 1, labName: 1 }).lean() as any[];
  console.log(`Found ${labs.length} total laboratories.`);

  let labsDeleted = 0;
  for (const lab of labs) {
    const branchCount = await Branch.countDocuments({ laboratoryId: lab._id });
    if (branchCount === 0) {
      const labName = lab.name || lab.labName || lab._id;
      console.log(`Deleting laboratory: ${labName} (No remaining branches)`);
      await Laboratory.deleteOne({ _id: lab._id });
      labsDeleted++;
    }
  }

  console.log(`Deleted ${labsDeleted} laboratories without branches.`);
  console.log('Cleanup completed successfully.');
  
  await mongoose.disconnect();
}

cleanup().catch(err => {
  console.error(err);
  process.exit(1);
});
