import blessed from "blessed";
import type { Theme } from "../themes";
import type { AppState } from "../../state";

export interface HeaderOptions {
  parent: blessed.Widgets.Screen;
  theme: Theme;
}

export function createHeader(
  options: HeaderOptions
): blessed.Widgets.BoxElement {
  const { parent, theme } = options;

  const header = blessed.box({
    parent,
    top: 0,
    left: 0,
    width: "100%",
    height: 3,
    style: {
      bg: theme.bg,
    },
  });

  return header;
}

export function updateHeader(
  header: blessed.Widgets.BoxElement,
  state: AppState,
  theme: Theme,
  animatedText: string
): void {
  // Clear existing children
  while (header.children.length > 0) {
    header.children[0].detach();
  }

  const tabs = ["About", "Links"];

  // Create navigation tabs on the left
  let leftOffset = 2;
  tabs.forEach((tab, index) => {
    const isSelected = index === state.selectedNavIndex;
    blessed.text({
      parent: header,
      top: 1,
      left: leftOffset,
      content: tab,
      style: {
        fg: isSelected ? theme.accent : theme.fgMuted,
        bg: theme.bg,
      },
    });
    leftOffset += tab.length + 3;
  });

  // "[Oliver Ulvebne]" in accent color on the right
  blessed.box({
    parent: header,
    top: 1,
    right: 2,
    width: animatedText.length + 2,
    height: 1,
    tags: true,
    content: `{${theme.accent}-fg}[${animatedText}]{/${theme.accent}-fg}`,
    style: {
      bg: theme.bg,
    },
  });
}
