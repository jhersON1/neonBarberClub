/** Scrolls to a page section while respecting the user's motion preference. */
export function scrollToSection(sectionId: string): void {
  if (typeof document === 'undefined') return;

  const target = document.getElementById(sectionId);
  if (!target) return;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  });
}
