import { describe, it, expect, beforeEach } from "bun:test";
import { StateManager } from "./state";

describe("StateManager", () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe("initial state", () => {
    it("should have correct default values", () => {
      const state = stateManager.getState();
      expect(state.phase).toBe("loading");
      expect(state.animationFrame).toBe(0);
      expect(state.typewriterIndex).toBe(0);
      expect(state.typewriterComplete).toBe(false);
      expect(state.cursorVisible).toBe(true);
      expect(state.mapRevealIndex).toBe(0);
    });

    it("should return a copy of state, not the original", () => {
      const state1 = stateManager.getState();
      const state2 = stateManager.getState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe("setPhase", () => {
    it("should set phase to main", () => {
      stateManager.setPhase("main");
      const state = stateManager.getState();
      expect(state.phase).toBe("main");
    });

    it("should notify listeners when phase changes", () => {
      let notified = false;
      stateManager.subscribe(() => {
        notified = true;
      });
      stateManager.setPhase("main");
      expect(notified).toBe(true);
    });
  });

  describe("incrementAnimationFrame", () => {
    it("should increment animation frame", () => {
      stateManager.incrementAnimationFrame();
      const state = stateManager.getState();
      expect(state.animationFrame).toBe(1);
    });

    it("should notify listeners", () => {
      let notified = false;
      stateManager.subscribe(() => {
        notified = true;
      });
      stateManager.incrementAnimationFrame();
      expect(notified).toBe(true);
    });
  });

  describe("incrementTypewriter", () => {
    it("should increment typewriter index", () => {
      stateManager.incrementTypewriter();
      const state = stateManager.getState();
      expect(state.typewriterIndex).toBe(1);
    });

    it("should notify listeners", () => {
      let notified = false;
      stateManager.subscribe(() => {
        notified = true;
      });
      stateManager.incrementTypewriter();
      expect(notified).toBe(true);
    });
  });

  describe("setTypewriterComplete", () => {
    it("should set typewriter complete to true", () => {
      expect(stateManager.getState().typewriterComplete).toBe(false);
      stateManager.setTypewriterComplete();
      expect(stateManager.getState().typewriterComplete).toBe(true);
    });

    it("should notify listeners", () => {
      let notified = false;
      stateManager.subscribe(() => {
        notified = true;
      });
      stateManager.setTypewriterComplete();
      expect(notified).toBe(true);
    });
  });

  describe("toggleCursor", () => {
    it("should toggle cursor visibility", () => {
      expect(stateManager.getState().cursorVisible).toBe(true);
      stateManager.toggleCursor();
      expect(stateManager.getState().cursorVisible).toBe(false);
      stateManager.toggleCursor();
      expect(stateManager.getState().cursorVisible).toBe(true);
    });

    it("should notify listeners", () => {
      let notified = false;
      stateManager.subscribe(() => {
        notified = true;
      });
      stateManager.toggleCursor();
      expect(notified).toBe(true);
    });
  });

  describe("incrementMapReveal", () => {
    it("should increment map reveal index", () => {
      stateManager.incrementMapReveal();
      const state = stateManager.getState();
      expect(state.mapRevealIndex).toBe(1);
    });

    it("should notify listeners", () => {
      let notified = false;
      stateManager.subscribe(() => {
        notified = true;
      });
      stateManager.incrementMapReveal();
      expect(notified).toBe(true);
    });
  });

  describe("subscribe", () => {
    it("should allow subscribing to state changes", () => {
      const receivedStates: ReturnType<StateManager["getState"]>[] = [];
      stateManager.subscribe((state) => {
        receivedStates.push(state);
      });

      stateManager.incrementTypewriter();

      expect(receivedStates.length).toBe(1);
      expect(receivedStates[0].typewriterIndex).toBe(1);
    });

    it("should return unsubscribe function", () => {
      let callCount = 0;
      const unsubscribe = stateManager.subscribe(() => {
        callCount++;
      });

      stateManager.incrementTypewriter();
      expect(callCount).toBe(1);

      unsubscribe();
      stateManager.incrementTypewriter();
      expect(callCount).toBe(1);
    });

    it("should support multiple listeners", () => {
      let count1 = 0;
      let count2 = 0;

      stateManager.subscribe(() => {
        count1++;
      });
      stateManager.subscribe(() => {
        count2++;
      });

      stateManager.incrementTypewriter();

      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });
  });
});
