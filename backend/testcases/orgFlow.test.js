const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Organization = require('../models/Organization.model');
const User = require('../models/User.model');

describe('Organization & Staff Management Flow', () => {
  let adminToken;
  let orgId;

  beforeAll(async () => {
    // Already connected in server.js but for safety:
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    await User.deleteMany({ email: { $in: ['testadmin@org.com', 'meredith@org.com', 'strange@org.com', 'illegal@org.com'] } });
    await Organization.deleteMany({ email: 'test@org.com' });
  });

  afterAll(async () => {
    // Do not close connection here if it's shared, or check if it's the test runner's responsibility
    // await mongoose.connection.close();
  });

  test('1. Should register a new organization and admin', async () => {
    const res = await request(app)
      .post('/api/org/register')
      .send({
        orgName: 'Test Hospital',
        orgType: 'HOSPITAL',
        orgEmail: 'test@org.com',
        orgPhone: '1234567890',
        adminFirstName: 'Test',
        adminLastName: 'Admin',
        adminEmail: 'testadmin@org.com',
        adminPassword: 'Password123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    // Standardized response: data wrapper
    orgId = res.body.data.id;
  });

  test('2. Should reject staff creation if org is unverified', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin@org.com',
        password: 'Password123'
      });
    
    adminToken = loginRes.body.data.token;

    const res = await request(app)
      .post('/api/org/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Doctor',
        lastName: 'Strange',
        email: 'strange@org.com',
        password: 'Password123',
        role: 'DOCTOR' // Normalized role
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toContain('must be verified');
  });

  test('3. Should reject staff registration via public route', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Illegal',
        lastName: 'Doctor',
        email: 'illegal@org.com',
        password: 'Password123',
        role: 'DOCTOR' // Normalized role
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toContain('Only patients can self-register');
  });

  test('4. Should list only doctors from verified organizations', async () => {
    await Organization.findByIdAndUpdate(orgId, { isVerified: true });

    await request(app)
      .post('/api/org/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Meredith',
        lastName: 'Grey',
        email: 'meredith@org.com',
        password: 'Password123',
        role: 'DOCTOR', // Normalized role
        specialty: 'Surgery'
      });

    const res = await request(app)
      .get('/api/users/doctors')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    // Standardized response: data is the array
    const doctors = res.body.data;
    const hasMeredith = doctors.some(d => d.email === 'meredith@org.com');
    expect(hasMeredith).toBe(true);
  });
});
