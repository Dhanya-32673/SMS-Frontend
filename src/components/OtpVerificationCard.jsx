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
  length = 4,
  onVerify,
  onResend,
  onBack,
  title = 'Admin Security Verification',
  subtitle = 'Student Information & Certificate Management System'
}) => {
  const [otpValues, setOtpValues] = useState(Array(length).fill(''));
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [clickWobbleIndex, setClickWobbleIndex] = useState(null);
  const [isFlipped, setIsFlipped] = useState(Array(length).fill(false));
  const [glowBurstIndex, setGlowBurstIndex] = useState(null);
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

  const handleBoxFocus = (index) => {
    setActiveBoxIndex(index);
    setClickWobbleIndex(index);
    setTimeout(() => setClickWobbleIndex(null), 400);
  };

  const triggerCardFlip = (index) => {
    setIsFlipped((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setGlowBurstIndex(index);
    
    setTimeout(() => {
      setIsFlipped((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
      setGlowBurstIndex(null);
    }, 500);
  };

  const handleInputChange = (index, value) => {
    // Only accept numeric digits
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
    setErrorMsg('');

    // Trigger flip for each pasted box sequentially
    for (let i = 0; i < pastedData.length; i++) {
      triggerCardFlip(i);
    }

    if (pastedData.length === length) {
      handleAutoSubmit(pastedData);
    } else {
      const nextIndex = Math.min(pastedData.length, length - 1);
      setActiveBoxIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleAutoSubmit = async (code) => {
    if (loading) return;
    setLoading(true);
    setErrorMsg('');
    setIsError(false);

    try {
      if (onVerify) {
        await onVerify(code);
      }
      setIsSuccess(true);
      setSuccessMsg('Verification successful! Redirecting...');
    } catch (err) {
      setIsError(true);
      setIsSuccess(false);
      const msg = err.response?.data?.message || err.customMessage || err.message || 'Invalid or expired OTP code. Please try again.';
      setErrorMsg(msg);
      setOtpValues(Array(length).fill(''));
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
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
      if (onResend) {
        await onResend();
      }
      setCooldown(30);
      setOtpValues(Array(length).fill(''));
      setIsError(false);
      setIsSuccess(false);
      setSuccessMsg('A new verification code has been sent to your email.');
      inputRefs.current[0]?.focus();
    } catch (err) {
      const msg = err.response?.data?.message || err.customMessage || err.message || 'Failed to resend verification code.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      
      {/* Expanding Green Verification Ring on Success */}
      {isSuccess && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3.5, opacity: 0 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="absolute w-72 h-72 rounded-full border-4 border-emerald-500/80 pointer-events-none z-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      )}

      {/* Main OTP Card with Fade-in and Slide Upward */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] mx-auto space-y-4 my-auto relative z-10 px-1 sm:px-0"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        
        {/* Back Link */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        )}

        {/* Security Shield Icon Section */}
        <div className="text-center pt-0.5 relative">
          
          {/* Blue/Green Glow Pulse (Every 2s) */}
          <motion.div
            animate={
              isSuccess
                ? { scale: [1, 1.45, 1], opacity: [0.6, 1, 0.4] }
                : { scale: [1, 1.25, 1], opacity: [0.25, 0.75, 0.25] }
            }
            transition={{ repeat: Infinity, duration: isSuccess ? 1.0 : 2, ease: 'easeInOut' }}
            className={`absolute top-0.5 left-1/2 -translate-x-1/2 w-[84px] h-[84px] sm:w-[92px] sm:h-[92px] rounded-full ${
              isSuccess ? 'bg-emerald-500/40' : 'bg-blue-600/30'
            } blur-xl pointer-events-none`}
          />

          {/* Security Shield with Continuous 360° Rotation every 4s, Floating Y, and 720° Spin on Success */}
          <motion.div
            animate={
              isSuccess
                ? { rotate: 720, scale: [1, 1.25, 0.95, 1], y: [0, -12, 0] }
                : { rotate: 360, y: [-5, 5, -5] }
            }
            transition={
              isSuccess
                ? { duration: 1.4, ease: 'easeInOut' }
                : {
                    rotate: { repeat: Infinity, duration: 4, ease: 'linear' },
                    y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
                  }
            }
            className={`w-[80px] h-[80px] sm:w-[86px] sm:h-[86px] rounded-full flex items-center justify-center mx-auto shadow-lg transition-colors duration-500 relative z-10 ${
              isSuccess
                ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-emerald-500/40 text-white'
                : 'bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] shadow-blue-500/30 text-white'
            }`}
            style={{ willChange: 'transform' }}
          >
            {isSuccess ? (
              <Check className="w-8 h-8 sm:w-9 sm:h-9 text-white stroke-[3]" />
            ) : (
              <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
            )}
          </motion.div>

          {/* Page Title & Subtitle */}
          <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight mt-2.5">
            {isSuccess ? "Verified!" : "Enter Security Code"}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-[320px] mx-auto mt-0.5">
            Enter the {length}-digit security code sent to your registered email
          </p>
          <div className="inline-block mt-1.5 px-3 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded-full border border-blue-200/60 max-w-full truncate">
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
              className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-snug">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Input Section (With 3D Digit Flip, Sequential Stagger, and Horizontal Error Shake) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            animate={
              isError
                ? { x: [-8, 8, -6, 6, -3, 3, 0] }
                : isSuccess
                ? { rotateY: [0, 360], scale: [1, 1.05, 1] }
                : {}
            }
            transition={{ duration: isError ? 0.6 : isSuccess ? 0.8 : 0.4 }}
            className="flex items-center justify-center gap-2 sm:gap-3 my-2"
            style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          >
            {Array.from({ length }).map((_, index) => {
              const flipped = isFlipped[index];
              const wobbling = clickWobbleIndex === index;
              const active = activeBoxIndex === index;
              const filled = Boolean(otpValues[index]);
              const glowing = glowBurstIndex === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    rotateX: flipped ? [0, 180, 360] : isError ? [-10, 10, -5, 5, 0] : 0,
                    rotateY: wobbling ? [0, 10, 0] : 0,
                    scale: flipped ? [0.9, 1.15, 1.0] : active ? 1.08 : 1,
                    y: active ? -2 : 0,
                  }}
                  transition={{
                    duration: flipped ? 0.5 : wobbling ? 0.4 : isError ? 0.6 : 0.35,
                    delay: flipped || wobbling || isError ? 0 : index * 0.08,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="relative"
                  style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                >
                  {/* Glow Burst on Digit Entry */}
                  {glowing && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-[14px] bg-blue-500/40 blur-md pointer-events-none"
                    />
                  )}

                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    value={otpValues[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={() => handleBoxFocus(index)}
                    onPaste={handlePaste}
                    disabled={loading || isSuccess}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black bg-white rounded-[14px] border-2 transition-all duration-300 outline-none caret-[#2563eb] ${
                      isError
                        ? 'border-red-500 text-red-600 bg-red-50/20 shadow-[0_0_0_4px_rgba(239,68,68,0.22)]'
                        : isSuccess
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20 shadow-[0_0_0_4px_rgba(16,185,129,0.22)]'
                        : active
                        ? 'border-[#2563eb] shadow-[0_0_0_4px_rgba(37,99,235,0.2)] text-slate-900 bg-blue-50/10'
                        : filled
                        ? 'border-blue-400 text-slate-900 bg-blue-50/15'
                        : 'border-[#dbeafe] text-slate-900 hover:border-blue-200'
                    }`}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Resend Code Timer Section */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-0.5">
            <span>Didn't receive the code?</span>
            {cooldown > 0 ? (
              <span className="flex items-center gap-1 text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                Resend in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-[#2563eb] font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resend Code
              </button>
            )}
          </div>

          {/* Primary CTA Button with Moving Shine Hover Effect */}
          <motion.button
            type="submit"
            disabled={loading || otpValues.includes('') || isSuccess}
            whileHover={{ scale: loading || otpValues.includes('') ? 1 : 1.02, y: loading || otpValues.includes('') ? 0 : -2 }}
            whileTap={{ scale: loading || otpValues.includes('') ? 1 : 0.95 }}
            className={`relative overflow-hidden w-full h-[52px] rounded-[14px] font-bold text-xs sm:text-sm shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white hover:from-blue-700 hover:to-blue-600'
            }`}
          >
            {/* Moving Light Shine Hover Effect */}
            <div className="absolute inset-0 -translate-x-full hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: '1s' }} />
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
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center text-slate-400 text-[11px] font-bold gap-1.5">
          <span>🔒</span>
          <span>Secure • Encrypted • Trusted</span>
        </div>

      </motion.div>
    </AuthLayout>
  );
};

export default OtpVerificationCard;
