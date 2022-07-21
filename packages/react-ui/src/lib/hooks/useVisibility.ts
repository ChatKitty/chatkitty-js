import React, { useEffect, useState } from 'react';

export const useVisibility = (
  element: React.RefObject<HTMLElement>,
  container: React.RefObject<HTMLElement> | null,
  threshold: number,
  rootMargin: string,
  lock = false
): boolean => {
  // exposes a piece of state
  const [isVisible, setVisibility] = useState(false);

  // runs once
  useEffect(() => {
    const target = element.current;
    // null uses the viewport
    const root = container && container.current;
    // ensure the refs are pointing to elements
    if (target !== null) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // after it is shown once, state is locked to prevent scroll jumps
          if (lock) {
            if (entry.isIntersecting) {
              setVisibility(true);
              observer.unobserve(target);
            }
          } else {
            setVisibility(entry.isIntersecting);
          }
        },
        { root, threshold, rootMargin }
      );

      observer.observe(target);

      // cleanup
      return () => {
        observer.unobserve(target);
      };
    }

    return () => {};
  }, [container, element, threshold, rootMargin, lock]);
  return isVisible;
};
