'use client';

import { useEffect } from 'react';

export default function SpotlightController() {
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.spotlight-card');

    const cleanups: (() => void)[] = [];

    cards.forEach(card => {
      function updateCardSpot(clientX: number, clientY: number) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${(clientX - rect.left).toFixed(1)}px`);
        card.style.setProperty('--mouse-y', `${(clientY - rect.top).toFixed(1)}px`);
      }

      const onPointerMove = (e: PointerEvent) => updateCardSpot(e.clientX, e.clientY);
      const onPointerDown = (e: PointerEvent) => {
        updateCardSpot(e.clientX, e.clientY);
        card.classList.add('is-pressed');
      };
      const onPointerUp = () => {
        setTimeout(() => card.classList.remove('is-pressed'), 180);
      };
      const onPointerLeave = () => {
        card.classList.remove('is-pressed');
      };

      card.addEventListener('pointermove', onPointerMove, { passive: true });
      card.addEventListener('pointerdown', onPointerDown, { passive: true });
      card.addEventListener('pointerup', onPointerUp, { passive: true });
      card.addEventListener('pointerleave', onPointerLeave, { passive: true });

      cleanups.push(() => {
        card.removeEventListener('pointermove', onPointerMove);
        card.removeEventListener('pointerdown', onPointerDown);
        card.removeEventListener('pointerup', onPointerUp);
        card.removeEventListener('pointerleave', onPointerLeave);
      });
    });

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      cleanups.forEach(c => c());
      observer.disconnect();
    };
  }, []);

  return null;
}
