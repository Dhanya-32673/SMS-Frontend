import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft, Check } from 'lucide-react';

export const OtpVerificationCard = ({
  email = 'user@example.com',
  length = 6,
  onVerify = async (otp) => console.log('Verifying OTP:', otp),
  onResend = async () => console.log('Resending OTP'),
  onBack = null,
}) => {
  const [otpValues, setOtpValues] = useState(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [lastTypedIndex, setLastTypedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Resend Timer
  const [cooldown, setCooldown] = useState(30);

  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 30-Second Countdown Timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle single digit input
  const handleChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal && value !== '') return;

    const newValues = [...otpValues];
    const digit = cleanVal.slice(-1);
    newValues[index] = digit;
    setOtpValues(newValues);
    setIsError(false);
    setErrorMsg('');

    if (digit) {
      setLastTypedIndex(index);
      setTimeout(() => setLastTypedIndex(-1), 500);
    }

    // Auto advance focus to next box
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all digits are entered
    const fullOtp = newValues.join('');
    if (fullOtp.length === length && !newValues.includes('')) {
      handleAutoSubmit(fullOtp);
    }
  };

  // Handle Key Down (Backspace, Arrow keys)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newValues = [...otpValues];
        newValues[index - 1] = '';
        setOtpValues(newValues);
      } else {
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste event across all boxes
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (!pasteData) return;

    const newValues = [...otpValues];
    for (let i = 0; i < pasteData.length; i++) {
      newValues[i] = pasteData[i];
    }
    setOtpValues(newValues);
    setIsError(false);
    setErrorMsg('');

    const nextIdx = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIdx]?.focus();

    if (pasteData.length === length) {
      handleAutoSubmit(pasteData);
    }
  };

  // Auto-submit helper
  const handleAutoSubmit = async (code) => {
    setLoading(true);
    setErrorMsg('');
    try {
      setIsSuccess(true);
      setSuccessMsg('Verification successful! Access granted.');
      await onVerify(code);
    } catch (err) {
      setIsSuccess(false);
      setIsError(true);
      setErrorMsg(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manual Submit
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

  // Handle Resend Click
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-4 relative font-sans overflow-hidden">
      
      {/* Background Soft Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at top, rgba(59,130,246,0.16), transparent 60%)',
        }}
      />

      {/* Expanded Green Verification Ring on Success */}
      {isSuccess && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          className="absolute w-72 h-72 rounded-full border-4 border-emerald-500/80 pointer-events-none z-0"
        />
      )}

      {/* Card Entrance Animation */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 space-y-6 relative z-10"
        style={{ perspective: '1000px' }}
      >
        
        {/* Back Link if provided */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        {/* Security Shield Icon Header */}
        <div className="text-center space-y-3">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            
            {/* Glowing Pulse Ring around Shield */}
            <motion.div
              animate={
                isSuccess
                  ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.4] }
                  : { scale: [1, 1.15, 1], opacity: [0.3, 0.8, 0.3] }
              }
              transition={{ repeat: Infinity, duration: isSuccess ? 1.0 : 2, ease: 'easeInOut' }}
              className={`absolute inset-0 rounded-3xl ${isSuccess ? 'bg-emerald-500/40' : 'bg-blue-600/30'} blur-xl`}
            />

            {/* Rotating Shield Container */}
            <motion.div
              animate={
                isSuccess
                  ? { rotate: 720, scale: [1, 1.25, 0.95, 1], y: [0, -10, 0] }
                  : { rotate: 360, y: [-4, 4, -4] }
              }
              transition={
                isSuccess
                  ? { duration: 1.5, ease: 'easeInOut' }
                  : {
                      rotate: { repeat: Infinity, duration: 3, ease: 'linear' },
                      y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
                    }
              }
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500 ${
                isSuccess
                  ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-emerald-500/50'
                  : 'bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-500 shadow-blue-500/35'
              }`}
              style={{ willChange: 'transform' }}
            >
              {isSuccess ? (
                <Check className="w-8 h-8 text-white stroke-[3]" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-white" />
              )}
            </motion.div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isSuccess ? 'Verified!' : 'Verify OTP'}
          </h1>
          
          <p className="text-base text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            Enter the 6-digit code sent to <br />
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{email}</strong>
          </p>
        </div>

        {/* Alert Notifications */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-3 text-red-700 dark:text-red-300 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* OTP Input Boxes Section with Horizontal Shake on Error */}
          <motion.div
            animate={
              isError
                ? { x: [-8, 8, -6, 6, -4, 4, 0] }
                : isSuccess
                ? { rotateY: [0, 360], scale: [1, 1.08, 1] }
                : {}
            }
            transition={
              isError
                ? { duration: 0.6 }
                : isSuccess
                ? { duration: 1.2, ease: 'easeInOut' }
                : {}
            }
            className="flex justify-center items-center gap-2 sm:gap-3"
            style={{ perspective: '1000px' }}
          >
            {otpValues.map((digit, index) => {
              const isFocused = focusedIndex === index;
              const isFilled = Boolean(digit);
              const isJustTyped = lastTypedIndex === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={
                    isError
                      ? { rotateX: [-15, 15, -10, 10, 0] }
                      : isSuccess
                      ? { scale: [1, 1.12, 1], rotateY: 360 }
                      : isJustTyped
                      ? { rotateX: [0, 180, 360], scale: [0.9, 1.15, 1] }
                      : isFocused
                      ? { scale: 1.08, rotateY: [0, 10, 0] }
                      : { opacity: 1, y: 0, scale: 1, rotateX: 0, rotateY: 0 }
                  }
                  transition={
                    isError
                      ? { duration: 0.5 }
                      : isSuccess
                      ? { duration: 1.0, delay: index * 0.06 }
                      : isJustTyped
                      ? { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
                      : isFocused
                      ? { duration: 0.4 }
                      : { duration: 0.3, delay: index * 0.08 }
                  }
                  className="relative"
                  style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                >
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    aria-label={`Digit ${index + 1}`}
                    aria-invalid={isError}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(-1)}
                    onPaste={handlePaste}
                    disabled={loading || isSuccess}
                    className={`w-[48px] h-[48px] sm:w-[64px] sm:h-[64px] rounded-[16px] text-center font-bold text-xl sm:text-2xl transition-all duration-300 outline-none select-none ${
                      isError
                        ? 'bg-white dark:bg-slate-900 border-2 border-red-500 text-red-600 shadow-[0_0_0_5px_rgba(239,68,68,0.25)]'
                        : isSuccess
                        ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 text-emerald-600 shadow-[0_0_0_5px_rgba(16,185,129,0.3)]'
                        : isFocused
                        ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 text-slate-900 dark:text-white shadow-[0_0_0_5px_rgba(37,99,235,0.2)] -translate-y-[2px]'
                        : isFilled
                        ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 text-slate-900 dark:text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-slate-300'
                    }`}
                  />

                  {/* Blinking Vertical Cursor for Focused Empty Box */}
                  {isFocused && !digit && !loading && !isSuccess && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-[2px] h-[24px] sm:h-[28px] bg-blue-600 rounded-full"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Premium Verification Button */}
          <motion.button
            type="submit"
            disabled={loading || isSuccess || otpValues.includes('')}
            whileHover={{ scale: loading || isSuccess ? 1 : 1.02, y: loading || isSuccess ? 0 : -2 }}
            whileTap={{ scale: loading || isSuccess ? 1 : 0.95 }}
            className={`relative w-full py-4 px-6 rounded-2xl text-white font-bold text-base shadow-xl overflow-hidden transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              isSuccess
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 shadow-blue-500/30'
            }`}
          >
            {/* Moving Light Shine Hover Effect */}
            <div className="absolute inset-0 -translate-x-full hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

            {isSuccess ? (
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-white" />
                <span>Verified! Redirecting...</span>
              </div>
            ) : loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Verifying...</span>
              </div>
            ) : (
              <span>Verify & Continue</span>
            )}
          </motion.button>

          {/* Resend OTP Section */}
          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">Didn't receive the verification code?</p>
            {cooldown > 0 ? (
              <span className="text-xs font-semibold text-slate-400 block transition-opacity duration-300">
                Resend code in <strong className="text-slate-700 dark:text-slate-300 font-bold">{cooldown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || isSuccess}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer transition-all duration-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
            )}
          </div>

        </form>
      </motion.div>

    </div>
  );
};

export default OtpVerificationCard;
