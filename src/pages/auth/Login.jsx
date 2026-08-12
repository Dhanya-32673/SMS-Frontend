import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin, verifyOtp, isAuthenticated, user, isInactiveLoggedOut } = useAuth();

  // Authentication Flow State: 'LOGIN' | 'OTP'
  const [step, setStep] = useState('LOGIN');
  
  // Credentials & OTP inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Timers
  const [expirySeconds, setExpirySeconds] = useState(300); // 5 minutes
  const [cooldownSeconds, setCooldownSeconds] = useState(30); // 30 seconds resend cooldown

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      let rawRole = '';
      if (typeof user.role === 'string') rawRole = user.role;
      else if (user.role?.roleName) rawRole = user.role.roleName;
      else if (user.role?.name) rawRole = user.role.name;

      const role = rawRole.replace('ROLE_', '').toUpperCase();
      if (role === 'FACULTY') {
        navigate('/faculty/dashboard', { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // 5-minute expiry timer
  useEffect(() => {
    let timer;
    if (step === 'OTP' && expirySeconds > 0) {
      timer = setInterval(() => setExpirySeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, expirySeconds]);

  // 30-second resend cooldown timer
  useEffect(() => {
    let timer;
    if (step === 'OTP' && cooldownSeconds > 0) {
      timer = setInterval(() => setCooldownSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldownSeconds]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const validateCredentials = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // STEP 1: Submit Credentials -> Calls POST /api/auth/login
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    if (!validateCredentials()) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await login(email, password);
      if (response && (response.requiresOtp || response.otpRequired || response.success)) {
        const targetEmail = response.email || email;
        localStorage.setItem("pendingEmail", targetEmail);
        setEmail(targetEmail);
        setStep('OTP');
        setExpirySeconds(300);
        setCooldownSeconds(30);
        setSuccessMsg(response?.message || `We have sent a verification code to ${targetEmail}`);
      } else {
        setError(response?.message || 'Invalid username or password');
      }
    } catch (err) {
      let msg = 'Invalid username or password';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP -> Calls POST /api/auth/verify-otp
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the complete 4-digit OTP code');
      return;
    }

    setLoading(true);
    setError('');

    const targetEmail = email || localStorage.getItem("pendingEmail");
    if (!targetEmail) {
      setError('Session expired. Please enter your email and password again.');
      setStep('LOGIN');
      setLoading(false);
      return;
    }

    try {
      const response = await verifyOtp(targetEmail, otp);
      setSuccessMsg('Login successful! Redirecting to dashboard...');
      
      const verifiedEmail = response?.user?.email || response?.email || targetEmail;
      const verifiedToken = response?.accessToken || response?.token;

      if (verifiedToken) {
        localStorage.setItem("token", verifiedToken);
      }
      if (verifiedEmail) {
        localStorage.setItem("userEmail", verifiedEmail);
      }
      localStorage.removeItem("pendingEmail");

      const userRole = response?.user?.role || user?.role;
      let targetUrl = '/admin/dashboard';
      if (typeof userRole === 'string' && userRole.toUpperCase().includes('FACULTY')) {
        targetUrl = '/faculty/dashboard';
      } else if (userRole?.roleName === 'ROLE_FACULTY') {
        targetUrl = '/faculty/dashboard';
      }

      setTimeout(() => {
        navigate(targetUrl, { replace: true });
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP -> Calls POST /api/auth/resend-otp
  const handleResendOtp = async () => {
    if (cooldownSeconds > 0 || loading) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const targetEmail = email || localStorage.getItem("pendingEmail");

    try {
      await authService.resendOtp(targetEmail);
      setExpirySeconds(300);
      setCooldownSeconds(30);
      setSuccessMsg(`New verification code sent to ${targetEmail}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('LOGIN');
    setOtp('');
    setError('');
    setSuccessMsg('');
    localStorage.removeItem("pendingEmail");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">SICMS Portal</span>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
          {step === 'LOGIN' ? 'Sign in to your account' : 'Verify Email OTP'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {step === 'LOGIN' 
            ? 'Student Information & Certificate Management System' 
            : `Enter the 4-digit code sent to ${email || localStorage.getItem('pendingEmail') || 'your email'}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-black/50 border border-slate-800 sm:rounded-2xl sm:px-10">
          
          {/* Notifications */}
          {isInactiveLoggedOut && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>You were logged out due to inactivity for security reasons. Please log in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: LOGIN FORM */}
          {step === 'LOGIN' && (
            <form className="space-y-5" onSubmit={handleCredentialSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    placeholder="Enter your registered email"
                    className={`block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border ${
                      fieldErrors.email ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    placeholder="••••••••"
                    className={`block w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border ${
                      fieldErrors.password ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/30 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign in <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION FORM */}
          {step === 'OTP' && (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-300">
                    4-Digit Verification Code
                  </label>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    Expires in: <strong className="text-blue-400 font-semibold">{formatTimer(expirySeconds)}</strong>
                  </span>
                </div>
                
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 4-digit OTP"
                    className="block w-full pl-10 pr-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-center tracking-[8px] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400 text-center">
                  Check your inbox ({email || localStorage.getItem('pendingEmail')}) for the 4-digit code.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 4 || expirySeconds === 0}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/30 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Verify & Access System
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldownSeconds > 0 || loading}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {cooldownSeconds > 0 ? `Resend code in ${cooldownSeconds}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
