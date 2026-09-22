import { useEffect, useState } from "react";
import { bio } from "../content/bio";
import { ukMap } from "../content/ascii-maps";

type AppPhase = "loading" | "main";

const TYPEWRITER_INTERVAL = 15;
const TYPEWRITER_BATCH = 6;
const CURSOR_BLINK_INTERVAL = 500;
const MAP_REVEAL_INTERVAL = 40;
const LOADING_DURATION = 750;
const SPINNER_INTERVAL = 80;

const MAP_LINE_COUNT = ukMap.split("\n").length;
const BIO_LENGTH = bio.length;

export function useAppState() {
  const [phase, setPhase] = useState<AppPhase>("loading");
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [mapRevealIndex, setMapRevealIndex] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(false);

  // Loading phase: spinner animation
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setInterval(() => {
      setSpinnerFrame((f) => f + 1);
    }, SPINNER_INTERVAL);
    return () => clearInterval(timer);
  }, [phase]);

  // Loading → main transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("main");
    }, LOADING_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // Main phase: typewriter
  useEffect(() => {
    if (phase !== "main") return;
    const timer = setInterval(() => {
      setTypewriterIndex((prev) => {
        if (prev >= BIO_LENGTH) {
          // Typewriter finished — ensure chrome is shown even if the map was fast
          setChromeVisible(true);
          clearInterval(timer);
          return prev;
        }
        return Math.min(prev + TYPEWRITER_BATCH, BIO_LENGTH);
      });
    }, TYPEWRITER_INTERVAL);
    return () => clearInterval(timer);
  }, [phase]);

  // Main phase: cursor blink
  useEffect(() => {
    if (phase !== "main") return;
    const timer = setInterval(() => {
      setCursorVisible((v) => !v);
    }, CURSOR_BLINK_INTERVAL);
    return () => clearInterval(timer);
  }, [phase]);

  // Main phase: map reveal
  useEffect(() => {
    if (phase !== "main") return;
    const revealThreshold = Math.floor(MAP_LINE_COUNT * 0.5);
    const timer = setInterval(() => {
      setMapRevealIndex((prev) => {
        const next = prev + 1;
        if (next >= revealThreshold) {
          setChromeVisible(true);
        }
        if (next >= MAP_LINE_COUNT) {
          clearInterval(timer);
        }
        return next;
      });
    }, MAP_REVEAL_INTERVAL);
    return () => clearInterval(timer);
  }, [phase]);

  return {
    phase,
    spinnerFrame,
    typewriterIndex,
    cursorVisible,
    mapRevealIndex,
    chromeVisible,
  };
}
