// the initial theme is resolved inline in <head> to avoid a flash of the wrong
// colors, so this only handles switching it afterwards
export function initTheme() {
    const toggle = document.querySelector(".theme-toggle");

    if (!toggle) {
        return;
    }

    toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    });
}
