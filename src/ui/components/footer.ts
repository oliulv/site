import blessed from "blessed";
import type { Theme } from "../themes";

export interface FooterOptions {
  parent: blessed.Widgets.Screen;
  theme: Theme;
  version: string;
}

interface FooterExtended extends blessed.Widgets.BoxElement {
  _sigBox?: blessed.Widgets.BoxElement;
  _shortcutsBox?: blessed.Widgets.BoxElement;
}

export function createFooter(
  options: FooterOptions
): blessed.Widgets.BoxElement {
  const { parent, theme } = options;

  const footer: FooterExtended = blessed.box({
    parent,
    bottom: 0,
    left: 0,
    width: "100%",
    height: 1,
    style: {
      bg: theme.bg,
    },
  });

  // Signature on the left
  footer._sigBox = blessed.box({
    parent: footer,
    left: 2,
    width: "shrink",
    height: 1,
    tags: true,
    content: "",
    style: {
      bg: theme.bg,
    },
  });

  // Shortcuts on the right
  footer._shortcutsBox = blessed.box({
    parent: footer,
    right: 2,
    width: "shrink",
    height: 1,
    tags: true,
    content: "",
    style: {
      bg: theme.bg,
    },
  });

  return footer;
}

export function updateFooter(
  footer: blessed.Widgets.BoxElement,
  theme: Theme,
  linksPageActive: boolean
): void {
  const ext = footer as FooterExtended;

  footer.style.bg = theme.bg;

  // Update signature
  if (ext._sigBox) {
    ext._sigBox.style.bg = theme.bg;
    ext._sigBox.setContent(
      `{${theme.accent}-fg}Oliver Ulvebne{/${theme.accent}-fg}{${theme.fgMuted}-fg} // 2026 // 21{/${theme.fgMuted}-fg}`
    );
  }

  // Update shortcuts
  if (ext._shortcutsBox) {
    ext._shortcutsBox.style.bg = theme.bg;

    const shortcuts = linksPageActive
      ? `{${theme.accent}-fg}tab{/${theme.accent}-fg}{${theme.fgMuted}-fg} page  {/${theme.fgMuted}-fg}{${theme.accent}-fg}↑↓{/${theme.accent}-fg}{${theme.fgMuted}-fg} select  {/${theme.fgMuted}-fg}{${theme.accent}-fg}enter{/${theme.accent}-fg}{${theme.fgMuted}-fg} open  {/${theme.fgMuted}-fg}{${theme.accent}-fg}q{/${theme.accent}-fg}{${theme.fgMuted}-fg} quit{/${theme.fgMuted}-fg}`
      : `{${theme.accent}-fg}tab{/${theme.accent}-fg}{${theme.fgMuted}-fg} page  {/${theme.fgMuted}-fg}{${theme.accent}-fg}q{/${theme.accent}-fg}{${theme.fgMuted}-fg} quit{/${theme.fgMuted}-fg}`;

    ext._shortcutsBox.setContent(shortcuts);
  }
}
