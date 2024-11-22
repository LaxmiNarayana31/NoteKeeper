const { exec } = require("child_process");

// Start the backend
const startBackend = exec("npm run start", { cwd: "./backend" });

// Start the frontend
const startFrontend = exec("npm run dev", { cwd: "./frontend/notes-app" });

// Log any output from the backend process
startBackend.stdout.on("data", (data) => {
  console.log(`Backend: ${data}`);
});

startBackend.stderr.on("data", (data) => {
  console.error(`Backend Error: ${data}`);
});

// Log any output from the frontend process
startFrontend.stdout.on("data", (data) => {
  console.log(`Frontend: ${data}`);
});

startFrontend.stderr.on("data", (data) => {
  console.error(`Frontend Error: ${data}`);
});
