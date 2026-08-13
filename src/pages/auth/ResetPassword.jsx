import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import OtpInput from '../../components/OtpInput';
import AuthLayout from '../../components/auth/AuthLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert,
  Mail,
  Check,
  ArrowRight
} from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = searchParams.get('mode') === 'standard' ? 'STANDARD' : 'FACULTY';

  const [mode, setMode] = useState(initialMode); // 'FACULTY' | 'STANDARD'
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    if (!cleanEmail || !cleanOtp || !newPassword || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (cleanOtp.length !== 6) {
      setError('OTP must be a 6-digit number');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'FACULTY') {
        await authService.adminResetFacultyPassword({
          facultyEmail: cleanEmail,
          otp: cleanOtp,
          newPassword,
          confirmPassword,
        });
      } else {
        await authService.resetPassword(cleanEmail, cleanOtp, newPassword, confirmPassword);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check the OTP code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={mode === 'FACULTY' ? "Faculty Recovery" : "Reset Password"}
      subtitle="Student Information & Certificate Management System"
    >
      <div className="w-full max-w-[430px] mx-auto space-y-3.5 my-auto">
        
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

        {/* Tab Switcher at Top of Card (Height 46px, Font size 13px/xs) */}
        <div className="bg-[#f1f5f9] rounded-[12px] p-1 flex h-[46px] w-full border border-slate-200/80 text-[11px] sm:text-xs font-extrabold">
          <button
            type="button"
            onClick={() => { setMode('STANDARD'); setError(''); }}
            className={`flex-1 py-1.5 rounded-[10px] transition-all duration-300 cursor-pointer ${
              mode === 'STANDARD' ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            General User
          </button>
          <button
            type="button"
            onClick={() => { setMode('FACULTY'); setError(''); }}
            className={`flex-1 py-1.5 rounded-[10px] transition-all duration-300 cursor-pointer ${
              mode === 'FACULTY' ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Admin User
          </button>
        </div>

        {/* Center Shield Icon (Size 82px, Icon 36px, Floating Y Animation) */}
        <div className="text-center pt-0.5">
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-[82px] h-[82px] rounded-full bg-[#eff6ff] flex items-center justify-center mx-auto shadow-inner border border-blue-100"
          >
            {mode === 'FACULTY' ? (
              <ShieldAlert className="w-9 h-9 text-[#2563eb]" />
            ) : (
              <ShieldCheck className="w-9 h-9 text-[#2563eb]" />
            )}
          </motion.div>

          {/* Page Title & Subtitle */}
          <h2 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight mt-2">
            {mode === 'FACULTY' ? 'Faculty Reset' : 'Reset Password'}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-[300px] mx-auto mt-0.5">
            {mode === 'FACULTY'
              ? 'Enter Faculty Email, 6-digit OTP code, and new password'
              : 'Enter 6-digit code sent to your email and set new password'}
          </p>
        </div>

        {/* Notifications */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Card State */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[20px] bg-emerald-50 border border-emerald-200 text-center space-y-3 shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-emerald-900">Password Reset Successful!</h3>
            <p className="text-xs text-emerald-700 font-medium">Your password has been updated securely. Redirecting to login page...</p>
          </motion.div>
        ) : (
          /* Form Fields (Height 50px, Radius 14px) */
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                {mode === 'FACULTY' ? 'Faculty Email Address' : 'Email Address'}
              </label>
              <div className="h-[50px] bg-white border border-slate-200 focus-within:border-[#2563eb] focus-within:ring-4 focus-within:ring-[#2563eb]/15 rounded-[14px] flex items-center px-3.5 gap-2.5 transition-all duration-200">
                <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'FACULTY' ? "faculty.email@college.edu" : "Registered Email"}
                  required
                  className="w-full bg-transparent text-slate-900 font-semibold text-xs sm:text-sm placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* OTP Code */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                {mode === 'FACULTY' ? '6-Digit Admin Authorization OTP' : '6-Digit Verification Code'}
              </label>
              <OtpInput value={otp} onChange={setOtp} length={6} disabled={loading} />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                New Password
              </label>
              <div className="h-[50px] bg-white border border-slate-200 focus-within:border-[#2563eb] focus-within:ring-4 focus-within:ring-[#2563eb]/15 rounded-[14px] flex items-center px-3.5 gap-2.5 transition-all duration-200">
                <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full bg-transparent text-slate-900 font-semibold text-xs sm:text-sm placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="h-[50px] bg-white border border-slate-200 focus-within:border-[#2563eb] focus-within:ring-4 focus-within:ring-[#2563eb]/15 rounded-[14px] flex items-center px-3.5 gap-2.5 transition-all duration-200">
                <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full bg-transparent text-slate-900 font-semibold text-xs sm:text-sm placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Primary CTA Button (Height 52px, Radius 14px, Font size 14px) */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full h-[52px] rounded-[14px] font-bold text-sm bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-blue-700 hover:to-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'FACULTY' ? 'Approve & Reset Faculty Password' : 'Reset Password'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

          </form>
        )}

        {/* Footer Trust Line */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center text-slate-400 text-[11px] font-bold gap-1.5">
          <span>🔒</span>
          <span>Secure • Encrypted • Trusted</span>
        </div>

      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
