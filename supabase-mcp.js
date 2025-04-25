#!/usr/bin/env node

const { spawn } = require("child_process");

// Set environment variables
process.env.SUPABASE_URL = "https://odczsrlxpvpxygpkfasg.supabase.co";
process.env.SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kY3pzcmx4cHZweHlncGtmYXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDk4NjMsImV4cCI6MjA1OTYyNTg2M30.5JcsH1ISZ9r_0nagP82AZeASX2VnKt23z5BSxYsqyd8";

// Start the MCP server
const server = spawn("node", ["supabase-mcp-server.js"], {
  stdio: "inherit",
  shell: true,
});

server.on("error", (err) => {
  console.error("Failed to start server:", err);
});

server.on("close", (code) => {
  console.log(`Server exited with code ${code}`);
});
