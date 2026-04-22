const API_URL = 'http://localhost:5000/api';
const PASSWORD = 'Test@1234';

const credentials = [
  { role: 'SUPER_ADMIN', email: 'superadmin@hims.com' },
  { role: 'PATIENT_1',   email: 'patient1@hims.com',  targetRole: 'PATIENT' },
  { role: 'PATIENT_2',   email: 'patient2@hims.com',  targetRole: 'PATIENT' },
  { role: 'HOSP_ADMIN',  email: 'admin@hospital.com', targetRole: 'ORG_ADMIN' },
  { role: 'HOSP_DOCTOR', email: 'doctor@hospital.com', targetRole: 'DOCTOR' },
  { role: 'CLINIC_ADMIN',email: 'admin@clinic.com',   targetRole: 'ORG_ADMIN' },
  { role: 'CLINIC_NURSE',email: 'nurse@clinic.com',   targetRole: 'NURSE' },
  { role: 'LAB_ADMIN',   email: 'admin@lab.com',      targetRole: 'ORG_ADMIN' },
  { role: 'LAB_TECH',    email: 'labtech@lab.com',    targetRole: 'LAB_TECH' },
];

async function testLogins() {
  console.log('--- STARTING SPECIFIC LOGIN TESTS ---');
  let passed = 0;

  for (const cred of credentials) {
    console.log(`[TESTING] ${cred.role} | Email: ${cred.email}`);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cred.email, password: PASSWORD })
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        const user = data.data.user;
        const target = cred.targetRole || cred.role;
        if (user.role === target) {
          console.log(`[PASS] Login successful for ${cred.role}. Role verified.`);
          passed++;
        } else {
          console.log(`[FAIL] Login successful but role mismatch. Expected ${target}, got ${user.role}`);
        }
      } else {
        console.log(`[FAIL] Login failed for ${cred.role}. Status: ${response.status}. Message: ${data.message}`);
      }
    } catch (error) {
      console.log(`[ERROR] Connection failed for ${cred.role}: ${error.message}`);
    }
    console.log('---------------------------------------------------------');
  }

  console.log(`--- SPECIFIC LOGIN TESTS COMPLETED: ${passed}/${credentials.length} PASSED ---`);
}

testLogins();
