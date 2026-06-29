import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import Appointment from './models/Appointment';
import Admin from './models/Admin';

async function fixOperators() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found in .env');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Load all admins to use as operators
  const admins = await Admin.find({}).lean() as any[];
  if (!admins.length) {
    console.error('No admins found in the database. Cannot assign operators.');
    process.exit(1);
  }

  console.log(`Found ${admins.length} admins to use as operators.`);

  // Find appointments where operator is missing
  const appointmentsToFix = await Appointment.find({
    $or: [
      { operator: { $exists: false } },
      { operator: null }
    ]
  });

  console.log(`Found ${appointmentsToFix.length} appointments without an operator.`);

  let updatedCount = 0;
  for (const appt of appointmentsToFix) {
    const randomAdmin = admins[Math.floor(Math.random() * admins.length)];
    appt.operator = randomAdmin._id;
    await appt.save();
    updatedCount++;
  }

  console.log(`Successfully assigned operators to ${updatedCount} appointments.`);
  
  await mongoose.disconnect();
}

fixOperators().catch(err => {
  console.error(err);
  process.exit(1);
});
