import { createSSHServer } from "./server";

const PORT = parseInt(process.env.PORT || "2222", 10);

console.log("Starting SSH Terminal Website...");

const server = createSSHServer(PORT);

// Graceful shutdown
let shuttingDown = false;

function shutdown(): void {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log("\nShutting down...");
  const forceExit = setTimeout(() => {
    process.exit(0);
  }, 2000);

  server.close(() => {
    clearTimeout(forceExit);
    console.log("Server closed");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
