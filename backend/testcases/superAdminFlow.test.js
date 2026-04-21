const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User.model');
const Organization = require('../models/Organization.model');

describe('Super Admin Workflow & Organization Verification', () => {
  let superAdminToken;
  let orgAdminToken;
  let orgId;
  let doctorEmail = 'test.doc@test.com';

  beforeAll(async () => {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    
    // 2. Clear existing test data
    await User.deleteMany({ email: { $in: ['super@hims.com', 'admin@test.com', doctorEmail] } });
    await Organization.deleteMany({ email: 'test@org.com' });

    // 3. Create Super Admin
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'super@hims.com',
      password: 'Test@1234',
      role: 'SUPER_ADMIN',
      isApproved: true
    });

    const superRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'super@hims.com', password: 'Test@1234' });
    
    superAdminToken = superRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Step 1: Register Organization (Should be unverified)', async () => {
    const res = await request(app)
      .post('/api/org/register')
      .send({
        orgName: 'Test Hospital',
        orgType: 'HOSPITAL',
        orgEmail: 'test@org.com',
        orgPhone: '1234567890',
        orgAddress: '123 Test St',
        adminFirstName: 'Test',
        adminLastName: 'Admin',
        adminEmail: 'admin@test.com',
        adminPassword: 'Test@1234'
      });

    expect(res.statusCode).toBe(201);
    orgId = res.body.organization.id;
    expect(orgId).toBeDefined();
    expect(res.body.organization.isVerified).toBe(false);
    expect(res.body.organization.verificationStatus).toBe('PENDING');

    // Login as Org Admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Test@1234' });
    orgAdminToken = loginRes.body.token;
    expect(orgAdminToken).toBeDefined();
  });

  test('Step 2: Unverified Org Admin cannot create staff', async () => {
    expect(orgAdminToken).toBeDefined();
    const res = await request(app)
      .post('/api/org/users')
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        firstName: 'Test',
        lastName: 'Doctor',
        email: doctorEmail,
        password: 'Test@1234',
        role: 'DOCTOR'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('verified');
  });

  test('Step 3: Super Admin can list and approve organization', async () => {
    expect(superAdminToken).toBeDefined();
    // List orgs
    const listRes = await request(app)
      .get('/api/superadmin/orgs')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(listRes.statusCode).toBe(200);
    const org = listRes.body.organizations.find(o => o._id === orgId);
    expect(org).toBeDefined();

    // Approve
    const approveRes = await request(app)
      .patch(`/api/superadmin/orgs/${orgId}/verify`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(approveRes.statusCode).toBe(200);
    expect(approveRes.body.organization.isVerified).toBe(true);
    expect(approveRes.body.organization.verificationStatus).toBe('APPROVED');
  });

  test('Step 4: Approved Org Admin can now create staff', async () => {
    expect(orgAdminToken).toBeDefined();
    const res = await request(app)
      .post('/api/org/users')
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        firstName: 'Test',
        lastName: 'Doctor',
        email: doctorEmail,
        password: 'Test@1234',
        role: 'DOCTOR',
        specialty: 'General'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('Step 5: Non-Super Admin cannot access superadmin routes', async () => {
    expect(orgAdminToken).toBeDefined();
    const res = await request(app)
      .get('/api/superadmin/logs')
      .set('Authorization', `Bearer ${orgAdminToken}`);

    expect(res.statusCode).toBe(403);
  });
});
