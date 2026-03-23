// marketplace
(function () {
    var skillsData = null;
    var searchInput = document.getElementById('skills-search');
    var skillsGrid = document.getElementById('skills-grid');
    var skillsLoading = document.getElementById('skills-loading');
    var skillsInitial = document.getElementById('skills-initial');
    var skillsEmpty = document.getElementById('skills-empty');
    var skillsError = document.getElementById('skills-error');
    var skillsTotalCount = document.getElementById('skills-total-count');
    var debounceTimer = null;

    function fetchSkills() {
        fetch('/marketplace-data.json')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch skills');
                }

                return response.json();
            })
            .then(function (data) {
                skillsData = data.skills || [];
                skillsLoading.style.display = 'none';
                skillsTotalCount.innerHTML = 'Currently <strong>' + skillsData.length + '</strong> skills available.';
                applyQueryString();
            })
            .catch(function () {
                skillsLoading.style.display = 'none';
                skillsError.style.display = 'block';
            });
    }

    function showInitial() {
        skillsGrid.style.display = 'none';
        skillsEmpty.style.display = 'none';
        skillsInitial.style.display = 'block';
    }

    function renderSkills(skills) {
        skillsInitial.style.display = 'none';

        if (skills.length === 0) {
            skillsGrid.style.display = 'none';
            skillsEmpty.style.display = 'block';
            return;
        }

        skillsEmpty.style.display = 'none';
        skillsGrid.style.display = 'flex';

        var html = '';

        for (var i = 0; i < skills.length; i++) {
            html += createSkillCard(skills[i]);
        }

        skillsGrid.innerHTML = html;
    }

    function createSkillCard(skill) {
        var licenseHtml = '';

        if (skill.license) {
            licenseHtml = '<button type="button" class="btn btn-outline-light" onclick="openSkillModal(\'' + escapeHtml(skill.license) + '\', \'' + escapeHtml(skill.name) + ' — License\')">' +
                '<i class="bi bi-file-text me-1"></i>License' +
                '</button>';
        }

        var readmeHtml = '';

        if (skill['readme-url']) {
            readmeHtml = '<button type="button" class="btn btn-outline-light" onclick="openSkillModal(\'' + escapeHtml(skill['readme-url']) + '\', \'' + escapeHtml(skill.name) + '\')">' +
                '<i class="bi bi-book me-1"></i>Read' +
                '</button>';
        }

        return '<div class="col-md-6 col-lg-4">' +
            '<div class="skill-card">' +
                '<div class="skill-card-header">' +
                    '<div class="icon-box"><i class="bi bi-lightning"></i></div>' +
                    '<h3>' + escapeHtml(skill.name) + '</h3>' +
                '</div>' +
                '<span class="skill-card-source">' + escapeHtml(skill.source) + '</span>' +
                '<p class="skill-card-description">' + escapeHtml(skill.description) + '</p>' +
                '<div class="skill-card-actions">' +
                    '<a href="' + escapeHtml(skill['download-url']) + '" class="btn btn-primary">' +
                        '<i class="bi bi-download me-1"></i>Download' +
                    '</a>' +
                    readmeHtml +
                    licenseHtml +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function filterSkills(query) {
        if (!skillsData) {
            return;
        }

        var terms = query.toLowerCase().trim();

        if (terms === '') {
            showInitial();
            return;
        }

        var nameMatches = [];
        var otherMatches = [];

        for (var i = 0; i < skillsData.length; i++) {
            var skill = skillsData[i];
            var name = (skill.name || '').toLowerCase();
            var description = (skill.description || '').toLowerCase();
            var source = (skill.source || '').toLowerCase();

            if (name.indexOf(terms) !== -1) {
                nameMatches.push(skill);
            } else if (description.indexOf(terms) !== -1 || source.indexOf(terms) !== -1) {
                otherMatches.push(skill);
            }
        }

        renderSkills(nameMatches.concat(otherMatches));
    }

    function escapeHtml(text) {
        if (!text) {
            return '';
        }

        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    function applyQueryString() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var skillName = params.get('skill');

        if (skillName) {
            var skill = findSkillByName(skillName);

            if (skill && skill['readme-url']) {
                openSkillModal(skill['readme-url'], skill.name);
            }

            if (skill) {
                searchInput.value = skill.name;
                filterSkills(skill.name);
            } else {
                searchInput.value = skillName;
                filterSkills(skillName);
            }
        } else if (q && searchInput) {
            searchInput.value = q;
            filterSkills(q);
        } else {
            showInitial();
        }
    }

    function findSkillByName(name) {
        if (!skillsData) {
            return null;
        }

        var lower = name.toLowerCase().trim();

        for (var i = 0; i < skillsData.length; i++) {
            if ((skillsData[i].name || '').toLowerCase() === lower) {
                return skillsData[i];
            }
        }

        return null;
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);

            debounceTimer = setTimeout(function () {
                filterSkills(searchInput.value);
            }, 200);
        });
    }

    fetchSkills();
})();

// skill modal
function stripFrontmatter(text) {
    if (!text.startsWith('---')) {
        return text;
    }

    var end = text.indexOf('---', 3);

    if (end === -1) {
        return text;
    }

    return text.substring(end + 3).trim();
}

function openSkillModal(url, name) {
    var modalEl = document.getElementById('skill-modal');
    var modalTitle = document.getElementById('skill-modal-title');
    var modalBody = document.getElementById('skill-modal-body');

    modalTitle.textContent = name;
    modalBody.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

    var modal = new bootstrap.Modal(modalEl);
    modal.show();

    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Failed to fetch');
            }

            return response.text();
        })
        .then(function (text) {
            var content = stripFrontmatter(text);
            modalBody.innerHTML = '<div class="skill-modal-markdown">' + marked.parse(content) + '</div>';
        })
        .catch(function () {
            modalBody.innerHTML = '<div class="text-center py-4"><p class="text-muted">Failed to load content.</p></div>';
        });
}
