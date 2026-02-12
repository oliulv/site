import blessed from "blessed";
import type { Theme } from "../themes";
import { ukMap, manchesterPositions } from "../../content/ascii-maps";
import { bio } from "../../content/bio";

const MAP_LINES = ukMap.split("\n");
export const MAP_LINE_COUNT = MAP_LINES.length;

// Layout constants
const MAP_WIDTH = 42;
const GAP = 14;
const BIO_WIDTH = 50;
const CONTENT_WIDTH = MAP_WIDTH + GAP + BIO_WIDTH;
const BULLET = "\u2022 "; // • smaller bullet
const INDENT = "  "; // continuation indent matching bullet width
const UNBULLETED_LINES = new Set(["Previously I have also:"]);
const BIO_LINES = bio.split("\n");

export interface AboutPageOptions {
  parent: blessed.Widgets.Screen;
  theme: Theme;
}

/** Word-wrap a line with hanging indent for continuations */
function wrapLine(line: string, width: number): string {
  if (line.length <= width) return line;
  const words = line.split(" ");
  const result: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (test.length > width && current) {
      result.push(current);
      current = INDENT + word;
    } else {
      current = test;
    }
  }
  if (current) result.push(current);
  return result.join("\n");
}

/** Build the map content with progressive reveal and orange Manchester */
function renderMap(theme: Theme, visibleLines: number): string {
  const manchSet = new Set(manchesterPositions.map(([r, c]) => `${r},${c}`));

  const linesToShow = Math.min(visibleLines, MAP_LINES.length);

  return MAP_LINES.slice(0, linesToShow)
    .map((line, lineIdx) => {
      let result = "";
      let col = 0;
      for (const ch of line) {
        if (manchSet.has(`${lineIdx},${col}`)) {
          // Override to full braille block for a solid 4×4 dot square
          result += `{${theme.accent}-fg}\u28FF{/${theme.accent}-fg}`;
        } else {
          result += ch;
        }
        col++;
      }
      return result;
    })
    .join("\n");
}

export function createAboutPage(
  options: AboutPageOptions
): blessed.Widgets.BoxElement {
  const { parent, theme } = options;

  // Fixed-width container centered on screen
  const container = blessed.box({
    parent,
    top: "center",
    left: "center",
    width: CONTENT_WIDTH,
    height: MAP_LINE_COUNT + 3,
    style: {
      bg: theme.bg,
    },
  });

  // ASCII map on the left
  const mapBox = blessed.box({
    parent: container,
    top: 0,
    left: 0,
    width: MAP_WIDTH,
    height: MAP_LINE_COUNT,
    content: "",
    tags: true,
    style: {
      fg: theme.fg,
      bg: theme.bg,
    },
  });

  // Location label — positioned to the upper-right of Manchester marker
  const locationLabel = blessed.box({
    parent: container,
    top: 11,
    left: 33,
    width: 15,
    height: 1,
    content: "",
    tags: true,
    style: {
      bg: theme.bg,
    },
  });

  // Bio text on the right, vertically centered relative to the map
  const bioBox = blessed.box({
    parent: container,
    top: "center",
    left: MAP_WIDTH + GAP,
    width: BIO_WIDTH,
    height: "shrink",
    content: "",
    tags: true,
    style: {
      fg: theme.fg,
      bg: theme.bg,
    },
  });

  // Store references
  (container as ExtendedBox).mapBox = mapBox;
  (container as ExtendedBox).bioBox = bioBox;
  (container as ExtendedBox).locationLabel = locationLabel;

  return container;
}

interface ExtendedBox extends blessed.Widgets.BoxElement {
  mapBox?: blessed.Widgets.BoxElement;
  bioBox?: blessed.Widgets.BoxElement;
  locationLabel?: blessed.Widgets.BoxElement;
}

export function updateAboutPage(
  container: blessed.Widgets.BoxElement,
  theme: Theme,
  typewriterIndex: number,
  cursorVisible: boolean,
  mapRevealIndex: number
): void {
  const ext = container as ExtendedBox;
  if (ext.mapBox) {
    ext.mapBox.style.fg = theme.fg;
    ext.mapBox.style.bg = theme.bg;
    ext.mapBox.setContent(renderMap(theme, mapRevealIndex));
  }

  // Show location label once map is fully revealed
  if (ext.locationLabel) {
    if (mapRevealIndex >= MAP_LINE_COUNT) {
      ext.locationLabel.setContent(
        `{${theme.accent}-fg}[Manchester]{/${theme.accent}-fg}`
      );
    } else {
      ext.locationLabel.setContent("");
    }
  }

  if (ext.bioBox) {
    ext.bioBox.style.fg = theme.fg;
    ext.bioBox.style.bg = theme.bg;

    const visibleText = bio.substring(0, typewriterIndex);
    const cursor = cursorVisible ? "\u2588" : " ";

    // Add bullet points with hanging indent word-wrap
    const lines = visibleText.split("\n");
    const bulletText = lines
      .map((line, index) => {
        if (!line.trim()) return "";
        if (UNBULLETED_LINES.has((BIO_LINES[index] ?? "").trim())) {
          return wrapLine(line.trim(), BIO_WIDTH);
        }
        return wrapLine(BULLET + line, BIO_WIDTH);
      })
      .join("\n");

    ext.bioBox.setContent(
      `${bulletText}{${theme.accent}-fg}${cursor}{/${theme.accent}-fg}`
    );
  }
}

export function getBioLength(): number {
  return bio.length;
}
