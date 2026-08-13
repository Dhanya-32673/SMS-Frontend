import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, ArrowLeft, KeyRound, AlertCircle, ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [roleMode, setRoleMode] = useState('STANDARD'); // 'STANDARD' | 'FACULTY'
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [facultySuccessMsg, setFacultySuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setFacultySuccessMsg('');

    try {
      if (roleMode === 'FACULTY') {
        console.log('[ForgotPassword] Requesting faculty reset approval for:', cleanEmail);
        const res = await authService.requestFacultyPasswordReset({
          facultyEmail: cleanEmail,
          employeeId: employeeId.trim(),
          reason: reason.trim(),
        });
        console.log('[ForgotPassword] Faculty reset API response:', res);
        setFacultySuccessMsg(res?.message || 'Your password reset request has been sent to the administrator.');
      } else {
        console.log('[ForgotPassword] Requesting standard reset OTP for:', cleanEmail);
        const res = await authService.forgotPassword(cleanEmail);
        console.log('[ForgotPassword] Standard reset API response:', res);
        navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}`);
      }
    } catch (err) {
      console.error('[ForgotPassword] Error requesting reset:', err);
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10 space-y-6">
        
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        {/* Role Toggle Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => { setRoleMode('STANDARD'); setError(''); setFacultySuccessMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition-all ${roleMode === 'STANDARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            General Account
          </button>
          <button
            type="button"
            onClick={() => { setRoleMode('FACULTY'); setError(''); setFacultySuccessMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition-all ${roleMode === 'FACULTY' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Faculty Account
          </button>
        </div>

        <div className="text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${roleMode === 'FACULTY' ? 'bg-amber-500 shadow-amber-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}>
            {roleMode === 'FACULTY' ? <ShieldAlert className="w-7 h-7 text-white" /> : <KeyRound className="w-7 h-7 text-white" />}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {roleMode === 'FACULTY' ? 'Faculty Password Reset' : 'Forgot Password'}
          </h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            {roleMode === 'FACULTY'
              ? 'Faculty password reset requests are routed to System Administration. The authorization code will be sent to the Admin.'
              : 'Enter your registered email address to receive a 6-digit verification code.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {facultySuccessMsg ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-center animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-extrabold text-emerald-900">Request Sent to Administrator</h4>
            <p className="text-xs text-emerald-700 leading-relaxed font-medium">
              {facultySuccessMsg}
            </p>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-emerald-200/60">
              Please contact your System Administrator to verify your request and reset your credentials.
            </p>
            <Link
              to={`/reset-password?mode=faculty&email=${encodeURIComponent(email)}`}
              className="inline-block w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all text-center mt-2"
            >
              Go to Admin Approval & Reset Page
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Faculty / Registered Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter.email@college.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all font-medium"
                />
              </div>
            </div>

            {roleMode === 'FACULTY' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Employee ID (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserCheck className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. EMP-2026-08"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Reason for Reset (Optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly state your reason for requesting a reset..."
                    rows={2}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all font-medium"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-xl font-extrabold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${roleMode === 'FACULTY' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}
            >
              {loading
                ? 'Processing Request...'
                : roleMode === 'FACULTY'
                ? 'Submit Reset Request to Admin'
                : 'Send Reset OTP'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
