#!/usr/bin/env node
const { watch } = require("chokidar");
const { exec } = require("child_process");
const liveServer = require("live-server");

let building = false;
let queued = false;

function rebuild() {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  const start = Date.now();
  exec("node build.js", (err, stdout, stderr) => {
    building = false;
    if (err) {
      console.error("Build failed:", stderr || err.message);
    } else {
      console.log(`Rebuilt in ${Date.now() - start}ms`);
    }
    if (queued) {
      queued = false;
      rebuild();
    }
  });
}

// Initial build
rebuild();

// Watch source files
watch(["gui/**/*", "themes/**/*", "docs/**/*"], {
  ignoreInitial: true,
}).on("all", (event, path) => {
  console.log(`${event}: ${path}`);
  rebuild();
});

// Serve dist/
liveServer.start({
  root: "dist",
  port: 3000,
  open: true,
  wait: 500,
  logLevel: 1,
});
