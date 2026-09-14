import React from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { MenuProvider } from "./MenuProvider";
import { installAnalytics } from "./lib/analytics";
import { MotionConfig } from "framer-motion";

import "./tokens.css";
import "./styles.css";
import "./utility.css";
import "./polish.css";
import "./sunset.css";
import "./accessibility.css";
import "./hero-journey.css";
import "./menu-refinement.css";
import "./commerce.css";
import "./responsive.css";
import "./spring.css";
import "./mobile/native.css";
import "./system.css";
import { installViewportFit } from "./viewportFit";

installViewportFit();
installAnalytics(import.meta.env.VITE_GTM_ID);
registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <React.StrictMode><MotionConfig reducedMotion="user"><MenuProvider><App /></MenuProvider></MotionConfig></React.StrictMode>,
);

