const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User.model');
const Organization = require('../models/Organization.model');
const Shift = require('../models/Shift');
const Inventory = require('../models/Inventory');
const TEST_PASSWORD = process.env.SEED_PASSWORD;
if (!TEST_PASSWORD) {
  throw new Error('SEED_PASSWORD is not defined in .env. Tests aborted for security.');
}

describe('Operational Workflow (Shifts & Inventory)', () => {
  let adminToken;
  let doctorId;
  let orgId;
  let shiftId;
  let inventoryId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    // Cleanup
    await User.deleteMany({ email: { $in: ['oadmin@org.com', 'odoctor@org.com'] } });
    await Organization.deleteMany({ email: 'oorg@org.com' });
    await Shift.deleteMany({});
    await Inventory.deleteMany({});
  });

  test('1. Should register an organization and a doctor', async () => {
    // Organization
    const orgRes = await request(app)
      .post('/api/org/register')
      .send({
        orgName: 'Ops Hosp',
        orgType: 'HOSPITAL',
        orgEmail: 'oorg@org.com',
        orgPhone: '7776665555',
        adminFirstName: 'O',
        adminLastName: 'Admin',
        adminEmail: 'oadmin@org.com',
        adminPassword: TEST_PASSWORD
      });
    
    orgId = orgRes.body.data.id;
    await Organization.findByIdAndUpdate(orgId, { isVerified: true });

    // Login Admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'oadmin@org.com', password: TEST_PASSWORD });
    adminToken = loginRes.body.data.token;

    // Create Doctor
    const docRes = await request(app)
      .post('/api/org/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'O',
        lastName: 'Doctor',
        email: 'odoctor@org.com',
        password: TEST_PASSWORD,
        role: 'DOCTOR',
        specialty: 'Emergency'
      });
    
    doctorId = docRes.body.data._id;
  });

  test('2. Should create a shift for the doctor', async () => {
    const res = await request(app)
      .post('/api/shifts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        staff: doctorId,
        department: 'ER',
        startTime: new Date(Date.now() + 3600000), // In 1 hour
        endTime: new Date(Date.now() + 32400000), // In 9 hours
        type: 'Night',
        notes: 'ER High Priority'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.department).toBe('ER');
    shiftId = res.body.data._id;
  });

  test('3. Should list shifts for the organization', async () => {
    const res = await request(app)
      .get('/api/shifts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('4. Should add an item to inventory', async () => {
    const res = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        itemName: 'Paracetamol 500mg',
        category: 'Pharmacy',
        stockQuantity: 1000,
        unit: 'Tabs',
        threshold: 100,
        pricePerUnit: 2
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.itemName).toBe('Paracetamol 500mg');
    inventoryId = res.body.data._id;
  });

  test('5. Should update inventory stock', async () => {
    const res = await request(app)
      .patch(`/api/inventory/${inventoryId}/stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        quantity: 50,
        action: 'subtract'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.stockQuantity).toBe(950);
  });
});
