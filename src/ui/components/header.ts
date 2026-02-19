import blessed from "blessed";
import type { Theme } from "../themes";
import type { AppState } from "../../state";

export interface HeaderOptions {
  parent: blessed.Widgets.Screen;
  theme: Theme;
}

interface HeaderExtended extends blessed.Widgets.BoxElement {
  _tabs?: blessed.Widgets.TextElement[];
  _nameBox?: blessed.Widgets.BoxElement;
}

const EQUATION = "[1.01\u00B3\u2076\u2075 = 37.8]  >  [0.99\u00B3\u2076\u2075 = 0.03]";

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

  // Create tab elements once
  const tabs = ["About", "Links"];
  const tabElements: blessed.Widgets.TextElement[] = [];
  let leftOffset = 2;
  for (const tab of tabs) {
    const el = blessed.text({
      parent: header,
      top: 1,
      left: leftOffset,
      content: tab,
      style: {
        fg: theme.fgMuted,
        bg: theme.bg,
      },
    });
    tabElements.push(el);
    leftOffset += tab.length + 3;
  }
  header._tabs = tabElements;

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
  state: AppState,
  theme: Theme,
  _animatedText: string
): void {
  const ext = header as HeaderExtended;

  header.style.bg = theme.bg;

  // Update tab highlight
  if (ext._tabs) {
    ext._tabs.forEach((tab, index) => {
      tab.style.fg =
        index === state.selectedNavIndex ? theme.accent : theme.fgMuted;
      tab.style.bg = theme.bg;
    });
  }

  // Update equation text
  if (ext._nameBox) {
    ext._nameBox.style.bg = theme.bg;
    ext._nameBox.setContent(
      `{${theme.accent}-fg}${EQUATION}{/${theme.accent}-fg}`
    );
  }
}
