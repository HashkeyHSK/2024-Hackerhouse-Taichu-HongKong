"use client";

import { SetStateAction, useEffect } from "react";

// Props type definition for useObserve hook
type UseObserveProps = {
  ref: React.RefObject<HTMLDivElement>; // Reference to DOM element to observe
  setVisible: React.Dispatch<SetStateAction<boolean>>; // Function to set visibility state
  threshold?: number | number[]; // Optional threshold value(s) for intersection observer
};

// Custom hook that uses Intersection Observer to detect when an element becomes visible
const useObserve = ({ ref, setVisible, threshold }: UseObserveProps) => {
  useEffect(() => {
    // Create new intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Set visible to true when element intersects viewport
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: threshold || 0.5 }, // Use provided threshold or default to 0.5
    );

    // Start observing the element if it exists
    if (ref.current) {
      observer.observe(ref.current);
    }

    // Cleanup function to stop observing
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
        observer.disconnect();
      }
    };
  }, []);
};

export default useObserve;
