export const adminOverviewStats = [
  { id: 1, label: 'Total Patients', value: '12,403', trend: '+4.2%' },
  { id: 2, label: 'Available Doctors', value: '45', trend: 'Stable' },
  { id: 3, label: "Today's Appointments", value: '184', trend: '+12.5%' },
  { id: 4, label: 'Revenue', value: '$84,500', trend: '+2.1%' }
];

export const recentAppointments = [
  { id: 'APT-100', patient: 'Arthur Morgan', doctor: 'Dr. John Watson', time: '10:00 AM', status: 'Confirmed' },
  { id: 'APT-101', patient: 'Sadie Adler', doctor: 'Dr. Meredith Grey', time: '10:30 AM', status: 'Pending' },
  { id: 'APT-102', patient: 'Charles Smith', doctor: 'Dr. Gregory House', time: '11:00 AM', status: 'Completed' },
  { id: 'APT-103', patient: 'John Marston', doctor: 'Dr. John Dorian', time: '11:15 AM', status: 'Confirmed' },
  { id: 'APT-104', patient: 'Lenny Summers', doctor: 'Dr. Allison Cameron', time: '11:45 AM', status: 'Canceled' },
];

export const patientAppointments = [
  { id: 1, doctor: 'Dr. Elena Rodriguez', specialty: 'Cardiology', date: 'Oct 12, 10:00 AM' },
  { id: 2, doctor: 'Dr. James Wilson', specialty: 'General Practice', date: 'Oct 20, 02:30 PM' },
];

export const patientPrescriptions = [
  { id: 1, name: 'Lisinopril', dosage: '10mg', status: 'Active' },
  { id: 2, name: 'Atorvastatin', dosage: '20mg', status: 'Refill Soon' },
];

export const patientLabs = [
  { id: 1, test: 'Comprehensive Metabolic Panel', date: 'Sep 28, 2026' },
  { id: 2, test: 'Lipid Panel', date: 'Sep 28, 2026' },
  { id: 3, test: 'Complete Blood Count', date: 'Aug 15, 2026' },
];

export const doctorMetrics = [
  { id: 1, label: "Today's Patients", value: '12' },
  { id: 2, label: 'Pending Lab Reports', value: '5' },
  { id: 3, label: 'Unread Messages', value: '3' },
];

export const doctorSchedule = [
  { id: 'SCH-1', patient: 'Arthur Morgan', time: '10:00 AM', reason: 'Hypertension Follow-up' },
  { id: 'SCH-2', patient: 'Sadie Adler', time: '10:30 AM', reason: 'Annual Physical' },
  { id: 'SCH-3', patient: 'Charles Smith', time: '11:00 AM', reason: 'Chest Pain Evaluation' },
];

export const doctorActions = [
  { id: 'ACT-1', title: 'Lipid Panel for John Doe', type: 'Lab Result' },
  { id: 'ACT-2', title: 'Lisinopril 10mg for Arthur Morgan', type: 'Prescription Renewal' },
];

export const sidebarLinks = [
  { id: 'superadmin', label: 'Super Admin', icon: 'security', path: '/superadmin' },
  { id: 'admin', label: 'Admin Dashboard', icon: 'admin_panel_settings', path: '/admin' },
  { id: 'reception', label: 'Reception', icon: 'assignment_ind', path: '/reception' },
  { id: 'doctor', label: 'Doctor Dashboard', icon: 'stethoscope', path: '/doctor' },
  { id: 'patient', label: 'Patient Portal', icon: 'personal_injury', path: '/patient' },
  { id: 'pharmacy', label: 'Pharmacy', icon: 'medication', path: '/pharmacy' },
  { id: 'lab', label: 'Laboratory', icon: 'science', path: '/lab' },
  { id: 'bloodbank', label: 'Blood Bank', icon: 'volunteer_activism', path: '/bloodbank' },
  { id: 'orgadmin', label: 'Org Dashboard', icon: 'corporate_fare', path: '/org-dashboard' },
  { id: 'orgstaff', label: 'Staff Management', icon: 'groups', path: '/org-staff' },
];

export const receptionistStats = [
  { id: 1, label: 'Total Walk-ins', value: '42' },
  { id: 2, label: 'Upcoming Appointments', value: '18' },
  { id: 3, label: 'Pending Billing', value: '5' }
];

export const checkInWaitlist = [
  { id: 'WL-1', patient: 'Michael De Santa', time: '09:15 AM', status: 'In Progress', doctor: 'Dr. John Watson' },
  { id: 'WL-2', patient: 'Franklin Clinton', time: '09:30 AM', status: 'Waiting', doctor: 'Dr. Sarah Jenkins' },
  { id: 'WL-3', patient: 'Trevor Philips', time: '09:45 AM', status: 'Checked In', doctor: 'Dr. Elena Rodriguez' },
];

export const pharmacyStats = [
  { id: 1, label: 'Total Dispensed Today', value: '1,204' },
  { id: 2, label: 'Pending Orders', value: '24' },
  { id: 3, label: 'Low Stock Items', value: '12' }
];

export const prescriptionQueue = [
  { id: 'RX-8821', patient: 'Arthur Morgan', doctor: 'Dr. Watson', medication: 'Amoxicillin 500mg', status: 'Pending' },
  { id: 'RX-8822', patient: 'Sadie Adler', doctor: 'Dr. Jenkins', medication: 'Lisinopril 10mg', status: 'Ready' },
  { id: 'RX-8823', patient: 'John Marston', doctor: 'Dr. House', medication: 'Atorvastatin 20mg', status: 'Picked Up' },
];

export const inventoryAlerts = [
  { id: 1, name: 'Insulin (Novolog)', stock: 5, total: 100 },
  { id: 2, name: 'Metformin 500mg', stock: 12, total: 200 },
  { id: 3, name: 'Albuterol Inhaler', stock: 8, total: 50 },
];

export const labStats = [
  { id: 1, label: 'Tests Completed Today', value: '142' },
  { id: 2, label: 'Critical Findings', value: '3' },
  { id: 3, label: 'Samples Awaiting Processing', value: '28' }
];

export const pendingLabSamples = [
  { id: 'LAB-991', patient: 'Charles Smith', test: 'Comprehensive Metabolic Panel', priority: 'Normal', status: 'In Progress' },
  { id: 'LAB-992', patient: 'Lenny Summers', test: 'Troponin Level', priority: 'Urgent', status: 'Awaiting Sample' },
  { id: 'LAB-993', patient: 'Dutch van der Linde', test: 'Complete Blood Count', priority: 'Normal', status: 'Awaiting Sample' },
];

export const recentLabResults = [
  { id: 1, test: 'Lipid Panel - Arthur Morgan', time: '10:45 AM' },
  { id: 2, test: 'HbA1c - Sadie Adler', time: '09:30 AM' },
  { id: 3, test: 'Urinalysis - John Marston', time: '08:15 AM' },
];
