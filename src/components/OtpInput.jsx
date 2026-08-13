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
    <div className="flex justify-center gap-2 sm:gap-2.5 my-2">
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
          className="w-[40px] h-[40px] sm:w-[54px] sm:h-[54px] text-center text-lg sm:text-xl font-black bg-white border-2 border-[#dbeafe] rounded-[14px] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.15)] focus:scale-[1.06] focus:-translate-y-[1px] focus:outline-none transition-all duration-200 text-slate-900 disabled:bg-slate-100"
        />
      ))}
    </div>
  );
};

export default OtpInput;
