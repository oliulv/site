import blessed from "blessed";
import type { Duplex } from "stream";

export interface ScreenOptions {
  stream: Duplex;
  terminal?: string;
}

export function createScreen(options: ScreenOptions): blessed.Widgets.Screen {
  const { stream, terminal = "xterm-256color" } = options;

  const screen = blessed.screen({
    input: stream,
    output: stream,
    terminal,
    smartCSR: true,
    fullUnicode: true,
    forceUnicode: true,
    autoPadding: true,
    warnings: false,
  });

  return screen;
}
