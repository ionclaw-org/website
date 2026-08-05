// replaces bootstrap's collapse plugin for the faq accordion
export function initFaq() {
    const triggers = document.querySelectorAll(".faq-trigger");

    triggers.forEach((trigger) => {
        const selector = trigger.getAttribute("data-target");
        const panel = selector ? document.querySelector(selector) : null;

        if (!panel) {
            return;
        }

        trigger.addEventListener("click", () => {
            const open = panel.dataset.state === "open";

            panel.dataset.state = open ? "closed" : "open";
            trigger.setAttribute("aria-expanded", open ? "false" : "true");
        });
    });
}
