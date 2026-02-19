import { useCallback, useEffect, useRef, useState } from "react";
import { bio } from "../content/bio";
import { ukMap } from "../content/ascii-maps";
import { links } from "../content/links";

type AppPhase = "loading" | "main";
type PageName = "about" | "links";

const TYPEWRITER_INTERVAL = 30;
const TYPEWRITER_BATCH = 6;
const CURSOR_BLINK_INTERVAL = 500;
const MAP_REVEAL_INTERVAL = 40;
const LOADING_DURATION = 1500;
const SPINNER_INTERVAL = 80;

const MAP_LINE_COUNT = ukMap.split("\n").length;
const BIO_LENGTH = bio.length;

export function useAppState() {
  const [phase, setPhase] = useState<AppPhase>("loading");
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [currentPage, setCurrentPage] = useState<PageName>("about");
  const [selectedNavIndex, setSelectedNavIndex] = useState(0);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [mapRevealIndex, setMapRevealIndex] = useState(0);
  const [selectedLinkIndex, setSelectedLinkIndex] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [navigationEnabled, setNavigationEnabled] = useState(false);

  const typewriterCompleteRef = useRef(false);

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
          if (!typewriterCompleteRef.current) {
            typewriterCompleteRef.current = true;
            setTypewriterComplete(true);
            setChromeVisible(true);
            setNavigationEnabled(true);
          }
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

  // Page navigation
  const navigate = useCallback(
    (direction: "left" | "right") => {
      if (!navigationEnabled) return;
      const pages: PageName[] = ["about", "links"];
      const currentIndex = pages.indexOf(currentPage);
      let newIndex: number;
      if (direction === "left") {
        newIndex = currentIndex === 0 ? pages.length - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === pages.length - 1 ? 0 : currentIndex + 1;
      }
      setCurrentPage(pages[newIndex]!);
      setSelectedNavIndex(newIndex);
    },
    [navigationEnabled, currentPage],
  );

  const moveLinkSelection = useCallback(
    (direction: "up" | "down") => {
      if (currentPage !== "links" || links.length === 0) return;
      setSelectedLinkIndex((prev) => {
        const delta = direction === "down" ? 1 : -1;
        return (prev + delta + links.length) % links.length;
      });
    },
    [currentPage],
  );

  // Keyboard bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        navigate(e.shiftKey ? "left" : "right");
        return;
      }
      if (currentPage === "links") {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          moveLinkSelection("up");
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          moveLinkSelection("down");
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const link = links[selectedLinkIndex];
          if (link) {
            window.open(link.url, "_blank", "noopener,noreferrer");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, moveLinkSelection, currentPage, selectedLinkIndex]);

  return {
    phase,
    spinnerFrame,
    currentPage,
    selectedNavIndex,
    typewriterIndex,
    typewriterComplete,
    cursorVisible,
    mapRevealIndex,
    selectedLinkIndex,
    setSelectedLinkIndex,
    chromeVisible,
    navigationEnabled,
    navigate,
    setCurrentPage: (page: PageName) => {
      if (!navigationEnabled) return;
      setCurrentPage(page);
      setSelectedNavIndex(page === "about" ? 0 : 1);
    },
  };
}
