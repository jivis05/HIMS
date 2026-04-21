const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User.model');
const path = require('path');

// Load env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const users = [
  {
    firstName: 'Arthur',
    lastName: 'Morgan',
    email: 'arthur.patient@himsystem.com',
    password: 'Test@1234',
    role: 'Patient',
  },
  {
    firstName: 'Meredith',
    lastName: 'Grey',
    email: 'meredith.doctor@himsystem.com',
    password: 'Test@1234',
    role: 'Doctor',
    specialty: 'General Surgery',
  },
  {
    firstName: 'Florence',
    lastName: 'Nightingale',
    email: 'florence.nurse@himsystem.com',
    password: 'Test@1234',
    role: 'Nurse',
  },
  {
    firstName: 'Pam',
    lastName: 'Beesly',
    email: 'pam.reception@himsystem.com',
    password: 'Test@1234',
    role: 'Receptionist',
  },
  {
    firstName: 'Walter',
    lastName: 'White',
    email: 'walter.pharmacy@himsystem.com',
    password: 'Test@1234',
    role: 'Pharmacist',
  },
  {
    firstName: 'Dexter',
    lastName: 'Morgan',
    email: 'dexter.lab@himsystem.com',
    password: 'Test@1234',
    role: 'Lab_Technician',
  },
];

const seedDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    for (const userData of users) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        await User.create(userData);
        console.log(`User created: ${userData.firstName} (${userData.role})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
