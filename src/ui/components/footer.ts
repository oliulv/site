import blessed from "blessed";
import type { Theme } from "../themes";

export interface FooterOptions {
  parent: blessed.Widgets.Screen;
  theme: Theme;
  version: string;
}

export function createFooter(
  options: FooterOptions
): blessed.Widgets.BoxElement {
  const { parent, theme, version } = options;

  const footer = blessed.box({
    parent,
    bottom: 0,
    left: 0,
    width: "100%",
    height: 1,
    style: {
      bg: theme.bg,
    },
  });

  // Version on the left
  blessed.text({
    parent: footer,
    left: 2,
    content: `v${version}`,
    style: {
      fg: theme.fgMuted,
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
  while (footer.children.length > 1) {
    footer.children[footer.children.length - 1].detach();
  }

  const shortcuts = linksPageActive
    ? `{${theme.accent}-fg}tab{/${theme.accent}-fg} page  {${theme.accent}-fg}↑↓{/${theme.accent}-fg} select  {${theme.accent}-fg}enter/space{/${theme.accent}-fg} open  {${theme.accent}-fg}q{/${theme.accent}-fg} quit`
    : `{${theme.accent}-fg}tab{/${theme.accent}-fg} page  {${theme.accent}-fg}q{/${theme.accent}-fg} quit`;

  blessed.box({
    parent: footer,
    left: "center",
    width: "shrink",
    height: 1,
    tags: true,
    content: shortcuts,
    style: {
      bg: theme.bg,
    },
  });

  if (footer.children[0] && "style" in footer.children[0]) {
    const el = footer.children[0] as blessed.Widgets.TextElement;
    el.style.fg = theme.fgMuted;
    el.style.bg = theme.bg;
  }
}
