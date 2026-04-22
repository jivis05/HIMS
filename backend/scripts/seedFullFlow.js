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

const seedFullFlow = async () => {
  try {
    console.log('[SEED] Starting full system seed...');

    // 1. Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Appointment.deleteMany({}),
      LabAppointment.deleteMany({}),
      Prescription.deleteMany({}),
      Invoice.deleteMany({}),
      Bed.deleteMany({}),
      Admission.deleteMany({}),
      Inventory.deleteMany({}),
      BloodStock.deleteMany({}),
      BloodDonor.deleteMany({}),
      Shift.deleteMany({}),
      Consent.deleteMany({}),
      Log.deleteMany({})
    ]);

    console.log('[SEED] Database cleared.');

    // 2. Create Super Admin
    const superAdmin = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'superadmin@hims.com',
      password: 'Test@1234',
      role: 'SUPER_ADMIN',
      isApproved: true
    });

    // 3. Create Organizations
    const org1 = await Organization.create({
      name: 'City General Hospital',
      type: 'HOSPITAL',
      email: 'contact@citygeneral.com',
      phone: '111-222-3333',
      address: { street: '100 Health St', city: 'Metropolis', state: 'NY', zip: '10001' },
      isVerified: true,
      verificationStatus: 'APPROVED'
    });

    // 4. Create Org Admin for Org 1
    const orgAdmin = await User.create({
      firstName: 'Alice',
      lastName: 'Admin',
      email: 'admin@citygeneral.com',
      password: 'Test@1234',
      role: 'ORG_ADMIN',
      organizationId: org1._id,
      isApproved: true
    });
    org1.admin = orgAdmin._id;
    await org1.save();

    // 5. Create Staff for Org 1
    const doctor = await User.create({
      firstName: 'Gregory',
      lastName: 'House',
      email: 'doctor@citygeneral.com',
      password: 'Test@1234',
      role: 'DOCTOR',
      specialty: 'Diagnostic Medicine',
      organizationId: org1._id,
      isApproved: true
    });

    const nurse = await User.create({
      firstName: 'Jackie',
      lastName: 'Peyton',
      email: 'nurse@citygeneral.com',
      password: 'Test@1234',
      role: 'NURSE',
      organizationId: org1._id,
      isApproved: true
    });

    const labTech = await User.create({
      firstName: 'Dexter',
      lastName: 'Morgan',
      email: 'labtech@citygeneral.com',
      password: 'Test@1234',
      role: 'LAB_TECH',
      organizationId: org1._id,
      isApproved: true
    });

    const receptionist = await User.create({
      firstName: 'Pam',
      lastName: 'Beesly',
      email: 'receptionist@citygeneral.com',
      password: 'Test@1234',
      role: 'RECEPTIONIST',
      organizationId: org1._id,
      isApproved: true
    });

    // 6. Create Patients
    const patient1 = await User.create({
      firstName: 'Arthur',
      lastName: 'Morgan',
      email: 'arthur@patient.com',
      password: 'Test@1234',
      role: 'PATIENT',
      isApproved: true
    });

    const patient2 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@patient.com',
      password: 'Test@1234',
      role: 'PATIENT',
      isApproved: true
    });

    // 7. Inventory
    await Inventory.create([
      { itemName: 'Paracetamol', organizationId: org1._id, category: 'Pharmacy', stockQuantity: 500, unit: 'Tabs', threshold: 50, pricePerUnit: 0.1 },
      { itemName: 'Syringes', organizationId: org1._id, category: 'Clinical Supplies', stockQuantity: 1000, unit: 'Units', threshold: 100, pricePerUnit: 0.5 }
    ]);

    // 8. Beds
    const bed1 = await Bed.create({ bedNumber: 'B-101', organizationId: org1._id, ward: 'Ward A', type: 'General', pricePerDay: 500 });
    const bed2 = await Bed.create({ bedNumber: 'B-102', organizationId: org1._id, ward: 'Ward A', type: 'ICU', pricePerDay: 2000 });

    // 9. Appointments
    const app1 = await Appointment.create({
      patient: patient1._id,
      doctor: doctor._id,
      organizationId: org1._id,
      date: new Date(),
      startTime: '10:00 AM',
      type: 'General Checkup',
      status: 'Completed'
    });

    // 10. Prescriptions
    await Prescription.create({
      patient: patient1._id,
      doctor: doctor._id,
      organizationId: org1._id,
      appointment: app1._id,
      medications: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'TID', duration: '5 days' }],
      diagnosis: 'Mild Fever'
    });

    // 11. Invoices
    await Invoice.create({
      patient: patient1._id,
      issuedBy: receptionist._id,
      organizationId: org1._id,
      items: [{ description: 'Consultation Fee', amount: 500, type: 'Consultation' }],
      totalAmount: 500,
      status: 'Paid',
      payments: [{ amount: 500, method: 'Cash' }]
    });

    // 12. Blood Bank
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    await BloodStock.insertMany(groups.map(g => ({ organizationId: org1._id, bloodGroup: g, units: 10 })));

    await BloodDonor.create({
      organizationId: org1._id,
      name: 'John Donor',
      bloodGroup: 'O+',
      phone: '9998887777',
      donations: [{ units: 1 }]
    });

    // 13. Shifts
    await Shift.create({
      organizationId: org1._id,
      staff: doctor._id,
      department: 'General Medicine',
      startTime: new Date(),
      endTime: new Date(Date.now() + 8 * 3600000),
      type: 'Morning'
    });

    // 14. Consent
    await Consent.create({
      patient: patient1._id,
      organizationId: org1._id,
      expiresAt: new Date(Date.now() + 365 * 24 * 3600000)
    });

    console.log('[SEED] Full system seed completed successfully.');
    return true;
  } catch (error) {
    console.error('[SEED] Seeding failed:', error.message);
    throw error;
  }
};

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await seedFullFlow();
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedFullFlow };
