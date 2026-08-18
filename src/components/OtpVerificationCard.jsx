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
  Check,
  Lock
} from 'lucide-react';
import AuthLayout from './auth/AuthLayout';

/**
 * Enterprise-Grade OTP Verification Component
 * Features:
 * - 360° continuously rotating floating security shield with 2s glow pulse
 * - Sequential staggered entrance animation for OTP input boxes
 * - Click focus 3D wobble: rotateY(0deg -> 10deg -> 0deg) + 1.08 scale + brand blue glow
 * - Custom blinking cursor for active empty boxes
 * - 3D Card-Flip digit entry: rotateX(0deg -> 180deg -> 360deg) + scale(0.9 -> 1.15 -> 1.0) + glow burst
 * - Error state: horizontal shake translateX(-8px -> 8px -> -6px -> 6px -> 0) + red glow + digit shake
 * - Success state: 360° sync rotateY + 720° shield celebration spin + expanding green verification ring
 * - Primary CTA with moving light shine, scale hover/active, and 1s continuous spinner
 * - Resend countdown with 30s timer & aria accessibility
 */
export const OtpVerificationCard = ({
  email = '',
  length = 6,
  onVerify,
  onResend,
  onBack,
  title = 'Security Verification',
  subtitle = 'Enter the one-time verification code'
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
    }, 250);
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
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-[480px] mx-auto space-y-5 my-auto relative z-10 px-1 sm:px-0 font-sans"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        
        {/* Back Link */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        )}

        {/* Security Shield Icon Section */}
        <div className="text-center pt-1 relative">
          
          {/* Blue/Green Glow Pulse (Every 2s) */}
          <motion.div
            animate={
              isSuccess
                ? { scale: [1, 1.45, 1], opacity: [0.6, 1, 0.4] }
                : { scale: [1, 1.25, 1], opacity: [0.25, 0.75, 0.25] }
            }
            transition={{ repeat: Infinity, duration: isSuccess ? 1.0 : 2, ease: 'easeInOut' }}
            className={`absolute top-1 left-1/2 -translate-x-1/2 w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] rounded-full ${
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
            className={`w-[80px] h-[80px] sm:w-[88px] sm:h-[88px] rounded-full flex items-center justify-center mx-auto shadow-xl transition-colors duration-500 relative z-10 ${
              isSuccess
                ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-emerald-500/40 text-white'
                : 'bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-500 shadow-blue-500/35 text-white'
            }`}
            style={{ willChange: 'transform' }}
          >
            {isSuccess ? (
              <Check className="w-9 h-9 sm:w-10 sm:h-10 text-white stroke-[3]" />
            ) : (
              <ShieldCheck className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
            )}
          </motion.div>

          {/* Heading (36px Bold) & Subtitle (16px) */}
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-slate-900 dark:text-white tracking-tight mt-3">
            {isSuccess ? "Verified!" : "Enter Security Code"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium max-w-sm mx-auto mt-1">
            Enter the {length}-digit security verification code sent to
          </p>
          <div className="inline-block mt-2 px-3.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs sm:text-sm rounded-full border border-blue-200/60 dark:border-blue-800/60 max-w-full truncate">
            {email || "your registered email"}
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-snug">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Input Section (With 3D Digit Flip, Sequential Stagger, and Horizontal Error Shake) */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            animate={
              isError
                ? { x: [-8, 8, -6, 6, -3, 3, 0] }
                : isSuccess
                ? { rotateY: [0, 360], scale: [1, 1.06, 1] }
                : {}
            }
            transition={{ duration: isError ? 0.6 : isSuccess ? 0.8 : 0.4 }}
            className="flex items-center justify-center gap-2 sm:gap-3.5 my-2"
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
                    scale: flipped ? [0.85, 1.12, 1.0] : active ? 1.08 : 1,
                    y: active ? -2 : 0,
                  }}
                  transition={{
                    duration: flipped ? 0.5 : wobbling ? 0.4 : isError ? 0.6 : 0.35,
                    delay: flipped || wobbling || isError ? 0 : index * 0.08,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="relative group"
                  style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                >
                  {/* Glow Burst on Digit Entry */}
                  {glowing && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.9 }}
                      animate={{ scale: 1.45, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-[16px] bg-blue-500/40 blur-md pointer-events-none"
                    />
                  )}

                  {/* Centered Blinking Cursor for Active Empty Box */}
                  {active && !filled && !loading && !isSuccess && (
                    <motion.div
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[28px] bg-blue-600 dark:bg-blue-400 rounded-full pointer-events-none z-10"
                    />
                  )}

                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    aria-label={`Digit ${index + 1} of ${length}`}
                    aria-invalid={isError}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    value={otpValues[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={() => handleBoxFocus(index)}
                    onPaste={handlePaste}
                    disabled={loading || isSuccess}
                    className={`w-12 h-14 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-white dark:bg-slate-900 rounded-[16px] border-2 transition-all duration-200 outline-none caret-transparent select-none ${
                      isError
                        ? 'border-red-500 text-red-600 bg-red-50/20 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]'
                        : isSuccess
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]'
                        : active
                        ? 'border-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.15)] text-slate-900 dark:text-white bg-blue-50/10'
                        : filled
                        ? 'border-blue-600 text-slate-900 dark:text-white bg-blue-50/15'
                        : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-slate-300'
                    }`}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Resend Code Timer Section */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
            <span>Didn't receive the code?</span>
            {cooldown > 0 ? (
              <span className="flex items-center gap-1 text-slate-400 font-mono" aria-live="polite">
                <Clock className="w-3.5 h-3.5" />
                Resend in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 min-h-[32px]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend OTP</span>
              </button>
            )}
          </div>

          {/* Primary CTA Button with Moving Light Shine Hover Effect */}
          <motion.button
            type="submit"
            disabled={loading || otpValues.includes('') || isSuccess}
            whileHover={{ scale: loading || otpValues.includes('') ? 1 : 1.02, y: loading || otpValues.includes('') ? 0 : -1 }}
            whileTap={{ scale: loading || otpValues.includes('') ? 1 : 0.98 }}
            className={`relative overflow-hidden w-full h-[52px] rounded-xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-blue-500/25'
            }`}
          >
            {/* Moving Light Shine Hover Effect */}
            <div className="absolute inset-0 -translate-x-full hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ animationDuration: '1s' }} />
                <span>Verifying...</span>
              </div>
            ) : isSuccess ? (
              <span>Verification Successful!</span>
            ) : (
              <>
                <span>Verify & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Trust Line */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-semibold gap-1.5">
          <Lock className="w-3.5 h-3.5 text-blue-500" />
          <span>256-Bit Bank Grade Encryption • Secure Session</span>
        </div>

      </motion.div>
    </AuthLayout>
  );
};

export default OtpVerificationCard;
