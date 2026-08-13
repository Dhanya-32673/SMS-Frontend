import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const OtpVerificationCard = ({
  email = 'user@example.com',
  length = 6,
  onVerify = async (otp) => console.log('Verifying OTP:', otp),
  onResend = async () => console.log('Resending OTP'),
  onBack = null,
}) => {
  const [otpValues, setOtpValues] = useState(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Resend Timer
  const [cooldown, setCooldown] = useState(30);

  const inputRefs = useRef([]);

  // Focus input on mount
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
    // Only numeric input
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal && value !== '') return;

    const newValues = [...otpValues];
    const digit = cleanVal.slice(-1); // Take latest typed digit
    newValues[index] = digit;
    setOtpValues(newValues);
    setIsError(false);
    setErrorMsg('');

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
        // Move to previous box if current is empty
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

    // Focus last pasted or next index
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
      await onVerify(code);
      setIsSuccess(true);
      setSuccessMsg('Verification successful!');
    } catch (err) {
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
      setSuccessMsg('A new 6-digit verification code has been sent.');
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 relative font-sans overflow-hidden">
      
      {/* Background Soft Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at top, rgba(59,130,246,0.14), transparent 55%)',
        }}
      />

      {/* Card Entrance Animation */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10 space-y-6 relative z-10"
      >
        
        {/* Back Link if provided */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        {/* Header Branding Icon & Typography */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Verify OTP
          </h1>
          
          <p className="text-base text-slate-500 text-center leading-relaxed">
            Enter the 6-digit code sent to <br />
            <strong className="text-slate-800 font-semibold">{email}</strong>
          </p>
        </div>

        {/* Alert Notifications */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs font-semibold"
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
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-xs font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* OTP Input Boxes Grid */}
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {otpValues.map((digit, index) => {
              const isFocused = focusedIndex === index;
              const isFilled = Boolean(digit);

              return (
                <motion.div
                  key={index}
                  animate={
                    isError
                      ? { x: [-6, 6, -4, 4, 0] }
                      : isSuccess
                      ? { scale: [1, 1.06, 1] }
                      : isFilled
                      ? { scale: [0.85, 1.12, 1] }
                      : {}
                  }
                  transition={
                    isError
                      ? { duration: 0.4 }
                      : isSuccess
                      ? { duration: 0.35 }
                      : isFilled
                      ? { duration: 0.18, ease: 'easeOut' }
                      : {}
                  }
                  className="relative"
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
                    disabled={loading}
                    className={`w-[48px] h-[48px] sm:w-[64px] sm:h-[64px] rounded-[16px] text-center font-bold text-xl sm:text-2xl transition-all duration-200 outline-none select-none ${
                      isError
                        ? 'bg-white border-2 border-red-500 text-red-600 shadow-[0_0_0_4px_rgba(239,68,68,0.15)]'
                        : isSuccess
                        ? 'bg-white border-2 border-emerald-500 text-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]'
                        : isFocused
                        ? 'bg-white border-2 border-blue-600 text-slate-900 shadow-[0_0_0_4px_rgba(37,99,235,0.15)] scale-105 -translate-y-[2px]'
                        : isFilled
                        ? 'bg-white border border-blue-600 text-slate-900'
                        : 'bg-white border border-slate-200 text-slate-900 hover:border-slate-300'
                    }`}
                  />

                  {/* Blinking Vertical Cursor for Focused Empty Box */}
                  {isFocused && !digit && !loading && (
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
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otpValues.includes('')}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify OTP</span>
            )}
          </button>

          {/* Resend OTP Section */}
          <div className="pt-2 text-center border-t border-slate-100 space-y-2">
            <p className="text-xs text-slate-500">Didn't receive the verification code?</p>
            {cooldown > 0 ? (
              <span className="text-xs font-semibold text-slate-400 block transition-opacity duration-300">
                Resend code in <strong className="text-slate-700 font-bold">{cooldown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-all duration-200"
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
