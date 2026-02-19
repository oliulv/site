import blessed from "blessed";
import type { Theme } from "../themes";
import { links } from "../../content/links";

export interface LinksPageOptions {
  parent: blessed.Widgets.Screen;
  theme: Theme;
}

const CONTAINER_WIDTH = 72;
const CONTAINER_HEIGHT = 13;
const LABEL_WIDTH = 12;

function renderLinkLine(
  link: (typeof links)[number],
  isSelected: boolean,
  theme: Theme
): string {
  const paddedLabel = link.label.padEnd(LABEL_WIDTH, " ");
  if (isSelected) {
    return `{${theme.accent}-fg}❯ {bold}${paddedLabel}{/bold}{/${theme.accent}-fg} {${theme.fg}-fg}${link.value}{/${theme.fg}-fg}`;
  }
  return `  {${theme.fg}-fg}${paddedLabel}{/${theme.fg}-fg} {${theme.fgMuted}-fg}${link.value}{/${theme.fgMuted}-fg}`;
}

function renderContent(theme: Theme, selectedIndex: number): string {
  if (links.length === 0) {
    return `{${theme.accent}-fg}{bold}Links{/bold}{/${theme.accent}-fg}\n\n{${theme.fgMuted}-fg}No links configured.{/${theme.fgMuted}-fg}`;
  }

  const safeIndex = Math.min(
    Math.max(selectedIndex, 0),
    Math.max(links.length - 1, 0)
  );

  const lines = links.map((link, index) =>
    renderLinkLine(link, index === safeIndex, theme)
  );

  const selected = links[safeIndex];
  return [
    `{${theme.accent}-fg}{bold}Links{/bold}{/${theme.accent}-fg}`,
    "",
    ...lines,
    "",
    `{${theme.fgMuted}-fg}Open:{/${theme.fgMuted}-fg} {${theme.accent}-fg}${selected.url}{/${theme.accent}-fg}`,
  ].join("\n");
}

export function createLinksPage(
  options: LinksPageOptions
): blessed.Widgets.BoxElement {
  const { parent, theme } = options;

  const container = blessed.box({
    parent,
    top: "center",
    left: "center",
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
    border: { type: "line" },
    padding: {
      top: 1,
      left: 2,
    },
    tags: true,
    transparent: true,
    content: renderContent(theme, 0),
    style: {
      fg: theme.fg,
      border: { fg: theme.border },
    },
  });

  return container;
}

export function updateLinksPage(
  container: blessed.Widgets.BoxElement,
  theme: Theme,
  selectedIndex: number
): void {
  container.style.fg = theme.fg;
  container.style.border = { fg: theme.border };
  container.setContent(renderContent(theme, selectedIndex));
}
