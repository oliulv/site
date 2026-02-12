import { Server, type ServerConfig } from "ssh2";
import fs from "fs";
import path from "path";
import { App } from "./app";

const HOST_KEY_PATH = path.join(process.cwd(), "host.key");

interface PtyInfo {
  cols: number;
  rows: number;
  width: number;
  height: number;
  term: string;
}

interface ExtendedStream extends NodeJS.WritableStream {
  rows?: number;
  columns?: number;
}

function generateHostKey(): string {
  // Check if host key exists
  if (fs.existsSync(HOST_KEY_PATH)) {
    const key = fs.readFileSync(HOST_KEY_PATH, "utf8");
    if (!key || key.trim().length === 0) {
      console.error(
        "Host key file is empty. Please regenerate: bun run generate-key"
      );
      process.exit(1);
    }
    return key;
  }

  // Generate a new key using ssh-keygen
  console.log("Generating new ED25519 host key...");
  console.log("Run: bun run generate-key");
  console.log("Then restart the server.");
  process.exit(1);
}

export function createSSHServer(port: number): Server {
  const hostKey = generateHostKey();

  const serverConfig: ServerConfig = {
    hostKeys: [hostKey],
  };

  const server = new Server(serverConfig, (client) => {
    console.log("Client connected");

    let ptyInfo: PtyInfo | null = null;
    let app: App | null = null;

    client.on("authentication", (ctx) => {
      // Accept all connections (guest mode)
      ctx.accept();
    });

    client.on("ready", () => {
      console.log("Client authenticated");

      client.on("session", (accept) => {
        const session = accept();

        session.on("pty", (accept, _reject, info) => {
          ptyInfo = {
            cols: info.cols,
            rows: info.rows,
            width: info.width,
            height: info.height,
            term: "xterm-256color",
          };
          accept?.();
        });

        session.on("shell", (accept) => {
          if (!ptyInfo) {
            console.log("No PTY allocated, using defaults");
            ptyInfo = {
              cols: 80,
              rows: 24,
              width: 640,
              height: 480,
              term: "xterm-256color",
            };
          }

          const stream = accept();
          const extStream = stream as ExtendedStream;

          // Critical: Set dimensions on stream before creating blessed screen
          extStream.rows = ptyInfo.rows;
          extStream.columns = ptyInfo.cols;
          stream.emit("resize");

          // Create the app
          app = new App(stream);

          // Handle window resize
          session.on("window-change", (_accept, _reject, info) => {
            extStream.rows = info.rows;
            extStream.columns = info.cols;
            stream.emit("resize");
          });

          // Clean up if stream closes (client disconnect)
          stream.on("close", () => {
            if (app) {
              app.destroy();
              app = null;
            }
          });

          stream.on("end", () => {
            if (app) {
              app.destroy();
              app = null;
            }
          });
        });
      });
    });

    client.on("close", () => {
      console.log("Client disconnected");
      if (app) {
        app.destroy();
        app = null;
      }
    });

    client.on("error", (err) => {
      console.error("Client error:", err.message);
    });
  });

  server.on("error", (err: Error) => {
    console.error("Server error:", err.message);
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`SSH server listening on port ${port}`);
    console.log(`Connect with: ssh -p ${port} localhost`);
  });

  return server;
}
