import { ukMap, londonPositions } from "../content/ascii-maps";
import { bio, bioLines } from "../content/bio";

const MAP_LINES = ukMap.split("\n");
const MAP_LINE_COUNT = MAP_LINES.length;
const BIO_WIDTH = 50;
const BULLET = "• ";
const INDENT = "  ";
const UNBULLETED_LINES = new Set(["Previously I have also:"]);

function wrapLine(line: string, width: number): string {
  if (line.length <= width) return line;
  const words = line.split(" ");
  const result: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (test.length > width && current) {
      result.push(current);
      current = INDENT + word;
    } else {
      current = test;
    }
  }
  if (current) result.push(current);
  return result.join("\n");
}

interface AboutPageProps {
  typewriterIndex: number;
  cursorVisible: boolean;
  mapRevealIndex: number;
}

export function AboutPage({
  typewriterIndex,
  cursorVisible,
  mapRevealIndex,
}: AboutPageProps) {
  const londonSet = new Set(londonPositions.map(([r, c]) => `${r},${c}`));

  const linesToShow = Math.min(mapRevealIndex, MAP_LINES.length);

  // Build map content
  const mapContent = MAP_LINES.slice(0, linesToShow).map((line, lineIdx) => {
    const chars: Array<{ ch: string; isLondon: boolean }> = [];
    let col = 0;
    for (const ch of line) {
      const isLondon = londonSet.has(`${lineIdx},${col}`);
      chars.push({
        // Override to full braille block for a solid 4×4 dot square
        ch: isLondon ? "⣿" : ch,
        isLondon,
      });
      col++;
    }
    return chars;
  });

  // Build bio text with typewriter
  const visibleText = bio.substring(0, typewriterIndex);
  const lines = visibleText.split("\n");
  const bulletText = lines
    .map((line, index) => {
      if (!line.trim()) return "";
      if (UNBULLETED_LINES.has((bioLines[index] ?? "").trim())) {
        return wrapLine(line.trim(), BIO_WIDTH);
      }
      return wrapLine(BULLET + line, BIO_WIDTH);
    })
    .join("\n");

  const showLocationLabel = mapRevealIndex >= MAP_LINE_COUNT;

  return (
    <div className="about-page">
      <div className="about-map">
        <pre className="map-pre">
          {mapContent.map((lineChars, lineIdx) => (
            <span key={lineIdx}>
              {lineChars.map((c, charIdx) =>
                c.isLondon ? (
                  <span key={charIdx} className="london">
                    {c.ch}
                  </span>
                ) : (
                  c.ch
                )
              )}
              {"\n"}
            </span>
          ))}
        </pre>
        {showLocationLabel && (
          <div className="location-label">
            <span className="location-label-text">[London]</span>
          </div>
        )}
      </div>
      <div className="about-bio">
        <pre className="bio-pre">
          {bulletText}
          <span className={`cursor ${cursorVisible ? "visible" : "hidden"}`}>
            █
          </span>
        </pre>
      </div>
    </div>
  );
}
