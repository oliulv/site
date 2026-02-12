export interface Theme {
  bg: string;
  fg: string;
  fgMuted: string;
  accent: string;
  border: string;
}

// Single dark theme with darker orange accent
export const theme: Theme = {
  bg: "#1a1a1a",
  fg: "#ffffff",
  fgMuted: "#666666",
  accent: "#cc5500", // Darker orange
  border: "#333333",
};
