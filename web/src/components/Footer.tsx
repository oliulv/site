interface FooterProps {
  version: string;
  linksPageActive: boolean;
}

export function Footer({ version, linksPageActive }: FooterProps) {
  return (
    <div className="footer">
      <span className="footer-version">v{version}</span>
      <span className="footer-shortcuts">
        {linksPageActive ? (
          <>
            <span className="shortcut-key">tab</span> page{"  "}
            <span className="shortcut-key">↑↓</span> select{"  "}
            <span className="shortcut-key">enter/space</span> open
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
