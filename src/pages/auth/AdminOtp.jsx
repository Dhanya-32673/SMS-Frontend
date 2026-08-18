import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import OtpVerificationCard from '../../components/OtpVerificationCard';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { tokenUtils } from '../../utils/tokenUtils';

const AdminOtp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { adminVerifyOtp, setAuthUser } = useAuth();
  const email = searchParams.get('email') || localStorage.getItem('pendingEmail') || 'bhashyamgnt.edu@gmail.com';

  const handleVerify = async (code) => {
    const response = await adminVerifyOtp(email, code);
    const targetUser = response?.user || tokenUtils.getUser() || { email, role: 'ADMIN' };
    if (setAuthUser) setAuthUser(targetUser);
    localStorage.removeItem('pendingEmail');
    await new Promise((resolve) => setTimeout(resolve, 1500));
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
