import axios from 'axios';

// Central Axios instance pointing at our Express backend.
// The base URL is read from the VITE_API_BASE_URL environment variable so that
// the same build artefact works across local, staging, and production without
// code changes.  Fall back to the default local dev address only when the
// variable is absent.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT token automatically to every request if it exists in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hims_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: redirect to login if token expired (401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hims_token');
      localStorage.removeItem('hims_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth Endpoints ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  getMe:    ()     => API.get('/auth/me'),
};

// ── Shift Endpoints ──────────────────────────────────────────────────────────
export const shiftAPI = {
  getAll: () => API.get('/shifts'),
  create: (data) => API.post('/shifts', data),
  delete: (id) => API.delete(`/shifts/${id}`)
};

// ── Blood Bank Endpoints ─────────────────────────────────────────────────────
export const bloodBankAPI = {
  getStock:   ()         => API.get('/bloodbank/stock'),
  updateStock: (data)    => API.post('/bloodbank/stock', data),
  getDonors:  ()         => API.get('/bloodbank/donors'),
  addDonor:   (data)     => API.post('/bloodbank/donors', data)
};

// ── Super Admin Endpoints ────────────────────────────────────────────────────
export const superAdminAPI = {
  getLogs:  () => API.get('/superadmin/logs'),
  getStats: () => API.get('/superadmin/stats')
};

// ── Analytics Endpoints ──────────────────────────────────────────────────────
export const analyticsAPI = {
  getStats: () => API.get('/analytics/stats')
};

// ── Appointment Endpoints ────────────────────────────────────────────────────
export const appointmentAPI = {
  getAll:       ()           => API.get('/appointments'),
  create:       (data)       => API.post('/appointments', data),
  updateStatus: (id, data)   => API.patch(`/appointments/${id}/status`, data),
};

// ── Inventory Endpoints ──────────────────────────────────────────────────────
export const inventoryAPI = {
  getAll:      ()           => API.get('/inventory'),
  getLowStock: ()           => API.get('/inventory/low-stock'),
  create:      (data)       => API.post('/inventory', data),
  updateStock: (id, data)   => API.patch(`/inventory/${id}/stock`, data),
};

// ── Prescription Endpoints ───────────────────────────────────────────────────
export const prescriptionAPI = {
  getAll:   ()         => API.get('/prescriptions'),
  create:   (data)     => API.post('/prescriptions', data),
  dispense: (id)       => API.patch(`/prescriptions/${id}/dispense`),
};

// ── Lab Report Endpoints ─────────────────────────────────────────────────────
export const labReportAPI = {
  getAll:       ()           => API.get('/lab-reports'),
  order:        (data)       => API.post('/lab-reports', data),
  uploadResult: (id, data)   => API.patch(`/lab-reports/${id}/result`, data),
};

// ── User Endpoints ───────────────────────────────────────────────────────────
export const userAPI = {
  getAll:     (role)     => API.get(`/users${role ? `?role=${role}` : ''}`),
  getDoctors: ()         => API.get('/users/doctors'),
  getById:    (id)       => API.get(`/users/${id}`),
  getEMR:     (id)       => API.get(`/users/${id}/emr`),
  update:     (id, data) => API.put(`/users/${id}`, data),
  delete:     (id)       => API.delete(`/users/${id}`)
};

// ── Invoice / Billing Endpoints ──────────────────────────────────────────────
export const invoiceAPI = {
  getAll:   (params)   => API.get('/invoices', { params }),
  create:   (data)     => API.post('/invoices', data),
  pay:      (id, data) => API.post(`/invoices/${id}/payment`, data),
};

// ── Inpatient / Bed Management Endpoints ────────────────────────────────────
export const inpatientAPI = {
  getBeds:       ()         => API.get('/inpatient/beds'),
  createBed:     (data)     => API.post('/inpatient/beds', data),
  getAdmissions: ()         => API.get('/inpatient/admissions'),
  admit:         (data)     => API.post('/inpatient/admissions', data),
  discharge:     (id, data) => API.patch(`/inpatient/admissions/${id}/discharge`, data),
};

export const bedAPI = {
  getAll: () => API.get('/inpatient/beds'),
  create: (data) => API.post('/inpatient/beds', data),
};

export default API;
