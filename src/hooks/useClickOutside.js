import { useEffect, useCallback } from 'react';

/**
 * useClickOutside — Enterprise-grade hook for managing popup/dropdown behavior.
 * 
 * Features:
 * - Outside click detection (mousedown + touchstart)
 * - ESC key closes all popups
 * - Mutual exclusion — only one popup open at a time
 * - Proper cleanup on unmount (no memory leaks)
 * 
 * @param {Array<{ ref: React.RefObject, isOpen: boolean, setOpen: Function }>} popups
 *   Array of popup configurations. Each entry has:
 *     - ref:     React ref attached to the popup container (including its trigger button)
 *     - isOpen:  boolean state indicating if this popup is currently visible
 *     - setOpen: state setter function to open/close this popup
 */
export function useClickOutside(popups) {
  const handleOutsideClick = useCallback(
    (event) => {
      // For each open popup, check if the click was outside its ref
      popups.forEach(({ ref, isOpen, setOpen }) => {
        if (isOpen && ref.current && !ref.current.contains(event.target)) {
          setOpen(false);
        }
      });
    },
    // We stringify the isOpen states to track changes properly
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [popups.map((p) => p.isOpen).join(',')]
  );

  const handleEscape = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        popups.forEach(({ isOpen, setOpen }) => {
          if (isOpen) setOpen(false);
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [popups.map((p) => p.isOpen).join(',')]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    document.addEventListener('keydown', handleEscape, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [handleOutsideClick, handleEscape]);
}

/**
 * Creates a toggle handler that enforces mutual exclusion:
 * clicking one popup's trigger closes all others before toggling itself.
 * 
 * @param {Function} setOpen  - The setter for THIS popup
 * @param {boolean}  isOpen   - Current open state of THIS popup
 * @param {Array<Function>} otherSetters - Setters for ALL OTHER popups to close
 * @returns {Function} Click handler for the trigger button
 */
export function createToggleHandler(setOpen, isOpen, otherSetters = []) {
  return () => {
    // Close every other popup first
    otherSetters.forEach((setter) => setter(false));
    // Toggle this one
    setOpen((prev) => !prev);
  };
}

export default useClickOutside;
