import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { MotionConfig } from "framer-motion";
import "./styles.css";
import "./utility.css";
import "./polish.css";
import "./sunset.css";
import "./accessibility.css";
import "./menu-refinement.css";
import "./commerce.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode><MotionConfig reducedMotion="user"><App /></MotionConfig></React.StrictMode>,
);
