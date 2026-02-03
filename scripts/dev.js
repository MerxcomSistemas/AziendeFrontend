import { spawn } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const EDITOR_PATH = join(rootDir, "AziendePlatformEditor");
const HOST_PATH = join(rootDir, "Starterkit - ts");

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

function startProcess(name, cwd, command, args, color) {
  log(name, color, `Starting in ${cwd}`);

  const proc = spawn(command, args, {
    cwd,
    shell: true,
    stdio: "pipe",
  });

  proc.stdout.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        log(name, color, line);
      }
    });
  });

  proc.stderr.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        log(name, colors.red, line);
      }
    });
  });

  proc.on("error", (err) => {
    log(name, colors.red, `Error: ${err.message}`);
  });

  proc.on("close", (code) => {
    log(name, color, `Process exited with code ${code}`);
  });

  return proc;
}

async function main() {
  const editorExists = existsSync(EDITOR_PATH);
  const hostExists = existsSync(HOST_PATH);

  console.log("\n");
  console.log(`${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║     AZIENDE MICRO-FRONTENDS DEV SERVER     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}`);
  console.log("\n");

  if (!hostExists) {
    log("ERROR", colors.red, "Host project (Starterkit - ts) not found!");
    process.exit(1);
  }

  const processes = [];

  // Start Editor first (remote) if it exists
  if (editorExists) {
    log("INFO", colors.green, "Editor project found - starting remote...");
    log("INFO", colors.yellow, "Editor will be available at: http://localhost:5021");

    const editorProc = startProcess(
      "EDITOR",
      EDITOR_PATH,
      "npm",
      ["run", "dev"],
      colors.magenta
    );
    processes.push(editorProc);

    // Wait a bit for editor to start before starting host
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } else {
    log("INFO", colors.yellow, "Editor project not found - running host only");
    log("INFO", colors.yellow, "To enable the /editor route, clone AziendePlatformEditor");
  }

  // Start Host
  log("INFO", colors.green, "Starting host application...");
  log("INFO", colors.yellow, "Host will be available at: http://localhost:5000");

  const hostProc = startProcess(
    "HOST",
    HOST_PATH,
    "npm",
    ["run", "dev"],
    colors.cyan
  );
  processes.push(hostProc);

  console.log("\n");
  log("INFO", colors.green, "Development servers starting...");
  console.log("\n");
  log("INFO", colors.cyan, "===========================================");
  log("INFO", colors.green, "  App disponible en: http://localhost:5000");
  if (editorExists) {
    log("INFO", colors.green, "  Editor en:         http://localhost:5000/editor/");
    log("INFO", colors.green, "  Viewer en:         http://localhost:5000/viewer/");
  }
  log("INFO", colors.cyan, "===========================================");
  if (editorExists) {
    log("INFO", colors.yellow, "  (Editor interno corriendo en puerto 5021)");
  }
  console.log("\n");
  log("INFO", colors.yellow, "Press Ctrl+C to stop all servers");
  console.log("\n");

  // Handle exit
  process.on("SIGINT", () => {
    log("INFO", colors.yellow, "Shutting down...");
    processes.forEach((proc) => proc.kill());
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    processes.forEach((proc) => proc.kill());
    process.exit(0);
  });
}

main();
