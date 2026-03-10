// close mobile nav on anchor link click
document.querySelectorAll('.navbar-nav .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
        var navbarCollapse = document.getElementById('navbarCollapse');

        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            var bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);

            if (bsCollapse) {
                bsCollapse.hide();
            }
        }
    });
});

// pwa
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/assets/js/service-worker.js');
    });
}
