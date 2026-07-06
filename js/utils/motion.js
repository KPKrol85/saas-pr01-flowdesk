export const prefersReducedMotion = () => {
  const browserPrefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const appPrefersReducedMotion = document.documentElement.classList.contains('motion-reduced');

  return browserPrefersReducedMotion || appPrefersReducedMotion;
};
