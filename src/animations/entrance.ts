import { gsap } from 'gsap';

const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return Boolean(window.matchMedia('(prefers-reduced-motion: reduce)')?.matches);
};

/**
 * Animates top navbar entrance with subtle fade and vertical slide on inner content,
 * preserving position: sticky on the outer wrapper by avoiding transforms on navbarEl.
 */
export const animateNavbar = (navbarEl: HTMLElement | null): gsap.core.Timeline | gsap.core.Tween | null => {
  if (!navbarEl) return null;
  const innerNav = navbarEl.querySelector<HTMLElement>('.site-navbar');

  if (isReducedMotion()) {
    gsap.set(navbarEl, { opacity: 1, clearProps: 'all' });
    if (innerNav) gsap.set(innerNav, { opacity: 1, y: 0, clearProps: 'all' });
    return null;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  tl.fromTo(navbarEl, { opacity: 0 }, { opacity: 1, duration: 0.35, clearProps: 'all' });
  if (innerNav) {
    tl.fromTo(innerNav, { y: -10 }, { y: 0, duration: 0.35, clearProps: 'all' }, '<');
  }
  return tl;
};

/**
 * Animates the brand hero block (badge, title, tagline) with a staggered timeline.
 */
export const animateHero = (
  badgeEl: HTMLElement | null,
  titleEl: HTMLElement | null,
  taglineEl: HTMLElement | null
): gsap.core.Timeline | null => {
  const elements = [badgeEl, titleEl, taglineEl].filter((el): el is HTMLElement => Boolean(el));
  if (elements.length === 0) return null;

  if (isReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0, clearProps: 'all' });
    return null;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  tl.fromTo(
    elements,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, clearProps: 'all' }
  );
  return tl;
};

/**
 * Animates editorial catalog items with a staggered upward reveal.
 */
export const animateCatalog = (
  containerEl: HTMLElement | null
): gsap.core.Tween | null => {
  if (!containerEl) return null;
  const items = containerEl.querySelectorAll('.product-item');
  if (items.length === 0) return null;

  if (isReducedMotion()) {
    gsap.set(items, { opacity: 1, y: 0, clearProps: 'all' });
    return null;
  }

  return gsap.fromTo(
    items,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', clearProps: 'all' }
  );
};
