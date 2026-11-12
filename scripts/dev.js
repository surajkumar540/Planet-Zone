/**
 * `npm run dev` from the repo root: starts the backend and the frontend
 * together, prefixing each line with where it came from. Ctrl+C stops both.
 * No dependencies, so the root needs no node_modules.
 */
const { spawn } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const apps = [
  { name: "backend ", dir: "backend", color: "\x1b[36m" },
  { name: "frontend", dir: "frontend", color: "\x1b[35m" },
];

const children = apps.map(({ name, dir, color }) => {
  const child = spawn(npm, ["run", "dev"], { cwd: path.join(root, dir), shell: process.platform === "win32" });
  const prefix = `${color}[${name}]\x1b[0m `;
  const pipe = (stream, out) => {
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();
      lines.forEach((line) => out.write(prefix + line + "\n"));
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on("exit", (code) => {
    process.stdout.write(`${prefix}stopped${code ? ` (exit ${code})` : ""}\n`);
    shutdown();
  });
  return child;
});

let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.exitCode === null && child.kill());
  setTimeout(() => process.exit(0), 300);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
