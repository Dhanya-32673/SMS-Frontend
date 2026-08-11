import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import OtpInput from '../../components/OtpInput';
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
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, verifyOtp, googleLogin, isAuthenticated, user, isInactiveLoggedOut } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

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

  // Step state: 1 = Email & Password, 2 = 4-digit OTP Verification
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');

  // Timers - default to 0 on initial page load (cooldown starts ONLY after OTP is sent)
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [expirySeconds, setExpirySeconds] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Helper to extract dynamic cooldown seconds from backend rate-limit messages
  const parseCooldownSeconds = (msg) => {
    if (!msg) return 0;
    const match = msg.match(/(\d+)\s*(?:second|sec)/i) || msg.match(/wait\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  useEffect(() => {
    let timer;
    if (step === 2 && cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, cooldownSeconds]);

  useEffect(() => {
    let timer;
    if (step === 2 && expirySeconds > 0) {
      timer = setInterval(() => {
        setExpirySeconds((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, expirySeconds]);

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

  const navigateByRole = (roleObj) => {
    let rawRole = '';
    if (typeof roleObj === 'string') rawRole = roleObj;
    else if (roleObj?.roleName) rawRole = roleObj.roleName;
    else if (roleObj?.name) rawRole = roleObj.name;

    const role = (rawRole || '').replace('ROLE_', '').toUpperCase();
    if (role === 'FACULTY') {
      navigate('/faculty/dashboard', { replace: true });
    } else {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  // Step 1: Submit email & password -> Backend sends 4-digit OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) {
      showWarning('Please fill all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);
      if (response) {
        showSuccess(response.message || 'A 4-digit OTP has been sent to your email.');
        setStep(2);
        setOtp('');
        setCooldownSeconds(10);
        setExpirySeconds(300);
      }
    } catch (err) {
      let msg = 'Invalid email or password. Please try again.';
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        msg = 'Server is waking up (Render cold-start). Please wait 5 seconds and click "Send Login OTP" again.';
      } else if (err.message === 'Network Error') {
        msg = 'Server is spinning up, please wait a moment and try again.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      showError(msg);

      const sec = parseCooldownSeconds(msg);
      if (sec > 0 || (msg && (msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('cooldown')))) {
        setStep(2);
        if (sec > 0) setCooldownSeconds(sec);
        setExpirySeconds(300);
      }
    } finally {
      setLoading(false);
    }
  };

  const getActiveEmail = () => {
    const e = formData.email?.trim();
    if (e) {
      localStorage.setItem('last_login_email', e);
      return e;
    }
    return localStorage.getItem('last_login_email') || 'dhanyaande@gmail.com';
  };

  // Step 2: Verify 4-digit OTP
  const handleVerifyOtp = async (codeToVerify = otp) => {
    if (loading) return;

    if (!codeToVerify || codeToVerify.length !== 4) {
      setError('Please enter all 4 digits of the OTP.');
      showWarning('Please enter all 4 digits of the OTP.');
      return;
    }

    setLoading(true);
    setError('');

    const targetEmail = getActiveEmail();

    try {
      const response = await verifyOtp(targetEmail, codeToVerify);
      showSuccess('OTP verified successfully. Login successful!');
      setCooldownSeconds(0);
      setExpirySeconds(0);
      
      navigateByRole(response?.user?.role);
    } catch (err) {
      let msg = 'Invalid or expired OTP code.';
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        msg = 'Network timeout while verifying OTP. Please try again.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldownSeconds > 0 || loading) return;

    setLoading(true);
    setError('');

    const targetEmail = getActiveEmail();

    try {
      await authService.resendOtp(targetEmail);
      setOtp('');
      setCooldownSeconds(30);
      setExpirySeconds(300);
      showSuccess('A new 4-digit OTP has been sent to your email.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP.';
      setError(msg);
      showError(msg);

      const sec = parseCooldownSeconds(msg);
      if (sec > 0) {
        setCooldownSeconds(sec);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      setLoading(true);
      setError('');
      const res = await googleLogin(response.credential);
      if (res) {
        if (res.email) {
          setFormData((prev) => ({ ...prev, email: res.email }));
        }
        showSuccess(res.message || 'A 4-digit OTP has been sent to your email.');
        setStep(2);
        setOtp('');
        setCooldownSeconds(30);
        setExpirySeconds(300);
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      const msg = err.response?.data?.message || err.message || 'Google authentication failed.';
      setError(msg);
      showError(msg);

      const sec = parseCooldownSeconds(msg);
      if (sec > 0) {
        setStep(2);
        setCooldownSeconds(sec);
      }
    } finally {
      setLoading(false);
    }
  };

  const googleInitializedRef = useRef(false);

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isPlaceholder = !googleClientId || googleClientId.includes('YOUR_GOOGLE_CLIENT_ID');

    const initGoogleAuth = () => {
      if (window.google?.accounts?.id && !isPlaceholder) {
        try {
          if (!window._googleAuthInitialized) {
            window.google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleGoogleSuccess,
              auto_select: false,
              cancel_on_tap_outside: true,
            });
            window._googleAuthInitialized = true;
            googleInitializedRef.current = true;
          }
          const targetDiv = document.getElementById("googleSignInDiv");
          if (targetDiv && targetDiv.children.length === 0) {
            window.google.accounts.id.renderButton(
              targetDiv,
              { theme: "outline", size: "large", width: 360, shape: "pill" }
            );
          }
        } catch (err) {
          console.warn('Google Auth init warning:', err);
        }
      }
    };

    initGoogleAuth();
    const timer = setTimeout(initGoogleAuth, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Branding Panel: Enterprise Blue Gradient */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-24 h-24 rounded-3xl bg-white p-2.5 shadow-xl flex items-center justify-center border-2 border-white/30 shrink-0">
              <img
                src="/clglogo.jpg"
                alt="College Logo"
                className="w-full h-full object-contain rounded-2xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-blue-600 font-extrabold text-2xl">SICMS</div>';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider uppercase leading-tight drop-shadow-sm">
                SICMS PORTAL
              </h1>
              <p className="text-[11px] font-bold text-blue-100 tracking-wide">
                Student & Certificate Management
              </p>
            </div>
          </div>

          {/* Value Highlights */}
          <div className="relative z-10 my-8 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-100">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Multi-Factor OTP Security</span>
            </div>
            <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-white">
              Authorized Academic Access Center
            </h2>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Secure 2-Step OTP Authentication for College Administrators and Faculty Members.
            </p>

            <div className="pt-4 space-y-2.5 text-xs font-medium text-blue-100">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>4-Digit Email OTP Authentication</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Role-Based Access Control (Admin & Faculty)</span>
              </div>
              <div className="flex items-center space-x-2.5">
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
          
          {/* STEP 1: CREDENTIAL FORM */}
          {step === 1 ? (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Sign In to Your Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Enter your credentials to receive a 4-digit OTP on your registered email.
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
                      <span>Validating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Login OTP</span>
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

                <div id="googleSignInDiv" className="w-full flex justify-center empty:hidden" />
                
                {/* Fallback Google Sign-In Button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleGoogleSuccess({ credential: 'test-google-token' })}
                    className="w-full max-w-[360px] flex items-center justify-center space-x-3 px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
                
                <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                  Prefer direct login? Use <strong className="text-slate-700 dark:text-slate-200">dhanyaande@gmail.com</strong> with password <strong className="text-slate-700 dark:text-slate-200">AdminPass123!</strong>
                </p>
              </div>
            </>
          ) : (
            /* STEP 2: 4-DIGIT OTP VERIFICATION SCREEN */
            <div className="space-y-6 animate-fadeIn">
              
              {/* Back to Login Link */}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                  setCooldownSeconds(0);
                  setExpirySeconds(0);
                }}
                className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change Email / Back to Login</span>
              </button>

              {/* Header */}
              <div className="space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-3">
                  <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Verify Login OTP
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  A 4-digit OTP has been sent to your email.
                </p>
                <div className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-950/60 rounded-full border border-blue-200 dark:border-blue-800/60 text-xs font-bold text-blue-700 dark:text-blue-300 mt-1">
                  {getActiveEmail()}
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center space-x-2.5 animate-fadeIn">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 4-Digit OTP Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyOtp(otp);
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Enter 4-Digit Verification Code
                  </label>
                  <OtpInput
                    length={4}
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      if (val.length === 4) {
                        handleVerifyOtp(val);
                      }
                    }}
                    disabled={loading}
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2 mt-2 font-medium">
                    <span>Valid for 5 minutes</span>
                    <span>
                      Expires in: <strong className="text-blue-600 dark:text-blue-400 font-bold">
                        {Math.floor(expirySeconds / 60)}:{(expirySeconds % 60).toString().padStart(2, '0')}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 4}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 text-sm"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Login</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend Section */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Didn't receive the code?
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldownSeconds > 0 || loading}
                  className="inline-flex items-center space-x-1.5 font-extrabold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {cooldownSeconds > 0
                      ? `Resend OTP in ${cooldownSeconds}s`
                      : 'Resend OTP'}
                  </span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
