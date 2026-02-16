export type PageName = "about" | "links";
export type AppPhase = "loading" | "main";

export interface AppState {
  phase: AppPhase;
  currentPage: PageName;
  selectedNavIndex: number;
  animationFrame: number;
  typewriterIndex: number;
  typewriterComplete: boolean;
  cursorVisible: boolean;
  mapRevealIndex: number;
}

type Listener = (state: AppState) => void;

export class StateManager {
  private state: AppState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = {
      phase: "loading",
      currentPage: "about",
      selectedNavIndex: 0,
      animationFrame: 0,
      typewriterIndex: 0,
      typewriterComplete: false,
      cursorVisible: true,
      mapRevealIndex: 0,
    };
  }

  getState(): AppState {
    return { ...this.state };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  setPhase(phase: AppPhase): void {
    this.state.phase = phase;
    this.notify();
  }

  navigate(direction: "left" | "right"): void {
    const pages: PageName[] = ["about", "links"];
    const currentIndex = pages.indexOf(this.state.currentPage);

    let newIndex: number;
    if (direction === "left") {
      newIndex = currentIndex === 0 ? pages.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === pages.length - 1 ? 0 : currentIndex + 1;
    }

    this.state.currentPage = pages[newIndex];
    this.state.selectedNavIndex = newIndex;
    this.notify();
  }

  incrementAnimationFrame(): void {
    this.state.animationFrame = (this.state.animationFrame + 1) % 100000;
    this.notify();
  }

  incrementTypewriter(amount: number = 1): void {
    this.state.typewriterIndex += amount;
    this.notify();
  }

  setTypewriterComplete(): void {
    this.state.typewriterComplete = true;
    this.notify();
  }

  toggleCursor(): void {
    this.state.cursorVisible = !this.state.cursorVisible;
    this.notify();
  }

  incrementMapReveal(): void {
    this.state.mapRevealIndex++;
    this.notify();
  }
}
