import React, { useState, useEffect } from 'react';

// Deterministic vibrant color palettes for initials avatar
const AVATAR_GRADIENTS = [
  'from-blue-600 to-indigo-600 text-white',
  'from-teal-600 to-emerald-600 text-white',
  'from-violet-600 to-purple-600 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-rose-500 to-pink-600 text-white',
  'from-cyan-600 to-blue-600 text-white',
  'from-fuchsia-600 to-pink-600 text-white',
  'from-emerald-600 to-teal-700 text-white',
];

const SIZE_CLASSES = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl font-bold',
  '2xl': 'w-28 h-28 text-3xl font-black',
};

export const StudentAvatar = ({
  src,
  name = 'Student',
  studentId,
  size = 'md',
  className = '',
  rounded = 'rounded-xl',
  alt,
}) => {
  const [imageError, setImageError] = useState(false);

  // Reset error status if src prop changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Compute initials
  const getInitials = (text) => {
    if (!text || typeof text !== 'string') return 'ST';
    const clean = text.trim();
    if (!clean) return 'ST';
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Compute deterministic gradient index
  const getGradientClass = (seed) => {
    const str = seed || name || 'student';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
  };

  const sizeClass = SIZE_CLASSES[size] || size;
  const gradient = getGradientClass(studentId || name);
  const initials = getInitials(name);

  const hasValidPhoto = src && typeof src === 'string' && src.trim() !== '' && !imageError;

  if (hasValidPhoto) {
    return (
      <img
        src={src}
        alt={alt || name || 'Student'}
        onError={() => setImageError(true)}
        loading="lazy"
        className={`${sizeClass} ${rounded} object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${rounded} bg-gradient-to-br ${gradient} flex items-center justify-center font-black tracking-wider uppercase shadow-xs border border-white/20 select-none shrink-0 ${className}`}
      title={name || studentId || 'Student'}
      aria-label={name || studentId || 'Student'}
    >
      {initials}
    </div>
  );
};

export default StudentAvatar;
