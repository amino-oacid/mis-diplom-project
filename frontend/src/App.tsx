import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout';
import { MainLayout } from './components/layout/MainLayout';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  PatientsPage,
  PatientFormPage,
  PatientCardPage,
  AppointmentsPage,
  AppointmentFormPage,
  AppointmentDetailPage,
  PrescriptionFormPage,
  InventoryPage,
  InventoryFormPage,
  ReportsPage,
  SchedulePage,
  ProfilePage,
} from './pages';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Начальная страница с дашбордом */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Пациенты */}
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/new" element={<PatientFormPage />} />
            <Route path="/patients/:id" element={<PatientFormPage />} />
            <Route path="/patients/:id/card" element={<PatientCardPage />} />

            {/* Приёмы */}
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/appointments/new" element={<AppointmentFormPage />} />
            <Route path="/appointments/:id" element={<AppointmentDetailPage />} />

            {/* Расписание */}
            <Route path="/schedule" element={<SchedulePage />} />

            {/* Профиль */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Назначения */}
            <Route path="/prescriptions/new/:appointmentId" element={<PrescriptionFormPage />} />

            {/* Склад */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/new"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InventoryFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InventoryFormPage />
                </ProtectedRoute>
              }
            />

            {/* Отчёты */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Редирект с корня на дашборд */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 — на дашборд */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
