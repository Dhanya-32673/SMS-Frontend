import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import OtpVerification from './pages/auth/OtpVerification';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';

// Admin Student Management Pages
import AllStudents from './pages/admin/students/AllStudents';
import AddStudent from './pages/admin/students/AddStudent';
import StudentProfile from './pages/admin/students/StudentProfile';
import EditStudent from './pages/admin/students/EditStudent';
import StudentIdCard from './pages/admin/students/StudentIdCard';

// Faculty Student Management Pages
import SearchStudent from './pages/faculty/students/SearchStudent';
import FacultyStudentProfile from './pages/faculty/students/FacultyStudentProfile';

// Part 3 Certificate Pages
import AllCertificates from './pages/admin/certificates/AllCertificates';
import UploadCertificate from './pages/admin/certificates/UploadCertificate';
import PendingDocuments from './pages/admin/certificates/PendingDocuments';
import MissingDocuments from './pages/admin/certificates/MissingDocuments';
import VerifiedDocuments from './pages/admin/certificates/VerifiedDocuments';
import CertificateTypes from './pages/admin/certificates/CertificateTypes';

// Part 4 Faculty, Group, Section & Security Pages
import FacultyManagement from './pages/admin/faculty/FacultyManagement';
import AddFaculty from './pages/admin/faculty/AddFaculty';
import EditFaculty from './pages/admin/faculty/EditFaculty';
import FacultyProfile from './pages/admin/faculty/FacultyProfile';
import GroupManagement from './pages/admin/academic/GroupManagement';
import SectionManagement from './pages/admin/academic/SectionManagement';
import RoleManagement from './pages/admin/security/RoleManagement';

// Common User Profile Page
import UserProfile from './pages/common/UserProfile';

// Route Protection
import RoleRoute from './components/RoleRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
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

          {/* Part 3 Certificate Routes */}
          <Route
            path="/admin/certificates"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
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
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <PendingDocuments />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/missing"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <MissingDocuments />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/verified"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <VerifiedDocuments />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/types"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <CertificateTypes />
              </RoleRoute>
            }
          />

          {/* Part 4 Faculty & Academic Management Routes */}
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
            path="/admin/faculty/:facultyId"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <FacultyProfile />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/faculty/:facultyId/edit"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <EditFaculty />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <GroupManagement />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/academic/groups"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <GroupManagement />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/sections"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <SectionManagement />
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
          <Route
            path="/admin/roles"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <RoleManagement />
              </RoleRoute>
            }
          />

          {/* Faculty Routes */}
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
              <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <SearchStudent />
              </RoleRoute>
            }
          />
          <Route
            path="/faculty/students/:id"
            element={
              <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <FacultyStudentProfile />
              </RoleRoute>
            }
          />
          <Route
            path="/faculty/students/:id/id-card"
            element={
              <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <StudentIdCard />
              </RoleRoute>
            }
          />

          {/* Common User Profile & Change Password Route */}
          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                <UserProfile />
              </RoleRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
