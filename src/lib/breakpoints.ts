// Isti brojevi kao Tailwind default breakpoints; koristi se sa useMediaQuery.
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 } as const;
export type Breakpoint = keyof typeof BREAKPOINTS;
export const minWidth = (bp: Breakpoint) => `(min-width: ${BREAKPOINTS[bp]}px)`;
export const maxWidth = (bp: Breakpoint) => `(max-width: ${BREAKPOINTS[bp] - 1}px)`;
