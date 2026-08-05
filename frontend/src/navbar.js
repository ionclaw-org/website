// replaces bootstrap's collapse plugin for the mobile menu
export function initNavbar() {
    const toggler = document.querySelector(".navbar-toggler");
    const panel = document.getElementById("navbarCollapse");

    if (!toggler || !panel) {
        return;
    }

    const setState = (open) => {
        panel.dataset.state = open ? "open" : "closed";
        toggler.setAttribute("aria-expanded", open ? "true" : "false");
    };

    toggler.addEventListener("click", () => {
        setState(panel.dataset.state !== "open");
    });

    // close the mobile menu after navigating to an anchor
    panel.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            if (panel.dataset.state === "open") {
                setState(false);
            }
        });
    });
}
