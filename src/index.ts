import { createSSHServer } from "./server";

const PORT = parseInt(process.env.PORT || "2222", 10);

console.log("Starting SSH Terminal Website...");

const server = createSSHServer(PORT);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\nShutting down...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
