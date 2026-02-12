import { describe, it, expect } from "bun:test";
import { theme } from "./themes";

describe("theme", () => {
  it("should have all required properties", () => {
    expect(theme).toHaveProperty("bg");
    expect(theme).toHaveProperty("fg");
    expect(theme).toHaveProperty("fgMuted");
    expect(theme).toHaveProperty("accent");
    expect(theme).toHaveProperty("border");
  });

  it("should have correct dark theme values", () => {
    expect(theme.bg).toBe("#1a1a1a");
    expect(theme.fg).toBe("#ffffff");
    expect(theme.fgMuted).toBe("#666666");
    expect(theme.accent).toBe("#cc5500");
    expect(theme.border).toBe("#333333");
  });

  it("should have valid hex color format for all colors", () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

    expect(theme.bg).toMatch(hexColorRegex);
    expect(theme.fg).toMatch(hexColorRegex);
    expect(theme.fgMuted).toMatch(hexColorRegex);
    expect(theme.accent).toMatch(hexColorRegex);
    expect(theme.border).toMatch(hexColorRegex);
  });

  it("should have darker orange accent color", () => {
    // The accent should be a darker orange (#cc5500)
    // This is darker than bright orange (#ff6600)
    expect(theme.accent).toBe("#cc5500");
  });
});
