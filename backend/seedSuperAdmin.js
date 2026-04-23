const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
async function seedSuperAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const email = 'admin@rru.ac.in';
    const rawPassword = 'dca@1234';
    
    // Hash the password manually to avoid mongoose hook issues
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const superAdminData = {
      firstName: 'Super',
      lastName: 'Admin',
      email: email,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      isApproved: true
    };

    // Upsert the user
    const result = await User.findOneAndUpdate(
      { email },
      { $set: superAdminData },
      { upsert: true, new: true, runValidators: true }
    );

    console.log('Super Admin seeded successfully:');
    console.log(`Email: ${result.email}`);
    console.log(`Role: ${result.role}`);

  } catch (err) {
    console.error('Failed to seed Super Admin:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedSuperAdmin();
