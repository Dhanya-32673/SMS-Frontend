import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowRight,
  Check
} from 'lucide-react';
import AuthLayout from './auth/AuthLayout';

export const OtpVerificationCard = ({
  email = '',
  length = 6,
  onVerify,
  onResend,
  onBack,
  title = 'Admin Verification',
  subtitle = 'Security Verification Suite'
}) => {
  const [otpValues, setOtpValues] = useState(Array(length).fill(''));
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(Array(length).fill(false));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(30);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const inputRefs = useRef([]);

  // Auto focus first box on mount
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, [length]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const triggerCardFlip = (index) => {
    setIsFlipped((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setTimeout(() => {
      setIsFlipped((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }, 400);
  };

  const handleInputChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    setIsError(false);
    setErrorMsg('');

    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);

    if (value) {
      triggerCardFlip(index);
      if (index < length - 1) {
        setActiveBoxIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Auto submit when all digits filled
    const fullCode = newValues.join('');
    if (fullCode.length === length && !newValues.includes('')) {
      handleAutoSubmit(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        setActiveBoxIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveBoxIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveBoxIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    const newValues = Array(length).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newValues[i] = pastedData[i];
    }
    setOtpValues(newValues);
    setIsError(false);

    if (pastedData.length === length) {
      handleAutoSubmit(pastedData);
    } else {
      const nextIndex = Math.min(pastedData.length, length - 1);
      setActiveBoxIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleAutoSubmit = async (code) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await onVerify(code);
      setIsSuccess(true);
      setSuccessMsg('Verification successful! Redirecting...');
    } catch (err) {
      setIsError(true);
      setErrorMsg(err.message || err.response?.data?.message || 'Invalid OTP code. Please try again.');
      setOtpValues(Array(length).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length !== length || otpValues.includes('')) {
      setIsError(true);
      setErrorMsg(`Please enter all ${length} digits of the verification code.`);
      return;
    }
    handleAutoSubmit(fullOtp);
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await onResend();
      setCooldown(30);
      setOtpValues(Array(length).fill(''));
      setIsError(false);
      setIsSuccess(false);
      setSuccessMsg('A new verification code has been sent.');
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <div className="w-full max-w-[430px] mx-auto space-y-4 my-auto">
        
        {/* Back Link */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        )}

        {/* Center Shield Icon (Size 84px, Icon 38px, Floating Y Animation) */}
        <div className="text-center pt-1">
          <motion.div
            animate={
              isSuccess
                ? { scale: [1, 1.15, 1] }
                : { y: [-4, 4, -4] }
            }
            transition={{ repeat: Infinity, duration: isSuccess ? 1.0 : 4, ease: "easeInOut" }}
            className={`w-[84px] h-[84px] rounded-full flex items-center justify-center mx-auto shadow-inner border transition-colors duration-500 ${
              isSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-[#eff6ff] border-blue-100 text-[#2563eb]'
            }`}
          >
            {isSuccess ? (
              <Check className="w-9 h-9 text-emerald-600 stroke-[3]" />
            ) : (
              <ShieldCheck className="w-9 h-9 text-[#2563eb]" />
            )}
          </motion.div>

          {/* Page Title & Subtitle */}
          <h2 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight mt-2.5">
            {isSuccess ? "Verified!" : "Verify OTP Code"}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-[320px] mx-auto mt-0.5">
            Enter the {length}-digit security code sent to
          </p>
          <div className="inline-block mt-1 px-3 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded-full border border-blue-200/60">
            {email || "your email"}
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Input Boxes (54px Size, 14px Radius, 3D Flip on Entry, 10px Gap) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-1">
            {Array.from({ length }).map((_, index) => (
              <motion.div
                key={index}
                animate={{
                  rotateX: isFlipped[index] ? 360 : 0,
                  scale: activeBoxIndex === index ? 1.06 : 1,
                  y: activeBoxIndex === index ? -1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otpValues[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setActiveBoxIndex(index)}
                  onPaste={handlePaste}
                  disabled={loading || isSuccess}
                  className={`w-[40px] h-[40px] sm:w-[54px] sm:h-[54px] text-center text-lg sm:text-xl font-black bg-white rounded-[14px] border-2 transition-all duration-200 outline-none ${
                    isError
                      ? 'border-red-500 text-red-600 bg-red-50/20'
                      : isSuccess
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20'
                      : activeBoxIndex === index
                      ? 'border-[#2563eb] shadow-[0_0_0_4px_rgba(37,99,235,0.15)] text-slate-900'
                      : otpValues[index]
                      ? 'border-blue-400 text-slate-900'
                      : 'border-[#dbeafe] text-slate-900'
                  }`}
                />
              </motion.div>
            ))}
          </div>

          {/* Resend Code Timer Section */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-0.5">
            <span>Didn't receive the code?</span>
            {cooldown > 0 ? (
              <span className="flex items-center gap-1 text-slate-400 font-mono">
                <Clock className="w-3 h-3" />
                Resend in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-[#2563eb] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Resend Code
              </button>
            )}
          </div>

          {/* Primary CTA Button (Height 52px, Radius 14px, Font size 14px) */}
          <motion.button
            type="submit"
            disabled={loading || otpValues.includes('')}
            whileHover={{ scale: loading || otpValues.includes('') ? 1 : 1.01, y: loading || otpValues.includes('') ? 0 : -2 }}
            whileTap={{ scale: loading || otpValues.includes('') ? 1 : 0.98 }}
            className={`w-full h-[52px] rounded-[14px] font-bold text-sm shadow-[0_12px_28px_rgba(37,99,235,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white hover:from-blue-700 hover:to-blue-600'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSuccess ? (
              <span>Verification Successful!</span>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Trust Line */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center text-slate-400 text-[11px] font-bold gap-1.5">
          <span>🔒</span>
          <span>Secure • Encrypted • Trusted</span>
        </div>

      </div>
    </AuthLayout>
  );
};

export default OtpVerificationCard;
