import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import LabTechnicianDashboard from './pages/LabTechnicianDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import BloodBankDashboard from './pages/BloodBankDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PatientEMR from './pages/PatientEMR';
import Profile from './pages/Profile';

const DashboardLayout = () => (
  <div className="min-h-screen bg-surface flex">
    <Sidebar />
    <div className="flex-1 ml-64 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

const AuthLayout = () => (
  <div className="min-h-screen bg-surface">
    <Outlet />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
        </Route>

        {/* Protected Dashboard Routes wrapped with DashboardLayout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/superadmin" element={
            <ProtectedRoute allowedRoles={['Super_Admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Hospital_Admin', 'Super_Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/reception" element={
            <ProtectedRoute allowedRoles={['Receptionist', 'Hospital_Admin', 'Super_Admin']}>
              <ReceptionistDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/:id/emr" element={
            <ProtectedRoute allowedRoles={['Doctor', 'Hospital_Admin', 'Super_Admin']}>
              <PatientEMR />
            </ProtectedRoute>
          } />
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pharmacy" element={
            <ProtectedRoute allowedRoles={['Pharmacist', 'Hospital_Admin']}>
              <PharmacyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/lab" element={
            <ProtectedRoute allowedRoles={['Lab_Technician', 'Doctor', 'Hospital_Admin']}>
              <LabTechnicianDashboard />
            </ProtectedRoute>
          } />
          <Route path="/bloodbank" element={
            <ProtectedRoute allowedRoles={['Lab_Technician', 'Hospital_Admin', 'Super_Admin']}>
              <BloodBankDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
