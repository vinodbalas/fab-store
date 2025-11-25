import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill for Node.js globals in browser environment
if (typeof global === "undefined") {
  window.global = window;
}
if (typeof process === "undefined") {
  window.process = { 
    env: {},
    version: '',
    versions: {},
    platform: 'browser',
    nextTick: (fn) => setTimeout(fn, 0)
  };
}
// Buffer polyfill for browser
if (typeof Buffer === "undefined") {
  window.Buffer = {
    isBuffer: () => false,
    from: (data) => new Uint8Array(data),
    alloc: (size) => new Uint8Array(size),
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

