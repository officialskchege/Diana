import { mountApp } from "./pages/app/App.js";

const appRoot = document.getElementById("app");
if (!appRoot) {
  console.error("Failed to mount: #app element not found");
} else {
  mountApp(appRoot);
}
