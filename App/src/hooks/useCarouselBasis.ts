import { useState, useEffect } from "react";

const getItemCount = (width: number) => {
  if (width < 320) return 1; // xs — full width
  if (width < 540) return 2; // sm — 2 cards
  if (width < 768) return 3; // md — 3 cards
  if (width < 1024) return 4; // lg — 4 cards
  return 5; // xl — 5 cards
};

export const useCarouselBasis = (containerRef: { current: Element }) => {
  const [basis, setBasis] = useState("33.33%");

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const count = getItemCount(w); // items visible
      setBasis(`${(100 / count).toFixed(2)}%`);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return basis;
};
