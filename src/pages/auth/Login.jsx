import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Award, 
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin, isAuthenticated, user, isInactiveLoggedOut } = useAuth();

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

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      let msg = 'Invalid email or password. Please try again.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message && err.message !== 'Network Error') {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      setLoading(true);
      setError('');
      await googleLogin(response.credential);
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isPlaceholder = !googleClientId || googleClientId.includes('YOUR_GOOGLE_CLIENT_ID');

    if (window.google && !isPlaceholder) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleSuccess,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        const targetDiv = document.getElementById("googleSignInDiv");
        if (targetDiv) {
          window.google.accounts.id.renderButton(
            targetDiv,
            { theme: "outline", size: "large", width: "100%", shape: "pill" }
          );
        }
      } catch (err) {
        console.warn('Google Auth init warning:', err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Branding Panel: Enterprise Blue Gradient */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight block">SICMS</span>
              <span className="text-xs text-blue-100 font-extrabold uppercase tracking-widest block">College Academic Portal</span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 my-8 space-y-4">
            <h2 className="text-xl font-black text-white leading-snug tracking-tight">
              Student Information & Certificate Management System
            </h2>
            <p className="text-xs text-blue-100 font-medium leading-relaxed">
              Enterprise-grade academic portal to securely manage student profiles, academic sections, and certificate verification.
            </p>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-center space-x-2.5 text-blue-50 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Student-Centric Certificate Tracking</span>
              </div>
              <div className="flex items-center space-x-2.5 text-blue-50 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Supabase Private Storage PDF Encryption</span>
              </div>
              <div className="flex items-center space-x-2.5 text-blue-50 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>BCrypt & Session Security Protection</span>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div className="relative z-10 text-[11px] text-blue-200 font-mono flex items-center justify-between border-t border-white/20 pt-4">
            <span>© 2026 SICMS System</span>
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enterprise Grade</span>
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center space-y-6 bg-white dark:bg-slate-900">
          
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Enter your credentials to access Admin or Faculty workspace.
            </p>
          </div>

          {/* Inactivity Logout Alert */}
          {isInactiveLoggedOut && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 font-bold flex items-center space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Your session expired due to 1 hour of inactivity. Please log in again.</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Email Input */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address / Username *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. admin@college.edu"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition ${
                    fieldErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Password *
                </label>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition ${
                    fieldErrors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 text-sm mt-2"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign In Section */}
          <div className="space-y-4 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                Or Continue With
              </span>
            </div>

            <div id="googleSignInDiv" className="w-full flex justify-center" />
            
            <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
              Prefer direct login? Use <strong className="text-slate-700 dark:text-slate-200">dhanyaande@gmail.com</strong> with password <strong className="text-slate-700 dark:text-slate-200">AdminPass123!</strong>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
