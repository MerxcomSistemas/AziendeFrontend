import { execSync } from "child_process";
import { existsSync, cpSync, rmSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const EDITOR_PATH = join(rootDir, "AziendePlatformEditor");
const HOST_PATH = join(rootDir, "Starterkit - ts");
const OUTPUT_PATH = join(rootDir, "dist");

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

function runCommand(command, cwd, name) {
  log(name, colors.cyan, `Running: ${command}`);
  try {
    execSync(command, { cwd, stdio: "inherit" });
    return true;
  } catch (error) {
    log(name, colors.red, `Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("\n");
  console.log(`${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║       AZIENDE PLATFORM - BUILD SCRIPT      ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}`);
  console.log("\n");

  const editorExists = existsSync(EDITOR_PATH);
  const hostExists = existsSync(HOST_PATH);

  if (!hostExists) {
    log("ERROR", colors.red, "Host project (Starterkit - ts) not found!");
    process.exit(1);
  }

  // Clean previous build
  if (existsSync(OUTPUT_PATH)) {
    log("BUILD", colors.yellow, "Cleaning previous build...");
    rmSync(OUTPUT_PATH, { recursive: true, force: true });
  }
  mkdirSync(OUTPUT_PATH, { recursive: true });

  // Step 1: Build Editor (if exists)
  if (editorExists) {
    log("BUILD", colors.magenta, "Building Editor...");
    if (!runCommand("npm run build", EDITOR_PATH, "EDITOR")) {
      log("ERROR", colors.red, "Editor build failed!");
      process.exit(1);
    }
    log("EDITOR", colors.green, "Build completed!");
  } else {
    log("BUILD", colors.yellow, "Editor project not found, skipping...");
  }

  // Step 2: Build Host
  log("BUILD", colors.cyan, "Building Host...");
  if (!runCommand("npm run build", HOST_PATH, "HOST")) {
    log("ERROR", colors.red, "Host build failed!");
    process.exit(1);
  }
  log("HOST", colors.green, "Build completed!");

  // Step 3: Copy Host build to output
  log("BUILD", colors.yellow, "Copying Host build to output...");
  const hostDistPath = join(HOST_PATH, "dist");
  if (existsSync(hostDistPath)) {
    cpSync(hostDistPath, OUTPUT_PATH, { recursive: true });
    log("BUILD", colors.green, "Host copied to dist/");
  }

  // Step 4: Copy Editor build to output/editor (if exists)
  if (editorExists) {
    log("BUILD", colors.yellow, "Copying Editor build to output/editor...");
    const editorDistPath = join(EDITOR_PATH, "dist");
    const editorOutputPath = join(OUTPUT_PATH, "editor");

    if (existsSync(editorDistPath)) {
      mkdirSync(editorOutputPath, { recursive: true });
      cpSync(editorDistPath, editorOutputPath, { recursive: true });
      log("BUILD", colors.green, "Editor copied to dist/editor/");
    }
  }

  console.log("\n");
  console.log(`${colors.green}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.green}║            BUILD SUCCESSFUL!               ║${colors.reset}`);
  console.log(`${colors.green}╚════════════════════════════════════════════╝${colors.reset}`);
  console.log("\n");
  log("INFO", colors.green, `Output directory: ${OUTPUT_PATH}`);
  log("INFO", colors.green, "Structure:");
  log("INFO", colors.cyan, "  dist/");
  log("INFO", colors.cyan, "  ├── index.html      (Host)");
  log("INFO", colors.cyan, "  ├── assets/         (Host assets)");
  if (editorExists) {
    log("INFO", colors.cyan, "  └── editor/         (Editor app)");
    log("INFO", colors.cyan, "      ├── index.html");
    log("INFO", colors.cyan, "      └── assets/");
  }
  console.log("\n");
  log("INFO", colors.yellow, "To preview: npx serve dist");
  console.log("\n");
}

main();
