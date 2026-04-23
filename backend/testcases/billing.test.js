const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User.model');
const Organization = require('../models/Organization.model');
const Invoice = require('../models/Invoice');
const TEST_PASSWORD = process.env.SEED_PASSWORD;
if (!TEST_PASSWORD) {
  throw new Error('SEED_PASSWORD is not defined in .env. Tests aborted for security.');
}

describe('Financial & Billing Workflow', () => {
  let adminToken;
  let patientId;
  let orgId;
  let invoiceId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    // Cleanup
    await User.deleteMany({ email: { $in: ['bpatient@gmail.com', 'badmin@org.com'] } });
    await Organization.deleteMany({ email: 'borg@org.com' });
    await Invoice.deleteMany({});
  });

  test('1. Should register a patient and an organization', async () => {
    // Patient
    const pRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'B',
        lastName: 'Patient',
        email: 'bpatient@gmail.com',
        password: TEST_PASSWORD,
        role: 'PATIENT'
      });
    patientId = pRes.body.data.user.id;

    // Organization
    const orgRes = await request(app)
      .post('/api/org/register')
      .send({
        orgName: 'Billing Hosp',
        orgType: 'CLINIC',
        orgEmail: 'borg@org.com',
        orgPhone: '9998887777',
        adminFirstName: 'B',
        adminLastName: 'Admin',
        adminEmail: 'badmin@org.com',
        adminPassword: TEST_PASSWORD
      });
    
    orgId = orgRes.body.data.id;
    await Organization.findByIdAndUpdate(orgId, { isVerified: true });

    // Login Admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'badmin@org.com', password: TEST_PASSWORD });
    adminToken = loginRes.body.data.token;
  });

  test('2. Should create a new invoice for the patient', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        patient: patientId,
        items: [
          { description: 'Consultation Fee', amount: 500, type: 'Consultation' },
          { description: 'Blood Test', amount: 200, type: 'Lab Test' }
        ],
        dueDate: new Date(Date.now() + 7 * 86400000)
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.totalAmount).toBe(700);
    expect(res.body.data.status).toBe('Unpaid');
    invoiceId = res.body.data._id;
  });

  test('3. Should record a partial payment', async () => {
    const res = await request(app)
      .post(`/api/invoices/${invoiceId}/payment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 300,
        method: 'Cash'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.amountPaid).toBe(300);
    expect(res.body.data.status).toBe('Partial');
  });

  test('4. Should record full payment and mark as Paid', async () => {
    const res = await request(app)
      .post(`/api/invoices/${invoiceId}/payment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 400,
        method: 'UPI'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.amountPaid).toBe(700);
    expect(res.body.data.status).toBe('Paid');
  });

  test('5. Should list organization invoices', async () => {
    const res = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.invoices.length).toBeGreaterThanOrEqual(1);
  });
});
