const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User.model');
const path = require('path');

// Load env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const createSuperAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Super Admin seeding...');

    const adminEmail = 'superadmin@hims.com';
    const adminPassword = 'Test@1234';

    const adminExists = await User.findOne({ email: adminEmail });
    if (adminExists) {
      console.log(`Super Admin already exists: ${adminEmail}`);
      process.exit(0);
    }

    // Creating via User.create will trigger the pre-save password hashing hook
    await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isApproved: true
    });

    console.log('------------------------------------------');
    console.log('SUPER ADMIN CREATED SUCCESSFULLY');
    console.log('Email:    ' + adminEmail);
    console.log('Password: ' + adminPassword);
    console.log('Role:     SUPER_ADMIN');
    console.log('------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();
