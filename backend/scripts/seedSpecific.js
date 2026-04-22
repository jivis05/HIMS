const mongoose = require('mongoose');
const Organization = require('../models/Organization.model');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const LabAppointment = require('../models/LabAppointment.model');
const Prescription = require('../models/Prescription.model');
const Invoice = require('../models/Invoice');
const Bed = require('../models/Bed');
const Admission = require('../models/Admission');
const Inventory = require('../models/Inventory');
const BloodStock = require('../models/BloodStock');
const BloodDonor = require('../models/BloodDonor');
const Shift = require('../models/Shift');
const Consent = require('../models/Consent.model');
const Log = require('../models/Log');

const seedSpecific = async () => {
  try {
    console.log('[SEED] Starting specific database reset...');

    // 1. Clear all data
    const collections = [
      User, Organization, Appointment, LabAppointment, Prescription, 
      Invoice, Bed, Admission, Inventory, BloodStock, BloodDonor, 
      Shift, Consent, Log
    ];
    await Promise.all(collections.map(c => c.deleteMany({})));
    console.log('[SEED] All existing data deleted.');

    // 2. Create Super Admin
    await User.create({
      firstName: 'Global',
      lastName: 'Admin',
      email: 'superadmin@hims.com',
      password: 'Test@1234',
      role: 'SUPER_ADMIN',
      isApproved: true
    });

    // 3. Create Organizations
    const hospital = await Organization.create({
      name: 'City General Hospital',
      type: 'HOSPITAL',
      email: 'contact@hospital.com',
      phone: '111-222-3333',
      isVerified: true,
      verificationStatus: 'APPROVED'
    });

    const clinic = await Organization.create({
      name: 'Wellness Clinic',
      type: 'CLINIC',
      email: 'info@clinic.com',
      phone: '444-555-6666',
      isVerified: true,
      verificationStatus: 'APPROVED'
    });

    const laboratory = await Organization.create({
      name: 'Precision Lab',
      type: 'LAB',
      email: 'results@precisionlab.com',
      phone: '777-888-9999',
      isVerified: true,
      verificationStatus: 'APPROVED'
    });

    // 4. Create Users for Hospital
    const hospAdmin = await User.create({
      firstName: 'Hospital',
      lastName: 'Admin',
      email: 'admin@hospital.com',
      password: 'Test@1234',
      role: 'ORG_ADMIN',
      organizationId: hospital._id,
      isApproved: true
    });
    hospital.admin = hospAdmin._id;
    await hospital.save();

    await User.create({
      firstName: 'Hospital',
      lastName: 'Doctor',
      email: 'doctor@hospital.com',
      password: 'Test@1234',
      role: 'DOCTOR',
      organizationId: hospital._id,
      isApproved: true
    });

    // 5. Create Users for Clinic
    const clinicAdmin = await User.create({
      firstName: 'Clinic',
      lastName: 'Admin',
      email: 'admin@clinic.com',
      password: 'Test@1234',
      role: 'ORG_ADMIN',
      organizationId: clinic._id,
      isApproved: true
    });
    clinic.admin = clinicAdmin._id;
    await clinic.save();

    await User.create({
      firstName: 'Clinic',
      lastName: 'Nurse',
      email: 'nurse@clinic.com',
      password: 'Test@1234',
      role: 'NURSE',
      organizationId: clinic._id,
      isApproved: true
    });

    // 6. Create Users for Laboratory
    const labAdmin = await User.create({
      firstName: 'Lab',
      lastName: 'Admin',
      email: 'admin@lab.com',
      password: 'Test@1234',
      role: 'ORG_ADMIN',
      organizationId: laboratory._id,
      isApproved: true
    });
    laboratory.admin = labAdmin._id;
    await laboratory.save();

    await User.create({
      firstName: 'Lab',
      lastName: 'Technician',
      email: 'labtech@lab.com',
      password: 'Test@1234',
      role: 'LAB_TECH',
      organizationId: laboratory._id,
      isApproved: true
    });

    // 7. Create Patients
    await User.create({
      firstName: 'Patient',
      lastName: 'One',
      email: 'patient1@hims.com',
      password: 'Test@1234',
      role: 'PATIENT',
      isApproved: true
    });

    await User.create({
      firstName: 'Patient',
      lastName: 'Two',
      email: 'patient2@hims.com',
      password: 'Test@1234',
      role: 'PATIENT',
      isApproved: true
    });

    console.log('[SEED] Database reset and new credentials created.');
    console.log('Summary: 1 Super Admin, 3 Organizations, 3 Org Admins, 3 Staff, 2 Patients.');
  } catch (error) {
    console.error('[SEED] Failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await seedSpecific();
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
