import { marked } from "marked";

let skillsData = null;

// -----------------------------------------------------------------------------
function escapeHtml(text) {
    if (!text) {
        return "";
    }

    const div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// -----------------------------------------------------------------------------
function stripFrontmatter(text) {
    if (!text.startsWith("---")) {
        return text;
    }

    const end = text.indexOf("---", 3);

    if (end === -1) {
        return text;
    }

    return text.substring(end + 3).trim();
}

// -----------------------------------------------------------------------------
function createSkillCard(skill) {
    const name = escapeHtml(skill.name);

    let readmeHtml = "";

    if (skill["readme-url"]) {
        readmeHtml =
            '<button type="button" class="btn btn-outline-brand" data-modal-url="' +
            escapeHtml(skill["readme-url"]) +
            '" data-modal-title="' +
            name +
            '"><i class="bi bi-book mr-1"></i>Read</button>';
    }

    let licenseHtml = "";

    if (skill.license) {
        licenseHtml =
            '<button type="button" class="btn btn-outline-brand" data-modal-url="' +
            escapeHtml(skill.license) +
            '" data-modal-title="' +
            name +
            ' — License"><i class="bi bi-file-text mr-1"></i>License</button>';
    }

    return (
        '<div class="skill-card">' +
        '<div class="skill-card-header">' +
        '<div class="icon-box"><i class="bi bi-lightning"></i></div>' +
        "<h3>" +
        name +
        "</h3>" +
        "</div>" +
        '<span class="skill-card-source">' +
        escapeHtml(skill.source) +
        "</span>" +
        '<p class="skill-card-description">' +
        escapeHtml(skill.description) +
        "</p>" +
        '<div class="skill-card-actions">' +
        '<a href="' +
        escapeHtml(skill["download-url"]) +
        '" class="btn btn-primary"><i class="bi bi-download mr-1"></i>Download</a>' +
        readmeHtml +
        licenseHtml +
        "</div>" +
        "</div>"
    );
}

// -----------------------------------------------------------------------------
export function initMarketplace() {
    const searchInput = document.getElementById("skills-search");
    const skillsGrid = document.getElementById("skills-grid");

    if (!searchInput || !skillsGrid) {
        return;
    }

    const skillsLoading = document.getElementById("skills-loading");
    const skillsInitial = document.getElementById("skills-initial");
    const skillsEmpty = document.getElementById("skills-empty");
    const skillsError = document.getElementById("skills-error");
    const skillsTotalCount = document.getElementById("skills-total-count");

    const modal = document.getElementById("skill-modal");
    const modalTitle = document.getElementById("skill-modal-title");
    const modalBody = document.getElementById("skill-modal-body");

    let debounceTimer = null;

    // ---------------------------------------------------------------------
    function openModal(url, name) {
        modalTitle.textContent = name;
        modalBody.innerHTML =
            '<div class="py-4 text-center"><span class="spinner"></span></div>';
        modal.dataset.state = "open";
        document.body.style.overflow = "hidden";

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch");
                }

                return response.text();
            })
            .then((text) => {
                modalBody.innerHTML =
                    '<div class="skill-modal-markdown">' +
                    marked.parse(stripFrontmatter(text)) +
                    "</div>";
            })
            .catch(() => {
                modalBody.innerHTML =
                    '<div class="py-4 text-center"><p>Failed to load content.</p></div>';
            });
    }

    // ---------------------------------------------------------------------
    function closeModal() {
        modal.dataset.state = "closed";
        document.body.style.overflow = "";
    }

    // ---------------------------------------------------------------------
    function showInitial() {
        skillsGrid.style.display = "none";
        skillsEmpty.style.display = "none";
        skillsInitial.style.display = "block";
    }

    // ---------------------------------------------------------------------
    function renderSkills(skills) {
        skillsInitial.style.display = "none";

        if (skills.length === 0) {
            skillsGrid.style.display = "none";
            skillsEmpty.style.display = "block";
            return;
        }

        skillsEmpty.style.display = "none";
        skillsGrid.style.display = "grid";
        skillsGrid.innerHTML = skills.map(createSkillCard).join("");
    }

    // ---------------------------------------------------------------------
    function filterSkills(query) {
        if (!skillsData) {
            return;
        }

        const terms = query.toLowerCase().trim();

        if (terms === "") {
            showInitial();
            return;
        }

        const nameMatches = [];
        const otherMatches = [];

        skillsData.forEach((skill) => {
            const name = (skill.name || "").toLowerCase();
            const description = (skill.description || "").toLowerCase();
            const source = (skill.source || "").toLowerCase();

            if (name.includes(terms)) {
                nameMatches.push(skill);
            } else if (description.includes(terms) || source.includes(terms)) {
                otherMatches.push(skill);
            }
        });

        renderSkills(nameMatches.concat(otherMatches));
    }

    // ---------------------------------------------------------------------
    function findSkillByName(name) {
        if (!skillsData) {
            return null;
        }

        const lower = name.toLowerCase().trim();
        const parts = lower.split("/");

        // format: source/name
        if (parts.length === 2) {
            const found = skillsData.find(
                (skill) =>
                    (skill.name || "").toLowerCase() === parts[1] &&
                    (skill.source || "").toLowerCase() === parts[0],
            );

            if (found) {
                return found;
            }
        }

        // format: name only
        return (
            skillsData.find(
                (skill) => (skill.name || "").toLowerCase() === lower,
            ) || null
        );
    }

    // ---------------------------------------------------------------------
    function applyQueryString() {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        const skillName = params.get("skill");

        if (skillName) {
            const skill = findSkillByName(skillName);

            if (skill && skill["readme-url"]) {
                openModal(skill["readme-url"], skill.name);
            }

            if (skill) {
                searchInput.value = skill.name;
                filterSkills(skill.name);
            } else {
                const searchTerm = skillName.includes("/")
                    ? skillName.split("/").pop()
                    : skillName;

                searchInput.value = searchTerm;
                filterSkills(searchTerm);
            }
        } else if (q) {
            searchInput.value = q;
            filterSkills(q);
        } else {
            showInitial();
        }
    }

    // open the readme/license modal from any generated card button
    skillsGrid.addEventListener("click", (event) => {
        const button = event.target.closest("[data-modal-url]");

        if (button) {
            openModal(button.dataset.modalUrl, button.dataset.modalTitle);
        }
    });

    modal.querySelectorAll("[data-modal-close]").forEach((element) => {
        element.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.dataset.state === "open") {
            closeModal();
        }
    });

    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => filterSkills(searchInput.value), 200);
    });

    fetch("/marketplace-data.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch skills");
            }

            return response.json();
        })
        .then((data) => {
            skillsData = data.skills || [];
            skillsLoading.style.display = "none";
            skillsTotalCount.innerHTML =
                "Currently <strong>" +
                skillsData.length +
                "</strong> skills available.";
            applyQueryString();
        })
        .catch(() => {
            skillsLoading.style.display = "none";
            skillsError.style.display = "block";
        });
}
