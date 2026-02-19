interface FooterProps {
  linksPageActive: boolean;
}

export function Footer({ linksPageActive }: FooterProps) {
  return (
    <div className="footer">
      <span className="footer-sig">
        <span className="sig-accent">Oliver Ulvebne</span> // 2026 // 21
      </span>
      <span className="footer-shortcuts">
        {linksPageActive ? (
          <>
            <span className="shortcut-key">tab</span> page{"  "}
            <span className="shortcut-key">↑↓</span> select{"  "}
            <span className="shortcut-key">enter</span> open
          </>
        ) : (
          <>
            <span className="shortcut-key">tab</span> page
          </>
        )}
      </span>
    </div>
  );
}
