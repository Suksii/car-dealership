// Zajedničke framer-motion varijante, da animacije budu iste kroz cijeli sajt.
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const popIn = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } },
} as const;

export const listContainer = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
export const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

// Gušći stagger za grid oglasa (15+ kartica).
export const gridContainer = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
export const gridItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};
