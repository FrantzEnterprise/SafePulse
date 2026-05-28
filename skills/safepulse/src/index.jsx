import React from "react";
import { createRoot } from "react-dom/client";
import SafePulseDemo from "./SafePulseDemo.jsx";
import "./style.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = '<div style="color:red;padding:40px">Error: root element not found</div>';
} else {
  createRoot(rootElement).render(<SafePulseDemo />);
}
