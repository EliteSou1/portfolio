'use client';

import { useEffect, useRef } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';

export function ScrollController() {
  const { nextSection, prevSection, inspectingProject } = usePortfolio();

  const isLockedRef = useRef(false);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Snappy Wheel Event: 1 single wheel movement immediately clicks to next/prev section
    const handleWheel = (e: WheelEvent) => {
      // If inspecting modal is open, let user scroll the modal content
      if (inspectingProject) return;

      // Check if user is scrolling inside an element with internal scroll (like project cards list or text container)
      const target = e.target as HTMLElement | null;
      const scrollable = target?.closest('.overflow-y-auto, [data-inner-scroll="true"]') as HTMLElement | null;
      if (scrollable && scrollable.scrollHeight > scrollable.clientHeight) {
        const atTop = scrollable.scrollTop <= 1;
        const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 2;

        // Only allow orbital jump if scrolled to boundary
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
          return;
        }
      }

      e.preventDefault();

      if (isLockedRef.current) return;

      const threshold = 18;
      if (Math.abs(e.deltaY) > threshold || Math.abs(e.deltaX) > threshold) {
        isLockedRef.current = true;

        if (e.deltaY > threshold || e.deltaX > threshold) {
          nextSection();
        } else if (e.deltaY < -threshold || e.deltaX < -threshold) {
          prevSection();
        }

        setTimeout(() => {
          isLockedRef.current = false;
        }, 550); // Crisp 550ms clack cooldown
      }
    };

    // Keyboard navigation (Arrow keys, Space, PageUp/Down)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inspectingProject) return;

      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;

      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        if (!isLockedRef.current) {
          isLockedRef.current = true;
          nextSection();
          setTimeout(() => {
            isLockedRef.current = false;
          }, 550);
        }
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        if (!isLockedRef.current) {
          isLockedRef.current = true;
          prevSection();
          setTimeout(() => {
            isLockedRef.current = false;
          }, 550);
        }
      }
    };

    // Touch Swipe Gestures
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (inspectingProject || isLockedRef.current) return;

      const scrollable = (e.target as HTMLElement | null)?.closest('.overflow-y-auto') as HTMLElement | null;
      if (scrollable && scrollable.scrollHeight > scrollable.clientHeight) {
        const diffY = touchStartY.current - e.changedTouches[0].clientY;
        const atTop = scrollable.scrollTop <= 2;
        const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 2;

        if ((diffY > 0 && !atBottom) || (diffY < 0 && !atTop)) {
          return;
        }
      }

      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const diffY = touchStartY.current - touchEndY;
      const diffX = touchStartX.current - touchEndX;

      const swipeThreshold = 35;

      if (Math.abs(diffY) > swipeThreshold || Math.abs(diffX) > swipeThreshold) {
        isLockedRef.current = true;

        if (diffY > swipeThreshold || diffX > swipeThreshold) {
          nextSection();
        } else {
          prevSection();
        }

        setTimeout(() => {
          isLockedRef.current = false;
        }, 550);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextSection, prevSection, inspectingProject]);

  return null;
}
