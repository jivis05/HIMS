const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User.model');
const Organization = require('../models/Organization.model');
const BloodDonor = require('../models/BloodDonor');
const BloodStock = require('../models/BloodStock');
const LabReport = require('../models/LabReport.model');

describe('Specialized Services (Blood Bank & Lab)', () => {
  let adminToken;
  let labTechToken;
  let patientId;
  let orgId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    // Cleanup
    await User.deleteMany({ email: { $in: ['spatient@gmail.com', 'sadmin@org.com', 'stech@org.com'] } });
    await Organization.deleteMany({ email: 'sorg@org.com' });
    await BloodDonor.deleteMany({});
    await BloodStock.deleteMany({});
    await LabReport.deleteMany({});
  });

  test('1. Should register organization and staff', async () => {
    // Patient
    const pRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'S',
        lastName: 'Patient',
        email: 'spatient@gmail.com',
        password: 'Password123',
        role: 'PATIENT'
      });
    patientId = pRes.body.data.user.id;

    // Organization
    const orgRes = await request(app)
      .post('/api/org/register')
      .send({
        orgName: 'Service Hosp',
        orgType: 'LAB',
        orgEmail: 'sorg@org.com',
        orgPhone: '4443332222',
        adminFirstName: 'S',
        adminLastName: 'Admin',
        adminEmail: 'sadmin@org.com',
        adminPassword: 'Password123'
      });
    
    if (orgRes.statusCode !== 201) console.log('ORG REG FAIL:', JSON.stringify(orgRes.body, null, 2));
    orgId = orgRes.body.data?.id;
    await Organization.findByIdAndUpdate(orgId, { isVerified: true });

    // Login Admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sadmin@org.com', password: 'Password123' });
    adminToken = loginRes.body.data.token;

    // Create Lab Tech
    const techRes = await request(app)
      .post('/api/org/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'S',
        lastName: 'Tech',
        email: 'stech@org.com',
        password: 'Password123',
        role: 'LAB_TECH'
      });
    
    const techLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'stech@org.com', password: 'Password123' });
    labTechToken = techLoginRes.body.data.token;
  });

  test('2. Should register a blood donor', async () => {
    const res = await request(app)
      .post('/api/bloodbank/donors')
      .set('Authorization', `Bearer ${labTechToken}`)
      .send({
        name: 'Donor One',
        bloodGroup: 'O+',
        phone: '1231231234',
        email: 'donor1@gmail.com'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.name).toBe('Donor One');
  });

  test('3. Should update blood stock', async () => {
    // First call get to initialize stock for the new org
    await request(app)
      .get('/api/bloodbank/stock')
      .set('Authorization', `Bearer ${labTechToken}`);

    const res = await request(app)
      .post('/api/bloodbank/stock')
      .set('Authorization', `Bearer ${labTechToken}`)
      .send({
        bloodGroup: 'O+',
        units: 10,
        action: 'add'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  test('4. Should book a lab appointment as patient', async () => {
    const pLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'spatient@gmail.com', password: 'Password123' });
    const pToken = pLogin.body.data.token;

    const res = await request(app)
      .post('/api/lab/book')
      .set('Authorization', `Bearer ${pToken}`)
      .send({
        patientId: patientId,
        testType: 'CBC',
        organizationId: orgId,
        date: new Date(Date.now() + 86400000),
        timeSlot: '09:00 AM'
      });

    if (res.statusCode !== 201) console.log('LAB BOOK FAIL:', JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.status).toBe('Scheduled');
  });

  test('5. Should list organization lab appointments', async () => {
    const res = await request(app)
      .get('/api/lab/org-appointments')
      .set('Authorization', `Bearer ${labTechToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
