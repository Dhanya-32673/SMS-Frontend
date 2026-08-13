import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import RoleRoute from './components/RoleRoute';

// Auth Pages (Eagerly loaded for fast TTI on login)
import Login from './pages/auth/Login';
import OtpVerification from './pages/auth/OtpVerification';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import OAuth2RedirectHandler from './pages/auth/OAuth2RedirectHandler';
import OAuthSuccess from './pages/auth/OAuthSuccess';

// Dashboards (Lazy loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard').then(m => ({ default: m.FacultyDashboard })));

// Admin Student Management Pages (Lazy loaded)
const AllStudents = lazy(() => import('./pages/admin/students/AllStudents').then(m => ({ default: m.AllStudents })));
const AddStudent = lazy(() => import('./pages/admin/students/AddStudent').then(m => ({ default: m.AddStudent })));
const StudentProfile = lazy(() => import('./pages/admin/students/StudentProfile').then(m => ({ default: m.StudentProfile })));
const EditStudent = lazy(() => import('./pages/admin/students/EditStudent').then(m => ({ default: m.EditStudent })));
const StudentIdCard = lazy(() => import('./pages/admin/students/StudentIdCard').then(m => ({ default: m.StudentIdCard })));

// Faculty Student Management Pages (Lazy loaded)
const SearchStudent = lazy(() => import('./pages/faculty/students/SearchStudent').then(m => ({ default: m.SearchStudent })));
const FacultyStudentProfile = lazy(() => import('./pages/faculty/students/FacultyStudentProfile').then(m => ({ default: m.FacultyStudentProfile })));

// Certificate Pages (Lazy loaded)
const AllCertificates = lazy(() => import('./pages/admin/certificates/AllCertificates').then(m => ({ default: m.AllCertificates })));
const UploadCertificate = lazy(() => import('./pages/admin/certificates/UploadCertificate').then(m => ({ default: m.UploadCertificate })));
const PendingDocuments = lazy(() => import('./pages/admin/certificates/PendingDocuments').then(m => ({ default: m.PendingDocuments })));
const MissingDocuments = lazy(() => import('./pages/admin/certificates/MissingDocuments').then(m => ({ default: m.MissingDocuments })));
const VerifiedDocuments = lazy(() => import('./pages/admin/certificates/VerifiedDocuments').then(m => ({ default: m.VerifiedDocuments })));
const CertificateTypes = lazy(() => import('./pages/admin/certificates/CertificateTypes').then(m => ({ default: m.CertificateTypes })));

// Faculty, Group, Section & Security Pages (Lazy loaded)
const FacultyManagement = lazy(() => import('./pages/admin/faculty/FacultyManagement').then(m => ({ default: m.FacultyManagement })));
const AddFaculty = lazy(() => import('./pages/admin/faculty/AddFaculty').then(m => ({ default: m.AddFaculty })));
const EditFaculty = lazy(() => import('./pages/admin/faculty/EditFaculty').then(m => ({ default: m.EditFaculty })));
const FacultyProfile = lazy(() => import('./pages/admin/faculty/FacultyProfile').then(m => ({ default: m.FacultyProfile })));
const GroupManagement = lazy(() => import('./pages/admin/academic/GroupManagement').then(m => ({ default: m.GroupManagement })));
const SectionManagement = lazy(() => import('./pages/admin/academic/SectionManagement').then(m => ({ default: m.SectionManagement })));
const RoleManagement = lazy(() => import('./pages/admin/security/RoleManagement').then(m => ({ default: m.RoleManagement })));

// Common User Profile Page (Lazy loaded)
const UserProfile = lazy(() => import('./pages/common/UserProfile').then(m => ({ default: m.UserProfile })));

import { warmupServer } from './services/api';

const RouteFallback = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div className="flex items-center space-x-3 text-blue-400 font-bold text-sm">
      <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
      <span>Loading Page...</span>
    </div>
  </div>
);

function App() {
  React.useEffect(() => {
    // Non-blocking ping to wake up Render free tier backend immediately when site is opened
    warmupServer();
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
          {/* Public Authentication Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin & Faculty Shared Student Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <AllStudents />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/students/add"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <AddStudent />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/students/:id"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <StudentProfile />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/students/:id/edit"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <EditStudent />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/students/:id/id-card"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <StudentIdCard />
              </RoleRoute>
            }
          />

          {/* Certificate Management Routes */}
          <Route
            path="/admin/certificates"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AllCertificates />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/upload"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <UploadCertificate />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/pending"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <PendingDocuments />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/missing"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <MissingDocuments />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/verified"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <VerifiedDocuments />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/types"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <CertificateTypes />
              </RoleRoute>
            }
          />

          {/* Faculty Management Routes */}
          <Route
            path="/admin/faculty"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <FacultyManagement />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/faculty/add"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AddFaculty />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/faculty/:id"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <FacultyProfile />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/faculty/:id/edit"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <EditFaculty />
              </RoleRoute>
            }
          />

          {/* Academic Management Routes */}
          <Route
            path="/admin/academic/groups"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <GroupManagement />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/academic/sections"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <SectionManagement />
              </RoleRoute>
            }
          />

          {/* Security Management Routes */}
          <Route
            path="/admin/security/roles"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <RoleManagement />
              </RoleRoute>
            }
          />

          {/* Faculty Dashboard & Dedicated Student Search */}
          <Route
            path="/faculty/dashboard"
            element={
              <RoleRoute allowedRoles={['FACULTY']}>
                <FacultyDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/faculty/students/search"
            element={
              <RoleRoute allowedRoles={['FACULTY']}>
                <SearchStudent />
              </RoleRoute>
            }
          />
          <Route
            path="/faculty/students/:id"
            element={
              <RoleRoute allowedRoles={['FACULTY']}>
                <FacultyStudentProfile />
              </RoleRoute>
            }
          />

          {/* Shared Common Profile */}
          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <UserProfile />
              </RoleRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
