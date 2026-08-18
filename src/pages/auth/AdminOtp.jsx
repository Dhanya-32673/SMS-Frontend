import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import OtpVerificationCard from '../../components/OtpVerificationCard';
import { authService } from '../../services/authService';

const AdminOtp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || localStorage.getItem('pendingEmail') || 'bhashyamgnt.edu@gmail.com';

  const handleVerify = async (code) => {
    await authService.verifyAdminOtp(email, code);
    localStorage.removeItem('pendingEmail');
    navigate('/admin/dashboard', { replace: true });
  };

  const handleResend = async () => {
    await authService.resendOtp(email);
  };

  const handleBack = () => {
    navigate('/login', { replace: true });
  };

  return (
    <OtpVerificationCard
      email={email}
      length={4}
      title="Admin Security Verification"
      subtitle="Student Information & Certificate Management System"
      onVerify={handleVerify}
      onResend={handleResend}
      onBack={handleBack}
    />
  );
};

export default AdminOtp;
