import blessed from "blessed";
import type { Duplex } from "stream";
import { StateManager, type AppState } from "./state";
import { links } from "./content/links";
import { createScreen } from "./ui/screen";
import { theme } from "./ui/themes";
import { createHeader, updateHeader } from "./ui/components/header";
import { createFooter, updateFooter } from "./ui/components/footer";
import { getAnimatedContent } from "./ui/components/animated-text";
import {
  createAboutPage,
  updateAboutPage,
  getBioLength,
  MAP_LINE_COUNT,
} from "./ui/components/about-page";
import { createLinksPage, updateLinksPage } from "./ui/components/links-page";
import {
  createLoadingScreen,
  updateLoadingScreen,
} from "./ui/components/loading-screen";

interface FlashBox extends blessed.Widgets.BoxElement {
  _flashBox?: blessed.Widgets.BoxElement;
}

const VERSION = "0.0.1";
const ANIMATION_INTERVAL = 100;
const TYPEWRITER_INTERVAL = 45;
const TYPEWRITER_BATCH = 3;
const CURSOR_BLINK_INTERVAL = 500;
const MAP_REVEAL_INTERVAL = 50; // ~50ms per line = ~1.2s for full map
const LOADING_DURATION = 2000;

export class App {
  private screen: blessed.Widgets.Screen;
  private state: StateManager;
  private animationTimer: ReturnType<typeof setInterval> | null = null;
  private typewriterTimer: ReturnType<typeof setInterval> | null = null;
  private cursorTimer: ReturnType<typeof setInterval> | null = null;
  private mapRevealTimer: ReturnType<typeof setInterval> | null = null;

  // UI Components
  private loadingScreen: blessed.Widgets.BoxElement | null = null;
  private header: blessed.Widgets.BoxElement | null = null;
  private footer: blessed.Widgets.BoxElement | null = null;
  private aboutPage: blessed.Widgets.BoxElement | null = null;
  private linksPage: blessed.Widgets.BoxElement | null = null;
  private selectedLinkIndex = 0;

  private stream: Duplex;

  constructor(stream: Duplex) {
    this.stream = stream;
    this.state = new StateManager();
    this.screen = createScreen({ stream });

    // Set terminal background via OSC escape sequence
    stream.write("\x1b]11;#1a1a1a\x07");

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
    setTimeout(() => {
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

    // Create header and footer — hidden initially, revealed partway through map
    this.header = createHeader({ parent: this.screen, theme });
    this.header.hide();

    this.footer = createFooter({
      parent: this.screen,
      theme,
      version: VERSION,
    });
    this.footer.hide();

    // Create links page (hidden until navigation)
    this.linksPage = createLinksPage({ parent: this.screen, theme });
    this.linksPage.hide();

    this.startTypewriter();
    this.startCursorBlink();
    this.startMapReveal();
  }

  /** Show header/footer chrome (called when map is ~half revealed) */
  private revealChrome(): void {
    if (this.uiRevealed) return;
    this.uiRevealed = true;
    if (this.header) this.header.show();
    if (this.footer) this.footer.show();
  }

  /** Enable navigation keys (called when typewriter finishes) */
  private enableNavigation(): void {
    this.setupKeyBindings();
  }

  private setupKeyBindings(): void {
    this.screen.key(["tab", "S-tab"], (_ch, key) => {
      this.state.navigate(key.shift ? "left" : "right");
    });

    this.screen.key(["up", "down"], (_ch, key) => {
      if (!this.isLinksPageActive()) return;
      this.moveLinkSelection(key.name as "up" | "down");
    });

    this.screen.key(["enter", "space"], () => {
      if (!this.isLinksPageActive()) return;
      this.openSelectedLink();
    });
  }

  private isLinksPageActive(): boolean {
    return this.state.getState().currentPage === "links";
  }

  private clampSelectedLinkIndex(): void {
    if (links.length === 0) {
      this.selectedLinkIndex = 0;
      return;
    }
    this.selectedLinkIndex = Math.min(this.selectedLinkIndex, links.length - 1);
  }

  private moveLinkSelection(direction: "up" | "down"): void {
    if (!this.linksPage || links.length === 0) return;
    this.clampSelectedLinkIndex();
    const delta = direction === "down" ? 1 : -1;
    this.selectedLinkIndex =
      (this.selectedLinkIndex + delta + links.length) % links.length;
    updateLinksPage(this.linksPage, theme, this.selectedLinkIndex);
    this.render();
  }

  private openSelectedLink(): void {
    if (links.length === 0) return;
    this.clampSelectedLinkIndex();
    const selectedLink = links[this.selectedLinkIndex];
    if (!selectedLink) return;

    // iTerm2 URL opener (ignored by terminals that don't support it)
    const encodedUrl = Buffer.from(selectedLink.url, "utf8").toString("base64");
    this.stream.write(`\x1b]1337;OpenURL=:${encodedUrl}\x07`);

    // OSC 52: copy URL to the client's clipboard (widely supported)
    const clipboardPayload = Buffer.from(selectedLink.url, "utf8").toString("base64");
    this.stream.write(`\x1b]52;c;${clipboardPayload}\x07`);

    this.showFlash("Copied to clipboard");
  }

  private flashTimeout: ReturnType<typeof setTimeout> | null = null;

  private showFlash(message: string): void {
    if (!this.linksPage) return;

    // Clear any pending flash timeout
    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
    }

    // Show flash text in footer area of the links box
    const flashBox =
      (this.linksPage as FlashBox)._flashBox ??
      blessed.box({
        parent: this.linksPage,
        bottom: 0,
        left: 2,
        width: "shrink",
        height: 1,
        tags: true,
        style: { bg: theme.bg },
      });
    (this.linksPage as FlashBox)._flashBox = flashBox;

    flashBox.setContent(`{${theme.fgMuted}-fg}${message}{/${theme.fgMuted}-fg}`);
    flashBox.show();
    this.render();

    this.flashTimeout = setTimeout(() => {
      flashBox.hide();
      this.render();
      this.flashTimeout = null;
    }, 2000);
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

      // Only run typewriter once, regardless of current page
      if (!state.typewriterComplete && state.typewriterIndex < bioLength) {
        this.state.incrementTypewriter(TYPEWRITER_BATCH);
      } else if (!state.typewriterComplete) {
        // Typewriter finished, mark complete and stop timer
        this.state.setTypewriterComplete();
        if (this.typewriterTimer) {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
        }
        // Enable navigation (chrome already visible from map reveal)
        this.revealChrome(); // Ensure chrome is shown even if map was fast
        this.enableNavigation();
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

      // Update header/footer once chrome is revealed
      if (this.uiRevealed) {
        const animatedText = getAnimatedContent(state.animationFrame);

        if (this.header) {
          updateHeader(this.header, state, theme, animatedText);
        }

        if (this.footer) {
          updateFooter(this.footer, theme, state.currentPage === "links");
        }
      }

      // Handle page switching only after typewriter completes
      if (state.typewriterComplete) {
        if (this.aboutPage && this.linksPage) {
          if (state.currentPage === "about") {
            this.aboutPage.show();
            this.linksPage.hide();
          } else {
            this.aboutPage.hide();
            this.linksPage.show();
            this.clampSelectedLinkIndex();
            updateLinksPage(this.linksPage, theme, this.selectedLinkIndex);
          }
        }
      }
    }

    this.render();
  }

  private render(): void {
    this.screen.render();
  }

  destroy(): void {
    try {
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
      if (this.flashTimeout) {
        clearTimeout(this.flashTimeout);
        this.flashTimeout = null;
      }
      this.screen.destroy();
    } catch {
      // Screen may already be destroyed
    }

    // Reset terminal state and close the SSH stream
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
