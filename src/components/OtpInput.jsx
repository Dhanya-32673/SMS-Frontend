import React, { useRef, useEffect } from 'react';

const OtpInput = ({ value = '', onChange, length = 6, disabled = false }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const otpArray = value.padEnd(length, '').split('').slice(0, length);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otpArray];
    newOtp[index] = val;
    const combined = newOtp.join('').trim();
    onChange(combined);

    // Auto-focus next box
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otpArray[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const nextFocus = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3 my-4">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otpArray[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-11 h-13 sm:w-13 sm:h-15 text-center text-2xl font-bold bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-sm text-slate-800 disabled:bg-slate-100"
        />
      ))}
    </div>
  );
};

export default OtpInput;
