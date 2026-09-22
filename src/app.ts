import blessed from "blessed";
import type { Duplex } from "stream";
import { StateManager, type AppState } from "./state";
import { createScreen } from "./ui/screen";
import { theme } from "./ui/themes";
import { createHeader, updateHeader } from "./ui/components/header";
import {
  createAboutPage,
  updateAboutPage,
  getBioLength,
  MAP_LINE_COUNT,
} from "./ui/components/about-page";
import {
  createLoadingScreen,
  updateLoadingScreen,
} from "./ui/components/loading-screen";

const ANIMATION_INTERVAL = 80;
const TYPEWRITER_INTERVAL = 15;
const TYPEWRITER_BATCH = 6;
const CURSOR_BLINK_INTERVAL = 500;
const MAP_REVEAL_INTERVAL = 40;
const LOADING_DURATION = 750;

export class App {
  private screen: blessed.Widgets.Screen;
  private state: StateManager;
  private animationTimer: ReturnType<typeof setInterval> | null = null;
  private typewriterTimer: ReturnType<typeof setInterval> | null = null;
  private cursorTimer: ReturnType<typeof setInterval> | null = null;
  private mapRevealTimer: ReturnType<typeof setInterval> | null = null;
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;

  // UI Components
  private loadingScreen: blessed.Widgets.BoxElement | null = null;
  private header: blessed.Widgets.BoxElement | null = null;
  private aboutPage: blessed.Widgets.BoxElement | null = null;

  private stream: Duplex;
  private renderPending = false;
  private destroyed = false;

  constructor(stream: Duplex) {
    this.stream = stream;
    this.state = new StateManager();
    this.screen = createScreen({ stream });

    // Set terminal background via OSC escape sequence
    stream.write(`\x1b]11;${theme.bg}\x07`);

    // Quit keys must be bound immediately so they work during all phases
    this.screen.key(["q", "C-c", "escape"], () => {
      this.destroy();
    });

    // Create full-screen background first
    this.createBackground();

    this.setupLoadingScreen();
    this.startAnimation();

    // Subscribe to state changes
    this.state.subscribe((state) => this.onStateChange(state));

    // Initial render
    this.render();

    // Transition to main after loading
    this.loadingTimer = setTimeout(() => {
      this.loadingTimer = null;
      if (this.destroyed) return;
      this.transitionToMain();
    }, LOADING_DURATION);
  }

  private createBackground(): void {
    // Full-screen background box with unified color
    blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      style: {
        bg: theme.bg,
      },
    });
  }

  private setupLoadingScreen(): void {
    this.loadingScreen = createLoadingScreen({ parent: this.screen, theme });
  }

  private uiRevealed = false;

  private setupMainUI(): void {
    // Create about page first (visible during typewriter)
    this.aboutPage = createAboutPage({ parent: this.screen, theme });

    // Create header — hidden initially, revealed partway through map
    this.header = createHeader({ parent: this.screen, theme });
    this.header.hide();

    this.startTypewriter();
    this.startCursorBlink();
    this.startMapReveal();
  }

  /** Show header chrome (called when map is ~half revealed) */
  private revealChrome(): void {
    if (this.uiRevealed) return;
    this.uiRevealed = true;
    if (this.header) this.header.show();
  }

  private startAnimation(): void {
    this.animationTimer = setInterval(() => {
      this.state.incrementAnimationFrame();
    }, ANIMATION_INTERVAL);
  }

  private startTypewriter(): void {
    const bioLength = getBioLength();

    this.typewriterTimer = setInterval(() => {
      const state = this.state.getState();

      // Only run typewriter once
      if (!state.typewriterComplete && state.typewriterIndex < bioLength) {
        this.state.incrementTypewriter(TYPEWRITER_BATCH);
      } else if (!state.typewriterComplete) {
        // Typewriter finished, mark complete and stop timer
        this.state.setTypewriterComplete();
        if (this.typewriterTimer) {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
        }
        // Ensure chrome is shown even if the map reveal was fast
        this.revealChrome();
      }
    }, TYPEWRITER_INTERVAL);
  }

  private startCursorBlink(): void {
    this.cursorTimer = setInterval(() => {
      this.state.toggleCursor();
    }, CURSOR_BLINK_INTERVAL);
  }

  private startMapReveal(): void {
    const revealThreshold = Math.floor(MAP_LINE_COUNT * 0.5);

    this.mapRevealTimer = setInterval(() => {
      const state = this.state.getState();
      if (state.mapRevealIndex < MAP_LINE_COUNT) {
        this.state.incrementMapReveal();

        // Show chrome when map is about half revealed
        if (state.mapRevealIndex >= revealThreshold) {
          this.revealChrome();
        }
      } else {
        if (this.mapRevealTimer) {
          clearInterval(this.mapRevealTimer);
          this.mapRevealTimer = null;
        }
      }
    }, MAP_REVEAL_INTERVAL);
  }

  private transitionToMain(): void {
    // Hide loading screen
    if (this.loadingScreen) {
      this.loadingScreen.hide();
    }

    // Stop animation timer — only needed for loading spinner
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }

    // Setup main UI
    this.setupMainUI();
    this.state.setPhase("main");
  }

  private onStateChange(state: AppState): void {
    if (state.phase === "loading") {
      // Update loading screen animation
      if (this.loadingScreen) {
        updateLoadingScreen(this.loadingScreen, state.animationFrame, theme);
      }
    } else {
      // Always update about page (typewriter runs regardless of visibility)
      if (this.aboutPage) {
        updateAboutPage(
          this.aboutPage,
          theme,
          state.typewriterIndex,
          state.cursorVisible,
          state.mapRevealIndex
        );
      }

      // Update header once chrome is revealed
      if (this.uiRevealed && this.header) {
        updateHeader(this.header, theme);
      }
    }

    this.render();
  }

  private render(): void {
    if (this.destroyed) return;
    if (this.renderPending) return;
    this.renderPending = true;
    // Batch all state changes within the same tick into a single render
    queueMicrotask(() => {
      if (this.destroyed) return;
      this.renderPending = false;
      this.screen.render();
    });
  }

  destroy(options: { sendGoodbye?: boolean } = {}): void {
    if (this.destroyed) return;
    this.destroyed = true;

    const { sendGoodbye = true } = options;

    try {
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }
      if (this.animationTimer) {
        clearInterval(this.animationTimer);
        this.animationTimer = null;
      }
      if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
      }
      if (this.cursorTimer) {
        clearInterval(this.cursorTimer);
        this.cursorTimer = null;
      }
      if (this.mapRevealTimer) {
        clearInterval(this.mapRevealTimer);
        this.mapRevealTimer = null;
      }
      this.screen.destroy();
    } catch {
      // Screen may already be destroyed
    }

    // Reset terminal state and close the SSH stream
    if (!sendGoodbye) return;

    try {
      this.stream.write("\x1b[?25h"); // Show cursor
      this.stream.write("\x1b[0m"); // Reset text attributes
      this.stream.write("\x1b]112\x07"); // Reset terminal bg color
      this.stream.write("\x1b[2J"); // Clear screen
      this.stream.write("\x1b[H"); // Move cursor home
      this.stream.write("Goodbye!\r\n");
      this.stream.end();
    } catch {
      // Stream may already be closed
    }
  }
}
