const API_URL = 'http://localhost:5000/api';
const PASSWORD = 'Test@1234';

const credentials = [
  { role: 'SUPER_ADMIN', email: 'superadmin@hims.com' },
  { role: 'ORG_ADMIN',   email: 'admin@citygeneral.com' },
  { role: 'DOCTOR',      email: 'doctor@citygeneral.com' },
  { role: 'NURSE',       email: 'nurse@citygeneral.com' },
  { role: 'LAB_TECH',    email: 'labtech@citygeneral.com' },
  { role: 'RECEPTIONIST',email: 'receptionist@citygeneral.com' },
  { role: 'PATIENT',     email: 'arthur@patient.com' }
];

async function testLogins() {
  console.log('--- STARTING AUTOMATED LOGIN TESTS ---');
  let successCount = 0;

  for (const cred of credentials) {
    try {
      console.log(`[TESTING] Role: ${cred.role.padEnd(12)} | Email: ${cred.email}`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cred.email,
          password: PASSWORD
        })
      });

      const data = await response.json();

      if (data.success && data.data.token) {
        const user = data.data.user;
        if (user.role === cred.role) {
          console.log(`[PASS] Login successful for ${cred.role}.`);
          successCount++;
        } else {
          console.log(`[FAIL] Role mismatch! Expected ${cred.role} but got ${user.role}`);
        }
      } else {
        console.log(`[FAIL] Success flag is false or token missing. Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log(`[ERROR] Login failed for ${cred.role}: ${error.message}`);
    }
    console.log('---------------------------------------------------------');
  }

  console.log(`--- LOGIN TESTS COMPLETED: ${successCount}/${credentials.length} PASSED ---`);
}

testLogins();
