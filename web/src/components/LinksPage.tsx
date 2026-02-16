import { links } from "../content/links";

const LABEL_WIDTH = 12;

interface LinksPageProps {
  selectedLinkIndex: number;
  onSelectLink: (index: number) => void;
}

export function LinksPage({ selectedLinkIndex, onSelectLink }: LinksPageProps) {
  const safeIndex = Math.min(
    Math.max(selectedLinkIndex, 0),
    Math.max(links.length - 1, 0),
  );
  const selectedLink = links[safeIndex];

  return (
    <div className="links-page">
      <div className="links-box">
        <div className="links-title">Links</div>
        <div className="links-list">
          {links.map((link, index) => {
            const isSelected = index === safeIndex;
            return (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`link-row ${isSelected ? "selected" : ""}`}
                onMouseEnter={() => onSelectLink(index)}
              >
                <span className="link-indicator">
                  {isSelected ? "❯" : "\u00A0"}
                </span>
                <span className="link-label">
                  {link.label.padEnd(LABEL_WIDTH, "\u00A0")}
                </span>
                <span className="link-value">{link.value}</span>
              </a>
            );
          })}
        </div>
        <div className="links-url">
          Open:{" "}
          <span className="links-url-value">{selectedLink?.url}</span>
        </div>
      </div>
    </div>
  );
}
