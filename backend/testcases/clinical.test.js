const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User.model');
const LabReport = require('../models/LabReport');
const TEST_PASSWORD = process.env.SEED_PASSWORD;
if (!TEST_PASSWORD) {
  throw new Error('SEED_PASSWORD is not defined in .env. Tests aborted for security.');
}
const Prescription = require('../models/Prescription.model.js');
const Bed = require('../models/Bed.js');

describe('Clinical Workflow (Prescriptions & Beds)', () => {
  let adminToken;
  let doctorToken;
  let patientId;
  let orgId;
  let prescriptionId;
  let bedId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    // Cleanup
    await User.deleteMany({ email: { $in: ['cpatient@gmail.com', 'cadmin@org.com', 'cdoctor@org.com'] } });
    await Organization.deleteMany({ email: 'corg@org.com' });
    await Prescription.deleteMany({});
    await Bed.deleteMany({});
  });

  test('1. Should register organization and staff', async () => {
    // Patient
    const pRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'C',
        lastName: 'Patient',
        email: 'cpatient@gmail.com',
        password: TEST_PASSWORD,
        role: 'PATIENT'
      });
    patientId = pRes.body.data.user.id;

    // Organization
    const orgRes = await request(app)
      .post('/api/org/register')
      .send({
        orgName: 'Clinical Hosp',
        orgType: 'HOSPITAL',
        orgEmail: 'corg@org.com',
        orgPhone: '3332221111',
        adminFirstName: 'C',
        adminLastName: 'Admin',
        adminEmail: 'cadmin@org.com',
        adminPassword: TEST_PASSWORD
      });
    
    orgId = orgRes.body.data.id;
    await Organization.findByIdAndUpdate(orgId, { isVerified: true });

    // Login Admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cadmin@org.com', password: TEST_PASSWORD });
    adminToken = loginRes.body.data.token;

    // Create Doctor
    const docRes = await request(app)
      .post('/api/org/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'C',
        lastName: 'Doctor',
        email: 'cdoctor@org.com',
        password: TEST_PASSWORD,
        role: 'DOCTOR'
      });
    
    const docLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cdoctor@org.com', password: TEST_PASSWORD });
    doctorToken = docLoginRes.body.data.token;
  });

  test('2. Should create a prescription for the patient', async () => {
    const res = await request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patient: patientId,
        diagnosis: 'Common Cold',
        medications: [
          { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '3 days' }
        ]
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.diagnosis).toBe('Common Cold');
    prescriptionId = res.body.data._id;
  });

  test('3. Should list patient prescriptions', async () => {
    const res = await request(app)
      .get(`/api/prescriptions?patient=${patientId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('4. Should create and manage hospital beds', async () => {
    // Add bed
    const addRes = await request(app)
      .post('/api/inpatient/beds')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        bedNumber: 'B-101',
        ward: 'General',
        type: 'General',
        pricePerDay: 500
      });

    expect(addRes.statusCode).toEqual(201);
    bedId = addRes.body.data._id;

    // List beds
    const listRes = await request(app)
      .get('/api/inpatient/beds')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.statusCode).toEqual(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('5. Should admit patient to bed', async () => {
    const res = await request(app)
      .post('/api/inpatient/admissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        patient: patientId,
        bedId: bedId,
        reason: 'Observation'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.status).toBe('Admitted');
  });
});
