import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Framer Motion wrapper for animating table rows or grid cards during live deletion.
 */
export const AnimatedDeleteWrapper = ({
  children,
  as = 'tr',
  className = '',
  layoutId,
  ...props
}) => {
  const Component = as === 'tr' ? motion.tr : motion.div;

  return (
    <Component
      layout
      initial={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, rotate: -6, y: 20 }}
      transition={{
        layout: { duration: 0.4, ease: 'easeInOut' },
        opacity: { duration: 0.5, ease: 'easeOut' },
        scale: { duration: 0.5, ease: 'easeInOut' },
        rotate: { duration: 0.5, ease: 'easeInOut' },
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};
export default AnimatedDeleteWrapper;
