const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Make sure server.js exports app
const Organization = require('../models/Organization.model');
const User = require('../models/User.model');

describe('Organization & Staff Management Flow', () => {
  let adminToken;
  let orgId;

  beforeAll(async () => {
    // Connect to test database if needed, but here we use the configured one
    await User.deleteMany({ email: 'testadmin@org.com' });
    await Organization.deleteMany({ email: 'test@org.com' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
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
    orgId = res.body.organization.id;
  });

  test('2. Should reject staff creation if org is unverified', async () => {
    // Login as admin first
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin@org.com',
        password: 'Password123'
      });
    
    adminToken = loginRes.body.token;

    const res = await request(app)
      .post('/api/org/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Doctor',
        lastName: 'Strange',
        email: 'strange@org.com',
        password: 'Password123',
        role: 'Doctor'
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
        role: 'Doctor'
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toContain('Only patients can self-register');
  });

  test('4. Should list only doctors from verified organizations', async () => {
    // Verify the organization manually in DB
    await Organization.findByIdAndUpdate(orgId, { isVerified: true });

    // Create a doctor now (should succeed)
    await request(app)
      .post('/api/org/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Meredith',
        lastName: 'Grey',
        email: 'meredith@org.com',
        password: 'Password123',
        role: 'Doctor',
        specialty: 'Surgery'
      });

    const res = await request(app)
      .get('/api/users/doctors')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    const hasMeredith = res.body.doctors.some(d => d.email === 'meredith@org.com');
    expect(hasMeredith).toBe(true);
  });
});
