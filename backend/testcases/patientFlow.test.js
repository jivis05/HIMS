const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User.model');
const Organization = require('../models/Organization.model');
const Appointment = require('../models/Appointment.model');
const TEST_PASSWORD = process.env.SEED_PASSWORD;
if (!TEST_PASSWORD) {
  throw new Error('SEED_PASSWORD is not defined in .env. Tests aborted for security.');
}

describe('Patient & Appointment Workflow', () => {
  let patientToken;
  let adminToken;
  let doctorId;
  let orgId;
  let appointmentId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    // Cleanup
    await User.deleteMany({ email: { $in: ['testpatient@gmail.com', 'padmin@org.com', 'pdoctor@org.com'] } });
    await Organization.deleteMany({ email: 'porg@org.com' });
    await Appointment.deleteMany({});
  });

  test('1. Should register a new patient', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'Patient',
        email: 'testpatient@gmail.com',
        password: TEST_PASSWORD,
        role: 'PATIENT'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
  });

  test('2. Should setup an organization and a doctor', async () => {
    // Register Org
    const orgRes = await request(app)
      .post('/api/org/register')
      .send({
        orgName: 'Patient Test Hosp',
        orgType: 'HOSPITAL',
        orgEmail: 'porg@org.com',
        orgPhone: '1112223333',
        adminFirstName: 'P',
        adminLastName: 'Admin',
        adminEmail: 'padmin@org.com',
        adminPassword: TEST_PASSWORD
      });
    
    if (orgRes.statusCode !== 201) console.log('ORG REG FAIL:', orgRes.body);
    expect(orgRes.statusCode).toEqual(201);
    orgId = orgRes.body.data.id;
    await Organization.findByIdAndUpdate(orgId, { isVerified: true });

    // Login Admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'padmin@org.com', password: TEST_PASSWORD });
    adminToken = loginRes.body.data.token;

    // Create Doctor
    const docRes = await request(app)
      .post('/api/org/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'P',
        lastName: 'Doctor',
        email: 'pdoctor@org.com',
        password: TEST_PASSWORD,
        role: 'DOCTOR',
        specialty: 'General'
      });
    
    if (docRes.statusCode !== 201) console.log('DOC CREATE FAIL:', docRes.body);
    expect(docRes.statusCode).toEqual(201);
    doctorId = docRes.body.data._id;
  });

  test('3. Should login as patient and book an appointment', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testpatient@gmail.com', password: TEST_PASSWORD });
    patientToken = loginRes.body.data.token;

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctor: doctorId,
        organizationId: orgId,
        date: new Date(Date.now() + 86400000), // Tomorrow
        startTime: '10:00 AM',
        type: 'General Checkup',
        chiefComplaint: 'Feeling unwell'
      });

    if (res.statusCode !== 201) console.log('APPOINTMENT BOOK FAIL:', res.body);
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.status).toBe('Scheduled');
    appointmentId = res.body.data._id;
  });

  test('4. Should list patient appointments', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`);

    if (res.statusCode !== 200) console.log('LIST FAIL:', res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('5. Should allow patient to cancel appointment', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/cancel`) // Changed to /cancel
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        reason: 'Change of plans'
      });

    if (res.statusCode !== 200) console.log('CANCEL FAIL:', res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.status).toBe('Cancelled');
  });
});

