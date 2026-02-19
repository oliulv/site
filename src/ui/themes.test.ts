import { describe, it, expect } from "bun:test";
import { theme } from "./themes";

describe("theme", () => {
  it("should have all required properties", () => {
    expect(theme).toHaveProperty("bg");
    expect(theme).toHaveProperty("bgSubtle");
    expect(theme).toHaveProperty("fg");
    expect(theme).toHaveProperty("fgMuted");
    expect(theme).toHaveProperty("accent");
    expect(theme).toHaveProperty("border");
  });

  it("should have correct ember theme values", () => {
    expect(theme.bg).toBe("#0d0d0d");
    expect(theme.accent).toBe("#e86a10");
  });

  it("should have valid hex color format for all colors", () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

    expect(theme.bg).toMatch(hexColorRegex);
    expect(theme.bgSubtle).toMatch(hexColorRegex);
    expect(theme.fg).toMatch(hexColorRegex);
    expect(theme.fgMuted).toMatch(hexColorRegex);
    expect(theme.accent).toMatch(hexColorRegex);
    expect(theme.border).toMatch(hexColorRegex);
  });
});
