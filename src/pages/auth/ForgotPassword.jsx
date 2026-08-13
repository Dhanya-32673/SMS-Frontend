import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResetPassword from './ResetPassword';

const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/reset-password?mode=faculty', { replace: true });
  }, [navigate]);

  return <ResetPassword />;
};

export default ForgotPassword;
