import { spawn } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const DIST_PATH = join(rootDir, "dist");

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

function log(prefix, color, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

async function main() {
  console.log("\n");
  console.log(`${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║      AZIENDE PLATFORM - PREVIEW SERVER     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}`);
  console.log("\n");

  if (!existsSync(DIST_PATH)) {
    log("ERROR", colors.red, "Build not found! Run 'npm run build' first.");
    process.exit(1);
  }

  log("INFO", colors.green, "Starting preview server...");
  log("INFO", colors.yellow, "Server will be available at: http://localhost:4173");
  console.log("\n");

  const proc = spawn("npx", ["serve", "-s", DIST_PATH, "-l", "4173"], {
    cwd: rootDir,
    shell: true,
    stdio: "inherit",
  });

  proc.on("error", (err) => {
    log("ERROR", colors.red, `Error: ${err.message}`);
  });

  process.on("SIGINT", () => {
    log("INFO", colors.yellow, "Shutting down...");
    proc.kill();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    proc.kill();
    process.exit(0);
  });
}

main();
