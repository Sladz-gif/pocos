export const Colors = {
  // Primary Palette - White & Green with Custom Accents
  primaryGreen: "#204D38", // Primary green accent
  deepBlack: "#111111", // Dark background/text
  white: "#FFFFFF", // White surface
  lightBeige: "#F5E6D0", // Light beige background
  lightPink: "#F0CBBB", // Light pink accent
  mediumPink: "#E7A99A", // Medium pink accent
  dangerRed: "#C8361D", // Danger/error
  gold: "#E2A028", // Warning/gold accent

  // Status Colors
  success: "#204D38", // Green
  warning: "#E2A028", // Gold
  danger: "#C8361D", // Red
  error: "#C8361D", // Red
  info: "#204D38", // Green

  // UI Semantic Mapping
  background: "#FFFFFF", // white
  primarySurface: "#FFFFFF", // white
  secondarySurface: "#F0F0F0", // light gray
  tertiarySurface: "#E0E0E0", // medium gray
  textPrimary: "#111111", // deepBlack
  textSecondary: "#666666", // gray
  border: "#E0E0E0", // light gray
  accent: "#204D38", // primaryGreen

  // Legacy aliases for backward compatibility
  primaryRust: "#204D38", // Maps to green
  deepPlum: "#111111", // Maps to black
  warmSand: "#FFFFFF", // Maps to white
  antiqueGold: "#E2A028", // Maps to gold
  charcoalInk: "#111111", // Maps to black
  mutedSienna: "#666666", // Maps to gray
  paleParchment: "#FFFFFF", // Maps to white
  softAsh: "#F0F0F0", // Maps to light gray
  successMoss: "#204D38", // Maps to green
  alertAmber: "#E2A028", // Maps to gold
  dangerCrimson: "#C8361D", // Maps to red
} as const;

export type ColorKeys = keyof typeof Colors;
