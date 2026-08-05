import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import OtpInput from '../../components/OtpInput';
import { GraduationCap, Mail, ArrowLeft, RefreshCw, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

const OtpVerification = () => {
  const navigate = useNavigate();
  const { otpLogin } = useAuth();

  const [step, setStep] = useState(1); // 1: Send OTP email, 2: Verify OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Timers
  const [expirySeconds, setExpirySeconds] = useState(300); // 5 minutes
  const [cooldownSeconds, setCooldownSeconds] = useState(30); // 30 seconds

  useEffect(() => {
    let timer;
    if (step === 2 && expirySeconds > 0) {
      timer = setInterval(() => setExpirySeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, expirySeconds]);

  useEffect(() => {
    let timer;
    if (step === 2 && cooldownSeconds > 0) {
      timer = setInterval(() => setCooldownSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldownSeconds]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await authService.sendOtp(email, 'LOGIN');
      setStep(2);
      setExpirySeconds(300);
      setCooldownSeconds(30);
      setSuccessMsg(`Verification code sent to ${email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await otpLogin(email, otp);
      if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/faculty/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldownSeconds > 0) return;
    setLoading(true);
    setError('');
    try {
      await authService.sendOtp(email, 'LOGIN');
      setExpirySeconds(300);
      setCooldownSeconds(30);
      setOtp('');
      setSuccessMsg('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10 space-y-6">
        
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {step === 1 ? 'Login with OTP' : 'Verify OTP'}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {step === 1 
              ? 'Enter your registered email address to receive a 6-digit verification code.'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Request Email OTP */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter registered email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/30 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          /* STEP 2: Enter & Verify OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <OtpInput value={otp} onChange={setOtp} length={6} disabled={loading} />
              
              <div className="flex justify-between items-center text-xs mt-3 text-slate-500 font-medium">
                <span>OTP expires in <strong className="text-slate-800">{formatTimer(expirySeconds)}</strong></span>
                {expirySeconds === 0 && <span className="text-red-500 font-semibold">Expired</span>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || expirySeconds === 0}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/30 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP'}
            </button>

            {/* Resend OTP Section */}
            <div className="pt-2 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Didn't receive the OTP?</p>
              {cooldownSeconds > 0 ? (
                <span className="text-xs font-semibold text-slate-400">
                  Resend OTP in {formatTimer(cooldownSeconds)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default OtpVerification;
