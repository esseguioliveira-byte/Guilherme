'use client';

import { useEffect } from 'react';

/**
 * ScrollAnimator
 * 
 * Watches every element with a [data-scroll] attribute via IntersectionObserver.
 * When the element enters the viewport it gets data-visible="true", which CSS
 * transitions to the fully-visible state. Runs once globally in the root layout.
 * 
 * Usage in any component/page:
 *   <div data-scroll="up"> ... </div>
 *   <div data-scroll="fade" style={{ '--scroll-delay': '200ms' }}> ... </div>
 *   <ul data-stagger>
 *     <li data-scroll="up">Card 1</li>
 *     <li data-scroll="up">Card 2</li>  ← auto-delayed
 *   </ul>
 */
export default function ScrollAnimator() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-scroll]');

    // If IntersectionObserver isn't available (SSR guard), just show everything
    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach(el => el.setAttribute('data-visible', 'true'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true');
            observer.unobserve(entry.target); // Animate once, then stop watching
          }
        });
      },
      {
        threshold: 0.12,     // 12% of element must be visible to trigger
        rootMargin: '0px 0px -40px 0px', // Slight bottom offset so it feels intentional
      }
    );

    elements.forEach(el => observer.observe(el));

    // Re-observe on route changes (SPA navigation)
    const mutationObserver = new MutationObserver(() => {
      document.querySelectorAll<HTMLElement>('[data-scroll]:not([data-visible])').forEach(el => {
        observer.observe(el);
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null; // Invisible — pure side-effect component
}
