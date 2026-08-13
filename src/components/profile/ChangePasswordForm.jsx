import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2, XCircle, AlertCircle, ShieldCheck, Key, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export const ChangePasswordForm = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const newPass = formData.newPassword;
  const reqs = [
    { label: 'At least 8 characters long', valid: newPass.length >= 8 },
    { label: 'At least 1 uppercase letter (A-Z)', valid: /[A-Z]/.test(newPass) },
    { label: 'At least 1 lowercase letter (a-z)', valid: /[a-z]/.test(newPass) },
    { label: 'At least 1 number (0-9)', valid: /[0-9]/.test(newPass) },
    { label: 'At least 1 special character (!@#$%^&*)', valid: /[!@#$%^&*(),.?":{}|<>_\-\+=~`]/.test(newPass) },
  ];

  const validCount = reqs.filter((r) => r.valid).length;
  let strengthLabel = 'Weak';
  let strengthColor = 'bg-rose-500';
  let strengthPercent = (validCount / 5) * 100;

  if (validCount >= 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
  } else if (validCount >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all required password fields.');
      showWarning('Please fill all required fields.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match.');
      showWarning('Please make sure the new passwords match.');
      return;
    }

    if (validCount < 5) {
      setError('New password does not meet all security policy requirements.');
      showWarning('Please use a stronger password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess('Password changed successfully.');
      showSuccess('Password changed successfully.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password. Please verify current password.';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans max-w-xl">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Change Account Password
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Update your password securely. Minimum 8 characters with upper, lower, number, and special character.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Current Password */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Current Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            New Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Bar */}
          {newPass && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500">Password Strength:</span>
                <span className={`font-extrabold ${strengthLabel === 'Strong' ? 'text-emerald-600' : strengthLabel === 'Medium' ? 'text-amber-600' : 'text-rose-600'}`}>
                  {strengthLabel}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${strengthPercent}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Confirm New Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your new password"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Requirements Checklist */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block">
            Password Policy Requirements
          </span>
          <div className="space-y-1.5">
            {reqs.map((r, i) => (
              <div key={i} className="flex items-center space-x-2 text-[11px]">
                {r.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
                <span className={r.valid ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center space-x-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Key className="w-4 h-4" />
          )}
          <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
        </button>

      </form>
    </div>
  );
};

export default ChangePasswordForm;
