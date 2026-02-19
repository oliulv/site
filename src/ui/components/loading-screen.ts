import blessed from "blessed";
import type { Theme } from "../themes";

// Spinner frames using dots pattern
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export interface LoadingScreenOptions {
  parent: blessed.Widgets.Screen;
  theme: Theme;
}

export function createLoadingScreen(
  options: LoadingScreenOptions
): blessed.Widgets.BoxElement {
  const { parent, theme } = options;

  const container = blessed.box({
    parent,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    style: {
      bg: theme.bg,
    },
  });

  // Centered loading text
  const loadingBox = blessed.box({
    parent: container,
    top: "center",
    left: "center",
    width: 20,
    height: 1,
    style: {
      bg: theme.bg,
    },
  });

  // Spinner
  const spinner = blessed.text({
    parent: loadingBox,
    left: 0,
    content: SPINNER_FRAMES[0],
    style: {
      fg: theme.accent,
      bg: theme.bg,
    },
  });

  // Loading text
  blessed.text({
    parent: loadingBox,
    left: 3,
    content: "Initializing",
    style: {
      fg: theme.fgMuted,
      bg: theme.bg,
    },
  });

  // Store spinner reference
  (container as ExtendedLoadingBox).spinner = spinner;

  return container;
}

interface ExtendedLoadingBox extends blessed.Widgets.BoxElement {
  spinner?: blessed.Widgets.TextElement;
}

export function updateLoadingScreen(
  container: blessed.Widgets.BoxElement,
  frame: number,
  theme: Theme
): void {
  const ext = container as ExtendedLoadingBox;
  if (ext.spinner) {
    const spinnerFrame = SPINNER_FRAMES[frame % SPINNER_FRAMES.length];
    ext.spinner.setContent(spinnerFrame);
    ext.spinner.style.fg = theme.accent;
    ext.spinner.style.bg = theme.bg;
  }
}
