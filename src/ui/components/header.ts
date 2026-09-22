import blessed from "blessed";
import type { Theme } from "../themes";

export interface HeaderOptions {
  parent: blessed.Widgets.Screen;
  theme: Theme;
}

interface HeaderExtended extends blessed.Widgets.BoxElement {
  _tab?: blessed.Widgets.TextElement;
  _nameBox?: blessed.Widgets.BoxElement;
}

const EQUATION = "[1.01³⁶⁵ = 37.8]  >  [0.99³⁶⁵ = 0.03]";

export function createHeader(
  options: HeaderOptions
): blessed.Widgets.BoxElement {
  const { parent, theme } = options;

  const header: HeaderExtended = blessed.box({
    parent,
    top: 0,
    left: 0,
    width: "100%",
    height: 3,
    style: {
      bg: theme.bg,
    },
  });

  // Single "About" tab on the left
  header._tab = blessed.text({
    parent: header,
    top: 1,
    left: 2,
    content: "About",
    style: {
      fg: theme.accent,
      bg: theme.bg,
    },
  });

  // Equation in accent color on the right
  header._nameBox = blessed.box({
    parent: header,
    top: 1,
    right: 2,
    width: "shrink",
    height: 1,
    tags: true,
    content: "",
    style: {
      bg: theme.bg,
    },
  });

  return header;
}

export function updateHeader(
  header: blessed.Widgets.BoxElement,
  theme: Theme
): void {
  const ext = header as HeaderExtended;

  header.style.bg = theme.bg;

  if (ext._tab) {
    ext._tab.style.fg = theme.accent;
    ext._tab.style.bg = theme.bg;
  }

  // Update equation text
  if (ext._nameBox) {
    ext._nameBox.style.bg = theme.bg;
    ext._nameBox.setContent(
      `{${theme.accent}-fg}${EQUATION}{/${theme.accent}-fg}`
    );
  }
}
