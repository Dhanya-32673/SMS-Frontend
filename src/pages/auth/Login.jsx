import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import OtpVerificationCard from "../../components/OtpVerificationCard";
import { motion } from "framer-motion";
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
  UserCheck
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isInactiveLoggedOut } = useAuth();

  // Selected Role Tab: "ADMIN" | "FACULTY"
  const [roleTab, setRoleTab] = useState("ADMIN");

  // Authentication Flow State: "LOGIN" | "OTP"
  const [step, setStep] = useState("LOGIN");
  
  // Credentials & OTP inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      let rawRole = "";
      if (typeof user.role === "string") rawRole = user.role;
      else if (user.role?.roleName) rawRole = user.role.roleName;
      else if (user.role?.name) rawRole = user.role.name;

      const role = rawRole.replace("ROLE_", "").toUpperCase();
      if (role === "FACULTY") {
        navigate("/faculty/dashboard", { replace: true });
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validateCredentials = () => {
    const errors = {};
    if (!email) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // STEP 1: Submit Credentials
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    if (!validateCredentials()) return;

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (roleTab === "ADMIN") {
        const response = await authService.adminLogin(email, password);
        const targetEmail = response.email || email;
        localStorage.setItem("pendingEmail", targetEmail);
        setEmail(targetEmail);
        setStep("OTP");
        setSuccessMsg(response?.message || "OTP sent successfully to " + targetEmail);
      } else {
        await authService.facultyLogin(email, password);
        setSuccessMsg("Faculty login successful. Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/faculty/dashboard";
        }, 300);
      }
    } catch (err) {
      let msg = "Invalid credentials or access denied";
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

  const handleBackToLogin = () => {
    setStep("LOGIN");
    setError("");
    setSuccessMsg("");
    localStorage.removeItem("pendingEmail");
  };

  // Render Premium OTP Verification Card when Admin submits credentials
  if (step === "OTP") {
    const targetEmail = email || localStorage.getItem("pendingEmail") || "your email";
    return (
      <OtpVerificationCard
        email={targetEmail}
        length={4}
        title="Admin Verification"
        onVerify={async (code) => {
          await authService.verifyAdminOtp(targetEmail, code);
          localStorage.removeItem("pendingEmail");
          await new Promise((resolve) => setTimeout(resolve, 3000));
          window.location.href = "/admin/dashboard";
        }}
        onResend={async () => {
          await authService.resendOtp(targetEmail);
        }}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fbff] via-[#eef4ff] to-[#e8f1ff] p-4 sm:p-6 relative font-sans overflow-hidden">
      {/* Dashboard Style Floating Blur Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[560px] w-full bg-white rounded-[32px] border border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-8 sm:p-12 space-y-6 relative z-10"
      >
        {/* Top Header Section */}
        <div className="text-center space-y-3">
          
          {/* Top Enterprise Security Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-blue-50 text-blue-700 font-extrabold uppercase tracking-widest text-[11px] rounded-full border border-blue-200/60 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>ENTERPRISE SECURITY</span>
          </div>

          {/* Bhashyam Educational Institution Logo Header */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="bg-[#2563eb] rounded-2xl p-3.5 px-6 shadow-xl shadow-blue-500/25 border border-blue-500/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md shrink-0">
                <img
                  src="https://ookzjdmkoaunbrufvmvq.supabase.co/storage/v1/object/public/student-profile-photos/info/ChatGPT%20Image%20Aug%206,%202026,%2012_07_23%20AM.png"
                  alt="Bhashyam Educational Institution"
                  className="w-full h-full object-contain"
                  loading="eager"
                  onError={(e) => {
                    e.target.classList.add('hidden');
                    if (e.target.nextSibling) e.target.nextSibling.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full rounded-lg bg-blue-50 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-blue-600" />
                </div>
              </div>
              <div className="text-left">
                <span className="font-black text-white text-2xl tracking-wider block leading-none">BHASHYAM</span>
                <span className="text-[10px] text-blue-100 font-extrabold uppercase tracking-widest block mt-1">EDUCATIONAL INSTITUTION</span>
              </div>
            </div>
          </div>

          {/* 42px Dashboard Typography */}
          <h1 className="text-3xl sm:text-[42px] leading-tight font-black text-slate-900 tracking-tight pt-2">
            {roleTab === "ADMIN" ? "Admin Portal" : "Faculty Portal"}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 text-center leading-relaxed">
            Student Information & Certificate Management System
          </p>
        </div>

        {/* Notifications */}
        {isInactiveLoggedOut && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-700 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <span>You were logged out due to inactivity for security reasons. Please log in again.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dashboard Role Selector Toggle Container */}
        <div className="flex bg-slate-100 p-1.5 rounded-[18px] border border-slate-200/80 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => {
              setRoleTab("ADMIN");
              setError("");
              setSuccessMsg("");
            }}
            className={"flex-1 py-3 rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer " + (
              roleTab === "ADMIN"
                ? "bg-white text-blue-600 shadow-md shadow-blue-500/10 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <ShieldCheck className="w-4 h-4" /> Admin (OTP Required)
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleTab("FACULTY");
              setError("");
              setSuccessMsg("");
            }}
            className={"flex-1 py-3 rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer " + (
              roleTab === "FACULTY"
                ? "bg-white text-blue-600 shadow-md shadow-blue-500/10 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <UserCheck className="w-4 h-4" /> Faculty (Direct Login)
          </button>
        </div>

        {/* Credentials Form (64px Inputs, 18px Radius) */}
        <form className="space-y-5" onSubmit={handleCredentialSubmit}>
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                }}
                placeholder="Enter your registered email"
                className={"block w-full pl-12 pr-4 h-[64px] bg-white border-2 " + (
                  fieldErrors.email ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-blue-600 focus:shadow-[0_0_0_5px_rgba(37,99,235,0.15)]"
                ) + " rounded-[18px] text-slate-900 font-semibold text-sm placeholder-slate-400 focus:outline-none transition-all duration-200"}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                }}
                placeholder="••••••••"
                className={"block w-full pl-12 pr-12 h-[64px] bg-white border-2 " + (
                  fieldErrors.password ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-blue-600 focus:shadow-[0_0_0_5px_rgba(37,99,235,0.15)]"
                ) + " rounded-[18px] text-slate-900 font-semibold text-sm placeholder-slate-400 focus:outline-none transition-all duration-200"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/reset-password?mode=faculty"
              className="text-xs font-bold text-blue-600 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Dashboard CTA Button (64px Height, 18px Radius, Hover Lift & Shine) */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -3 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="relative w-full h-[64px] rounded-[18px] text-white font-bold text-base sm:text-lg bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-blue-700 hover:to-blue-600 shadow-[0_15px_40px_rgba(37,99,235,0.35)] overflow-hidden transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {/* Moving Light Shine Hover Effect */}
            <div className="absolute inset-0 -translate-x-full hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{roleTab === "ADMIN" ? "Send Login OTP" : "Sign in as Faculty"}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
