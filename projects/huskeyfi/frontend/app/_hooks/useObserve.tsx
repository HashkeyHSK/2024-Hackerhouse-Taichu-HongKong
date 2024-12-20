"use client";

import { SetStateAction, useEffect } from "react";

type UseObserveProps = {
  ref: React.RefObject<HTMLDivElement>;
  setVisible: React.Dispatch<SetStateAction<boolean>>;
  threshold?: number | number[];
};

const useObserve = ({ ref, setVisible, threshold }: UseObserveProps) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: threshold || 0.5 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
        observer.disconnect();
      }
    };
  }, []);
};

export default useObserve;
