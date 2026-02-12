import { describe, it, expect } from "bun:test";
import { getAnimatedContent } from "./animated-text";

describe("getAnimatedContent", () => {
  it("should return the full name text", () => {
    const content = getAnimatedContent(0);
    expect(content).toBe("Oliver Ulvebne");
  });

  it("should return the same text regardless of frame", () => {
    expect(getAnimatedContent(0)).toBe(getAnimatedContent(100));
  });
});
