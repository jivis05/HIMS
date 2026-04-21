const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Organization = require('../models/Organization.model');
const User = require('../models/User.model');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedFullFlow = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // 1. Clear existing data (optional but recommended for a clean flow)
    await Organization.deleteMany({ email: 'st.jude@hospital.com' });
    await User.deleteMany({ email: { $in: ['admin@stjude.com', 'meredith.grey@stjude.com', 'derek.shepherd@stjude.com'] } });

    console.log('Registering Organization: St. Jude Hospital...');

    // 2. Create Organization
    const organization = await Organization.create({
      name: 'St. Jude Hospital',
      type: 'HOSPITAL',
      email: 'st.jude@hospital.com',
      phone: '123-456-7890',
      address: {
        street: '123 Healthcare Way',
        city: 'Memphis',
        state: 'TN',
        zip: '38105'
      },
      isVerified: true, // AUTO-VERIFY for seed
      verificationStatus: 'APPROVED'
    });

    // 3. Create ORG_ADMIN
    const admin = await User.create({
      firstName: 'StJude',
      lastName: 'Admin',
      email: 'admin@stjude.com',
      password: 'Test@1234',
      role: 'ORG_ADMIN',
      organizationId: organization._id,
      isApproved: true
    });

    organization.admin = admin._id;
    await organization.save();

    // 4. Create Doctors
    await User.create([
      {
        firstName: 'Meredith',
        lastName: 'Grey',
        email: 'meredith.grey@stjude.com',
        password: 'Test@1234',
        role: 'DOCTOR',
        specialty: 'General Surgery',
        organizationId: organization._id,
        createdBy: admin._id,
        isApproved: true
      },
      {
        firstName: 'Derek',
        lastName: 'Shepherd',
        email: 'derek.shepherd@stjude.com',
        password: 'Test@1234',
        role: 'DOCTOR',
        specialty: 'Neurosurgery',
        organizationId: organization._id,
        createdBy: admin._id,
        isApproved: true
      }
    ]);

    console.log('\n==========================================');
    console.log('SEEDING SUCCESSFUL');
    console.log('==========================================');
    console.log('Organization: St. Jude Hospital (VERIFIED)');
    console.log('ORG_ADMIN:    admin@stjude.com / Test@1234');
    console.log('Doctors:      meredith.grey@stjude.com, derek.shepherd@stjude.com');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedFullFlow();
