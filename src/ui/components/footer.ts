import blessed from "blessed";
import type { Theme } from "../themes";

export interface FooterOptions {
  parent: blessed.Widgets.Screen;
  theme: Theme;
  version: string;
}

interface FooterExtended extends blessed.Widgets.BoxElement {
  _shortcutsBox?: blessed.Widgets.BoxElement;
}

export function createFooter(
  options: FooterOptions
): blessed.Widgets.BoxElement {
  const { parent, theme, version } = options;

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

  // Version on the left (static, never changes)
  blessed.text({
    parent: footer,
    left: 2,
    content: `v${version}`,
    style: {
      fg: theme.fgMuted,
      bg: theme.bg,
    },
  });

  // Shortcuts in center (updated on page change)
  footer._shortcutsBox = blessed.box({
    parent: footer,
    left: "center",
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
  if (!ext._shortcutsBox) return;

  const shortcuts = linksPageActive
    ? `{${theme.accent}-fg}tab{/${theme.accent}-fg} page  {${theme.accent}-fg}↑↓{/${theme.accent}-fg} select  {${theme.accent}-fg}enter/space{/${theme.accent}-fg} open  {${theme.accent}-fg}q{/${theme.accent}-fg} quit`
    : `{${theme.accent}-fg}tab{/${theme.accent}-fg} page  {${theme.accent}-fg}q{/${theme.accent}-fg} quit`;

  ext._shortcutsBox.setContent(shortcuts);
}
