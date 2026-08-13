import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import OtpVerificationCard from "../../components/OtpVerificationCard";
import AuthLayout from "../../components/auth/AuthLayout";
import { motion } from "framer-motion";
import { 
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
    <AuthLayout
      title={roleTab === "ADMIN" ? "Admin Portal" : "Faculty Portal"}
      subtitle="Student Information & Certificate Management System"
    >
      <div className="w-full max-w-[460px] mx-auto space-y-6">
        
        {/* Tab Switcher at Top of Card */}
        <div className="bg-[#f1f5f9] rounded-[18px] p-1.5 flex h-[56px] w-full border border-slate-200/80 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => {
              setRoleTab("ADMIN");
              setError("");
              setSuccessMsg("");
            }}
            className={"flex-1 py-2.5 rounded-[14px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer " + (
              roleTab === "ADMIN"
                ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-md font-bold"
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
            className={"flex-1 py-2.5 rounded-[14px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer " + (
              roleTab === "FACULTY"
                ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-md font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <UserCheck className="w-4 h-4" /> Faculty (Direct Login)
          </button>
        </div>

        {/* Center Shield Icon (112px, soft blue circular container with floating Y animation) */}
        <div className="text-center pt-2">
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-[112px] h-[112px] rounded-full bg-[#eff6ff] flex items-center justify-center mx-auto shadow-inner border border-blue-100"
          >
            {roleTab === "ADMIN" ? (
              <ShieldCheck className="w-14 h-14 text-[#2563eb]" />
            ) : (
              <UserCheck className="w-14 h-14 text-[#2563eb]" />
            )}
          </motion.div>

          {/* Page Title & Subtitle */}
          <h2 className="text-3xl sm:text-[36px] font-black text-slate-900 tracking-tight mt-4">
            {roleTab === "ADMIN" ? "Welcome Admin!" : "Welcome Faculty!"}
          </h2>
          <p className="text-slate-500 text-sm font-medium max-w-[340px] mx-auto mt-1">
            {roleTab === "ADMIN" ? "Enter your credentials to receive OTP" : "Enter your credentials to access portal"}
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

        {/* Form Fields (60px Inputs, 18px Radius) */}
        <form className="space-y-4" onSubmit={handleCredentialSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Email Address
            </label>
            <div className={"h-[60px] bg-white border " + (
              fieldErrors.email ? "border-red-500 focus-within:ring-red-500" : "border-slate-200 focus-within:border-[#2563eb] focus-within:ring-4 focus-within:ring-[#2563eb]/15"
            ) + " rounded-[18px] flex items-center px-4.5 gap-3 transition-all duration-200"}>
              <Mail className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                }}
                placeholder="Enter your registered email"
                className="w-full bg-transparent text-slate-900 font-semibold text-sm placeholder-slate-400 focus:outline-none"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Password
            </label>
            <div className={"h-[60px] bg-white border " + (
              fieldErrors.password ? "border-red-500 focus-within:ring-red-500" : "border-slate-200 focus-within:border-[#2563eb] focus-within:ring-4 focus-within:ring-[#2563eb]/15"
            ) + " rounded-[18px] flex items-center px-4.5 gap-3 transition-all duration-200"}>
              <Lock className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                }}
                placeholder="Enter your password"
                className="w-full bg-transparent text-slate-900 font-semibold text-sm placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-end pt-1">
            <Link
              to="/reset-password?mode=faculty"
              className="text-xs font-bold text-[#2563eb] hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary CTA Button (60px Height, 18px Radius, Hover Lift & Shadow) */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -2 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full h-[60px] rounded-[18px] text-white font-bold text-base bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-blue-700 hover:to-blue-600 shadow-[0_15px_35px_rgba(37,99,235,0.28)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
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

        {/* Footer Trust Line */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium gap-2">
          <span>🔒</span>
          <span>Secure • Encrypted • Trusted</span>
        </div>

      </div>
    </AuthLayout>
  );
};

export default Login;
