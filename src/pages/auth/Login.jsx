import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import OtpVerificationCard from "../../components/OtpVerificationCard";
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
        // Admin Login: Credential validation -> OTP dispatch
        const response = await authService.adminLogin(email, password);
        const targetEmail = response.email || email;
        localStorage.setItem("pendingEmail", targetEmail);
        setEmail(targetEmail);
        setStep("OTP");
        setSuccessMsg(response?.message || "OTP sent successfully to " + targetEmail);
      } else {
        // Faculty Login: Direct JWT Login without OTP
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
          {roleTab === "ADMIN" ? "Sign in as Admin" : "Sign in as Faculty"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Student Information & Certificate Management System
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

          {/* ROLE SELECTOR TABS */}
          <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setRoleTab("ADMIN");
                setError("");
                setSuccessMsg("");
              }}
              className={"flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer " + (
                roleTab === "ADMIN"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white"
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
              className={"flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer " + (
                roleTab === "FACULTY"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <UserCheck className="w-4 h-4" /> Faculty (Direct Login)
            </button>
          </div>

          {/* CREDENTIAL FORM */}
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
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                  }}
                  placeholder="Enter your registered email"
                  className={"block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border " + (
                    fieldErrors.email ? "border-rose-500/80 focus:ring-rose-500" : "border-slate-800 focus:ring-blue-500 focus:border-blue-500"
                  ) + " rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all"}
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                  }}
                  placeholder="••••••••"
                  className={"block w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border " + (
                    fieldErrors.password ? "border-rose-500/80 focus:ring-rose-500" : "border-slate-800 focus:ring-blue-500 focus:border-blue-500"
                  ) + " rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all"}
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
                  to="/reset-password?mode=faculty"
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
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/30 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {roleTab === "ADMIN" ? "Send Login OTP" : "Sign in as Faculty"} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
