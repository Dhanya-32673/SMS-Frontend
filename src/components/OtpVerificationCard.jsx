import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft, Check, Lock } from 'lucide-react';

export const OtpVerificationCard = ({
  email = 'user@example.com',
  length = 6,
  onVerify = async (otp) => console.log('Verifying OTP:', otp),
  onResend = async () => console.log('Resending OTP'),
  onBack = null,
  title = "Verify OTP",
  subtitle = null,
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

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullOtp = newValues.join('');
    if (fullOtp.length === length && !newValues.includes('')) {
      handleAutoSubmit(fullOtp);
    }
  };

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fbff] via-[#eef4ff] to-[#e8f1ff] p-4 sm:p-6 relative font-sans overflow-hidden">
      
      {/* Dashboard Style Floating Blur Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Expanded Green Verification Ring on Success */}
      {isSuccess && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          className="absolute w-72 h-72 rounded-full border-4 border-emerald-500/80 pointer-events-none z-0"
        />
      )}

      {/* Admin Dashboard Style Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[560px] w-full bg-white rounded-[32px] border border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-8 sm:p-12 space-y-6 relative z-10"
        style={{ perspective: '1000px' }}
      >
        
        {/* Back Link */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        )}

        {/* Dashboard Branding Header & Enterprise Pill */}
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
          <h1 className="text-3xl sm:text-[42px] leading-tight font-black text-slate-900 tracking-tight">
            {isSuccess ? 'Verified!' : title}
          </h1>
          
          <p className="text-sm sm:text-base text-slate-500 text-center leading-relaxed">
            {subtitle || (
              <>
                Enter the {length}-digit code sent to <br />
                <strong className="text-slate-800 font-bold">{email}</strong>
              </>
            )}
          </p>
        </div>

        {/* Alert Notifications */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs font-semibold"
            >
              <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-xs font-semibold"
            >
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Dashboard OTP Input Boxes Grid (72px x 72px, 20px radius) */}
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
            className="flex justify-center items-center gap-2 sm:gap-3.5"
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
                    className={`w-[50px] h-[50px] sm:w-[72px] sm:h-[72px] rounded-[20px] text-center font-black text-2xl sm:text-3xl transition-all duration-300 outline-none select-none ${
                      isError
                        ? 'bg-white border-2 border-red-500 text-red-600 shadow-[0_0_0_5px_rgba(239,68,68,0.25)]'
                        : isSuccess
                        ? 'bg-white border-2 border-emerald-500 text-emerald-600 shadow-[0_0_0_5px_rgba(16,185,129,0.3)]'
                        : isFocused
                        ? 'bg-white border-2 border-[#2563eb] text-slate-900 shadow-[0_0_0_5px_rgba(37,99,235,0.2)] -translate-y-[2px]'
                        : isFilled
                        ? 'bg-white border-2 border-[#2563eb] text-slate-900 shadow-xs'
                        : 'bg-white border-2 border-[#dbeafe] text-slate-900 hover:border-blue-300'
                    }`}
                  />

                  {/* Blinking Vertical Cursor for Focused Empty Box */}
                  {isFocused && !digit && !loading && !isSuccess && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-[2px] h-[26px] sm:h-[32px] bg-blue-600 rounded-full"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Dashboard CTA Button (64px Height, 18px Radius, Hover Lift & Shine) */}
          <motion.button
            type="submit"
            disabled={loading || isSuccess || otpValues.includes('')}
            whileHover={{ scale: loading || isSuccess ? 1 : 1.02, y: loading || isSuccess ? 0 : -3 }}
            whileTap={{ scale: loading || isSuccess ? 1 : 0.98 }}
            className={`relative w-full h-[64px] rounded-[18px] text-white font-bold text-base sm:text-lg shadow-[0_15px_40px_rgba(37,99,235,0.35)] overflow-hidden transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
              isSuccess
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6]'
            }`}
          >
            {/* Moving Light Shine Hover Effect */}
            <div className="absolute inset-0 -translate-x-full hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

            {isSuccess ? (
              <div className="flex items-center space-x-2">
                <Check className="w-6 h-6 text-white" />
                <span>Verified! Redirecting...</span>
              </div>
            ) : loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
                <span>Verifying...</span>
              </div>
            ) : (
              <span>Verify & Access System</span>
            )}
          </motion.button>

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
                disabled={loading || isSuccess}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline cursor-pointer transition-all duration-200"
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
