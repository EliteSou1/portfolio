'use client';

import { useEffect, useRef } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';

const INTERACTIVE = 'a, button, input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="slider"]';

function scrollContainers(target: EventTarget | null) {
  const containers: { element: HTMLElement; top: number; left: number }[] = [];
  let element = target instanceof Element ? target : null;
  while (element) {
    if (element instanceof HTMLElement) {
      const style = getComputedStyle(element);
      if (/(auto|scroll)/.test(`${style.overflowY} ${style.overflowX}`)) {
        containers.push({ element, top: element.scrollTop, left: element.scrollLeft });
      }
    }
    element = element.parentElement;
  }
  return containers;
}

function canScroll(containers: ReturnType<typeof scrollContainers>, delta: number, horizontal: boolean) {
  return containers.some(({ element, top, left }) => {
    const style = getComputedStyle(element);
    if (!/(auto|scroll)/.test(horizontal ? style.overflowX : style.overflowY)) return false;
    const position = horizontal ? left : top;
    const maximum = horizontal
      ? element.scrollWidth - element.clientWidth
      : element.scrollHeight - element.clientHeight;
    return maximum > 1 && (delta < 0 ? position > 1 : position < maximum - 1);
  });
}

export function ScrollController() {
  const { nextSection, prevSection, inspectingProject, isTransitioning } = usePortfolio();
  const wheelGesture = useRef({ lastEvent: 0, handled: false });

  useEffect(() => {
    let touch: { x: number; y: number; containers: ReturnType<typeof scrollContainers> } | null = null;
    const navigate = (delta: number) => {
      if (isTransitioning) return;
      if (delta > 0) nextSection();
      else prevSection();
    };
    const interactive = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest(INTERACTIVE));

    const handleWheel = (event: WheelEvent) => {
      // Preserve browser zoom, horizontal gestures and scrolling in nested panels.
      if (inspectingProject || event.defaultPrevented || event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const now = performance.now();
      const gesture = wheelGesture.current;
      if (now - gesture.lastEvent > 180) gesture.handled = false;
      gesture.lastEvent = now;
      if (canScroll(scrollContainers(event.target), event.deltaY, false)) {
        // Reaching an edge must not turn the tail of this gesture into navigation.
        gesture.handled = true;
        return;
      }
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      if (Math.abs(delta) < 18) return;
      if (event.cancelable) event.preventDefault();
      if (gesture.handled || isTransitioning) return;
      gesture.handled = true;
      navigate(delta);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (inspectingProject || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || interactive(event.target)) return;
      const forward = ['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key);
      const backward = ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key);
      if (!forward && !backward) return;
      const delta = backward || (event.key === ' ' && event.shiftKey) ? -1 : 1;
      const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
      if (canScroll(scrollContainers(event.target), delta, horizontal)) return;
      event.preventDefault();
      if (!event.repeat) navigate(delta);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touch = null;
      if (inspectingProject || event.touches.length !== 1 || interactive(event.target)) return;
      touch = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        containers: scrollContainers(event.target),
      };
    };
    const handleTouchEnd = (event: TouchEvent) => {
      const start = touch;
      touch = null;
      if (!start || inspectingProject || event.touches.length || !event.changedTouches.length) return;
      const deltaY = start.y - event.changedTouches[0].clientY;
      const deltaX = start.x - event.changedTouches[0].clientX;
      const horizontal = Math.abs(deltaX) > Math.abs(deltaY);
      const delta = horizontal ? deltaX : deltaY;
      // Use the scroll position at touchstart, before native scrolling reaches an edge.
      if (Math.abs(delta) < 35 || canScroll(start.containers, delta, horizontal)) return;
      navigate(delta);
    };
    const cancelTouch = () => { touch = null; };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', cancelTouch);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', cancelTouch);
    };
  }, [nextSection, prevSection, inspectingProject, isTransitioning]);

  return null;
}
