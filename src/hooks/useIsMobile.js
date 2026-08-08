import { useState, useEffect } from 'react';

/**
 * Custom hook to detect screen size and determine toast position:
 * - Desktop (≥1024px): 'top-right'
 * - Tablet (768px-1023px): 'top-center'
 * - Mobile (<768px): 'top-center'
 */
export const useIsMobile = () => {
  const [screen, setScreen] = useState(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false, isDesktop: true, position: 'top-right' };
    }
    const width = window.innerWidth;
    if (width < 768) return { isMobile: true, isTablet: false, isDesktop: false, position: 'top-center' };
    if (width < 1024) return { isMobile: false, isTablet: true, isDesktop: false, position: 'top-center' };
    return { isMobile: false, isTablet: false, isDesktop: true, position: 'top-right' };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreen({ isMobile: true, isTablet: false, isDesktop: false, position: 'top-center' });
      } else if (width < 1024) {
        setScreen({ isMobile: false, isTablet: true, isDesktop: false, position: 'top-center' });
      } else {
        setScreen({ isMobile: false, isTablet: false, isDesktop: true, position: 'top-right' });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screen;
};

export default useIsMobile;
