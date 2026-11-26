// Same values as tailwind.config.js, for places that need raw colors (icons, maps, Switch).

/**
 * The APEX AORA logo gradient (purple speed lines → indigo rider → blue/cyan front wheel).
 * Used for primary buttons and highlighted text so they match the logo exactly.
 */
export const brandGradient = ["#A21FE0", "#6A2FE8", "#2A7DE8", "#12A8E0"] as const;
export const brandGradientStart = { x: 0, y: 0.5 };
export const brandGradientEnd = { x: 1, y: 0.5 };

export const colors = {
  brand: "#7C3AED",
  brandDark: "#3B1A8C",
  brandAccent: "#06B6D4",
  brandLight: "#EDE9FE",
  brandLighter: "#F5F3FF",
  surface: "#FAFAFF",
  ink: "#1E1B4B",
  body: "#4B5563",
  muted: "#9CA3AF",
  line: "#E5E7EB",
  danger: "#E53935",
  dangerLight: "#FDECEC",
  white: "#FFFFFF",
};
