import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const OtpInput = ({ value = '', onChange, length = 6, disabled = false, isError = false }) => {
  const inputRefs = useRef([]);
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [clickWobbleIndex, setClickWobbleIndex] = useState(null);
  const [flippedIndices, setFlippedIndices] = useState(Array(length).fill(false));

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const otpArray = value.padEnd(length, '').split('').slice(0, length);

  const triggerCardFlip = (index) => {
    setFlippedIndices((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setTimeout(() => {
      setFlippedIndices((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }, 500);
  };

  const handleBoxFocus = (index) => {
    setActiveBoxIndex(index);
    setClickWobbleIndex(index);
    setTimeout(() => setClickWobbleIndex(null), 400);
  };

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otpArray];
    newOtp[index] = val;
    const combined = newOtp.join('').trim();
    onChange(combined);

    if (val) {
      triggerCardFlip(index);
      if (index < length - 1) {
        setActiveBoxIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otpArray[index] && index > 0) {
        setActiveBoxIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
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
    if (pastedData) {
      onChange(pastedData);
      const nextFocus = Math.min(pastedData.length, length - 1);
      setActiveBoxIndex(nextFocus);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5 my-2" style={{ perspective: '1000px' }}>
      {Array.from({ length }).map((_, index) => {
        const isFlipped = flippedIndices[index];
        const isWobbling = clickWobbleIndex === index;
        const isActive = activeBoxIndex === index;
        const hasValue = Boolean(otpArray[index]);

        return (
          <motion.div
            key={index}
            animate={{
              rotateX: isFlipped ? [0, 180, 360] : 0,
              rotateY: isWobbling ? [0, 10, 0] : 0,
              scale: isFlipped ? [0.9, 1.15, 1.0] : isActive ? 1.06 : 1,
              y: isActive ? -1 : 0,
            }}
            transition={{
              duration: isFlipped ? 0.5 : 0.4,
              ease: isFlipped ? [0.34, 1.56, 0.64, 1] : "easeInOut",
            }}
            className="relative"
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
          >
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={otpArray[index] || ''}
              onChange={(e) => handleChange(e, index)}
              onFocus={() => handleBoxFocus(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              disabled={disabled}
              className={`w-[40px] h-[40px] sm:w-[54px] sm:h-[54px] text-center text-lg sm:text-xl font-black bg-white rounded-[14px] border-2 transition-all duration-200 outline-none ${
                isError
                  ? 'border-red-500 text-red-600 bg-red-50/20 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]'
                  : isActive
                  ? 'border-[#2563eb] shadow-[0_0_0_4px_rgba(37,99,235,0.15)] text-slate-900'
                  : hasValue
                  ? 'border-blue-400 text-slate-900'
                  : 'border-[#dbeafe] text-slate-900'
              }`}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default OtpInput;
