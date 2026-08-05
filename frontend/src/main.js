import "./main.css";

import { initFaq } from "./faq.js";
import { initMarketplace } from "./marketplace.js";
import { initNavbar } from "./navbar.js";
import { initTheme } from "./theme.js";

initTheme();
initNavbar();
initFaq();
initMarketplace();

// pwa
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        void navigator.serviceWorker.register("/static/js/service-worker.js");
    });
}
