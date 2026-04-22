import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import PatientDashboard from './pages/PatientDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import LabTechnicianDashboard from './pages/LabTechnicianDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PatientEMR from './pages/PatientEMR';
import OrgDashboard from './pages/OrgDashboard';
import StaffManagement from './pages/StaffManagement';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          
          {/* Protected Routes (Authenticated only) */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/super-admin" element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ORG_ADMIN', 'SUPER_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/nurse" element={
              <ProtectedRoute allowedRoles={['NURSE']}>
                <NurseDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/reception" element={
              <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/pharmacy" element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'NURSE', 'ORG_ADMIN', 'SUPER_ADMIN']}>
                <PharmacyDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/lab" element={
              <ProtectedRoute allowedRoles={['LAB_TECH', 'ORG_ADMIN', 'SUPER_ADMIN']}>
                <LabTechnicianDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/bloodbank" element={
              <ProtectedRoute allowedRoles={['LAB_TECH', 'ORG_ADMIN', 'SUPER_ADMIN']}>
                <BloodBankDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/patient/emr" element={
              <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'NURSE']}>
                <PatientEMR />
              </ProtectedRoute>
            } />
            
            <Route path="/org-dashboard" element={
              <ProtectedRoute allowedRoles={['ORG_ADMIN']}>
                <OrgDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/org-staff" element={
              <ProtectedRoute allowedRoles={['ORG_ADMIN']}>
                <StaffManagement />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
