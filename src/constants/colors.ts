export const Colors = {
  // Primary Palette
  primaryRust: "#C1440E",
  deepPlum: "#2B1349",
  warmSand: "#F0E3C8",
  antiqueGold: "#C78B2E",
  charcoalInk: "#1D1814",
  mutedSienna: "#8C5C3E",
  paleParchment: "#FAF6EF",
  softAsh: "#E8E0D4",

  // Status Colors
  successMoss: "#3A7D44",
  alertAmber: "#D4821A",
  dangerCrimson: "#B02020",
  success: "#3A7D44",
  danger: "#B02020",
  error: "#B02020",
  errorRed: "#B02020",
  warning: "#D4821A",
  info: "#4A90E2",
  infoBlue: "#4A90E2",

  // UI Semantic Mapping (Legacy compatibility if needed, but we should migrate)
  background: "#FAF6EF", // paleParchment
  primarySurface: "#F0E3C8", // warmSand
  secondarySurface: "#E8E0D4", // softAsh
  textPrimary: "#1D1814", // charcoalInk
  textSecondary: "#8C5C3E", // mutedSienna
  primaryAccent: "#C1440E", // primaryRust
  border: "#E8E0D4", // softAsh
} as const;

export type ColorKeys = keyof typeof Colors;
