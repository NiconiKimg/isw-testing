import { gsap } from 'gsap';

const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return Boolean(window.matchMedia('(prefers-reduced-motion: reduce)')?.matches);
};

/**
 * Animates receipt breakdown appearance on calculation.
 */
export const animateReceipt = (receiptEl: HTMLElement | null): gsap.core.Tween | null => {
  if (!receiptEl) return null;
  if (isReducedMotion()) {
    gsap.set(receiptEl, { opacity: 1, y: 0, clearProps: 'all' });
    return null;
  }

  return gsap.fromTo(
    receiptEl,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', clearProps: 'all' }
  );
};

/**
 * Animates alert banner appearance.
 */
export const animateAlert = (alertEl: HTMLElement | null): gsap.core.Tween | null => {
  if (!alertEl) return null;
  if (isReducedMotion()) {
    gsap.set(alertEl, { opacity: 1, scale: 1, clearProps: 'all' });
    return null;
  }

  return gsap.fromTo(
    alertEl,
    { opacity: 0, scale: 0.98, y: -4 },
    { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'back.out(1.2)', clearProps: 'all' }
  );
};
