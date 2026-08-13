import React, { useState, useEffect, useRef } from 'react';
import './OTPVerify.css';
import { OTPParticleEngine } from './otpParticleEngine';

const DEMO_OTP = '5454';

export const OTPVerify = () => {
  // State variables
  const [otp, setOtp] = useState(['', '', '', '']);
  const [activeInput, setActiveInput] = useState(0);
  const [isAutoDemo, setIsAutoDemo] = useState(true);
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR'
  const [statusMsg, setStatusMsg] = useState('Enter 4-digit security code');
  
  // Resend Countdown Timer (24s)
  const [timer, setTimer] = useState(24);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // 3D Card Tilt State
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Refs for Cleanup & DOM Elements
  const canvasRef = useRef(null);
  const particleEngineRef = useRef(null);
  const inputRefs = useRef([]);
  const cardRef = useRef(null);
  
  // Timeout & Interval references for cleanup
  const autoDemoTimerRef = useRef(null);
  const verificationTimerRef = useRef(null);
  const errorResetTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const toastTimerRef = useRef(null);

  // 1. Initialize Canvas Particle Engine
  useEffect(() => {
    if (canvasRef.current) {
      particleEngineRef.current = new OTPParticleEngine(canvasRef.current);
    }

    return () => {
      if (particleEngineRef.current) {
        particleEngineRef.current.destroy();
      }
    };
  }, []);

  // 2. Resend Countdown Timer
  useEffect(() => {
    countdownIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // 3. Auto Demo Typewriter Effect
  useEffect(() => {
    if (isAutoDemo && status === 'IDLE') {
      const demoDigits = DEMO_OTP.split('');
      
      autoDemoTimerRef.current = setTimeout(() => {
        demoDigits.forEach((digit, index) => {
          setTimeout(() => {
            setOtp((prev) => {
              const next = [...prev];
              next[index] = digit;
              return next;
            });
            setActiveInput(index);
          }, index * 320);
        });
      }, 1000);
    }

    return () => {
      if (autoDemoTimerRef.current) {
        clearTimeout(autoDemoTimerRef.current);
      }
    };
  }, [isAutoDemo, status]);

  // 4. Trigger Verification when 4 digits are entered
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 4 && status === 'IDLE') {
      triggerVerification(code);
    }
  }, [otp, status]);

  const triggerVerification = (code) => {
    setStatus('VERIFYING');
    setStatusMsg('Verifying identity…');
    if (particleEngineRef.current) {
      particleEngineRef.current.setMode('DEFAULT');
    }

    verificationTimerRef.current = setTimeout(() => {
      if (code === DEMO_OTP) {
        // SUCCESS
        setStatus('SUCCESS');
        setStatusMsg('Verified & secured');
        
        if (particleEngineRef.current) {
          particleEngineRef.current.setMode('SUCCESS');
          if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            particleEngineRef.current.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 'SUCCESS');
          }
        }
      } else {
        // ERROR
        setStatus('ERROR');
        setStatusMsg('Incorrect security code');
        
        if (particleEngineRef.current) {
          particleEngineRef.current.setMode('ERROR');
          if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            particleEngineRef.current.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 'ERROR');
          }
        }

        errorResetTimerRef.current = setTimeout(() => {
          setOtp(['', '', '', '']);
          setStatus('IDLE');
          setStatusMsg('Enter 4-digit security code');
          setActiveInput(0);
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
          if (particleEngineRef.current) {
            particleEngineRef.current.setMode('DEFAULT');
          }
        }, 1800);
      }
    }, 1500);
  };

  // Cleanup Timers on Unmount
  useEffect(() => {
    return () => {
      if (verificationTimerRef.current) clearTimeout(verificationTimerRef.current);
      if (errorResetTimerRef.current) clearTimeout(errorResetTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Handle Input Changes
  const handleChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    const lastChar = val[val.length - 1];
    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    if (index < 3) {
      setActiveInput(index + 1);
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle KeyDown (Backspace & Arrow Navigation)
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      
      if (newOtp[index] !== '') {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        setActiveInput(index - 1);
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInput(index - 1);
      if (inputRefs.current[index - 1]) inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      setActiveInput(index + 1);
      if (inputRefs.current[index + 1]) inputRefs.current[index + 1].focus();
    }
  };

  // Handle Paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (!pasteData) return;

    const newOtp = ['', '', '', ''];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    const nextIdx = Math.min(pasteData.length, 3);
    setActiveInput(nextIdx);
    if (inputRefs.current[nextIdx]) {
      inputRefs.current[nextIdx].focus();
    }
  };

  // Handle 3D Tilt on MouseMove
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setTilt({
      rotateX: (-y / rect.height) * 12,
      rotateY: (x / rect.width) * 12,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // Action Buttons Handlers
  const handleToggleMode = () => {
    const newAuto = !isAutoDemo;
    setIsAutoDemo(newAuto);
    resetAll(newAuto);
  };

  const handleReplay = () => {
    resetAll(isAutoDemo);
  };

  const resetAll = (autoMode) => {
    if (verificationTimerRef.current) clearTimeout(verificationTimerRef.current);
    if (errorResetTimerRef.current) clearTimeout(errorResetTimerRef.current);
    if (autoDemoTimerRef.current) clearTimeout(autoDemoTimerRef.current);

    setOtp(['', '', '', '']);
    setStatus('IDLE');
    setStatusMsg('Enter 4-digit security code');
    setActiveInput(0);

    if (particleEngineRef.current) {
      particleEngineRef.current.setMode('DEFAULT');
    }

    if (autoMode) {
      const demoDigits = DEMO_OTP.split('');
      autoDemoTimerRef.current = setTimeout(() => {
        demoDigits.forEach((digit, index) => {
          setTimeout(() => {
            setOtp((prev) => {
              const next = [...prev];
              next[index] = digit;
              return next;
            });
            setActiveInput(index);
          }, index * 320);
        });
      }, 500);
    } else {
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }
  };

  // Handle Resend
  const handleResend = () => {
    if (!resendEnabled) return;

    setResendEnabled(false);
    setTimer(24);

    setToastMsg(`Demo Security OTP code: ${DEMO_OTP}`);
    
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMsg('');
    }, 4000);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="otp-wrapper">
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="otp-canvas" />

      {/* Perspective Grid Floor */}
      <div className="otp-grid-floor" />

      {/* Ambient Glow Circles */}
      <div className="otp-glow-orb otp-glow-orb-1" />
      <div className="otp-glow-orb otp-glow-orb-2" />

      {/* Flash Overlay for Success / Error */}
      <div
        className={`otp-flash-overlay ${
          status === 'SUCCESS' ? 'success' : status === 'ERROR' ? 'error' : ''
        }`}
      />

      {/* Main Centered Phone Card */}
      <div
        ref={cardRef}
        className={`otp-phone-card ${
          status === 'ERROR' ? 'shake' : status === 'SUCCESS' ? 'success-border' : ''
        }`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        {/* Header */}
        <header className="otp-header">
          <h1 className="otp-brand">DCODEVERSE</h1>
          <span className="otp-badge">SECURE IDENTITY</span>
        </header>

        {/* Main Content */}
        <main className="otp-content">
          <h2 className={`otp-title ${status === 'SUCCESS' ? 'success' : ''}`}>
            {status === 'SUCCESS' ? 'Verified successfully' : 'Verify your number'}
          </h2>
          <p className="otp-subtitle">
            Enter the 4-digit code sent to <span className="otp-number">+91 •••••• 2741</span>
          </p>

          {/* Central Stage (Inputs / Orbit Animation / Lock SVG) */}
          <div className={`otp-stage ${status.toLowerCase()}`}>
            {/* Orbit Rings */}
            <div className="otp-orbit-ring otp-orbit-ring-1" />
            <div className="otp-orbit-ring otp-orbit-ring-2" />

            {/* Cyan Scanline */}
            <div className="otp-scanline" />

            {/* Center Lock / Checkmark SVG Morph Icon */}
            <div className="otp-center-icon">
              {status === 'SUCCESS' ? (
                <svg className="otp-checkmark-svg" viewBox="0 0 52 52">
                  <path className="otp-checkmark-path" d="M14 27 l10 10 l20 -20" />
                </svg>
              ) : (
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </div>

            {/* OTP Input Boxes Group */}
            <div
              className="otp-inputs-group"
              role="group"
              aria-label="4-digit Security OTP Verification Code Input"
            >
              {[0, 1, 2, 3].map((index) => {
                const digit = otp[index];
                const isFilled = digit !== '';
                const isActive = activeInput === index && status === 'IDLE';

                return (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    disabled={status === 'VERIFYING' || status === 'SUCCESS'}
                    aria-label={`Digit ${index + 1} of 4`}
                    className={`otp-box ${isActive ? 'active' : ''} ${
                      isFilled ? 'filled' : ''
                    } ${status === 'ERROR' ? 'error' : ''}`}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    onFocus={() => setActiveInput(index)}
                  />
                );
              })}
            </div>
          </div>

          {/* Status Message */}
          <div
            className={`otp-status-msg ${status.toLowerCase()}`}
            aria-live="polite"
          >
            {statusMsg}
          </div>

          {/* Action Buttons */}
          <div className="otp-actions">
            <div className="otp-btn-row">
              <button
                type="button"
                className="otp-btn"
                onClick={handleToggleMode}
              >
                {isAutoDemo ? 'Mode: Auto Demo' : 'Mode: Manual'}
              </button>
              <button
                type="button"
                className="otp-btn secondary"
                onClick={handleReplay}
              >
                Replay Effect
              </button>
            </div>

            {/* Resend Countdown */}
            <div className="otp-resend-text">
              <span>Didn’t receive the code?</span>
              {resendEnabled ? (
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={handleResend}
                >
                  Resend code
                </button>
              ) : (
                <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>
                  Resend in {timer}s
                </span>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="otp-footer">DESIGNED BY DCODEVERSE</footer>
      </div>

      {/* Toast Notification */}
      {toastMsg && <div className="otp-toast">{toastMsg}</div>}
    </div>
  );
};

export default OTPVerify;
