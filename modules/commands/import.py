import os
import shutil
import subprocess
import tempfile

import yaml

from modules import config


# -----------------------------------------------------------------------------
def run(params={}):
    print("importing skills from external sources...")

    sources_file = os.path.join(config.root_dir, "sources.yml")

    if not os.path.isfile(sources_file):
        print("sources.yml not found, skipping import")
        return

    with open(sources_file, "r", encoding="utf-8") as fp:
        data = yaml.safe_load(fp)

    sources = data.get("sources", [])

    if not sources:
        print("no sources defined in sources.yml")
        return

    skills_dir = os.path.join(config.root_dir, "skills")
    os.makedirs(skills_dir, exist_ok=True)

    total = 0

    for source in sources:
        count = import_source(source, skills_dir)
        total += count

    print(f"imported {total} skill(s) total")
    print("done")


# -----------------------------------------------------------------------------
def import_source(source, skills_dir):
    name = source.get("name")
    repo = source.get("repo")
    paths = source.get("paths", ["."])

    if not name or not repo:
        print(f"  skipping source with missing name or repo")
        return 0

    print(f"  cloning {repo}...")

    temp_dir = tempfile.mkdtemp(prefix=f"ionclaw-import-{name}-")

    try:
        result = subprocess.run(
            ["git", "clone", "--depth", "1", repo, temp_dir],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            print(f"  failed to clone {repo}: {result.stderr.strip()}")
            return 0

        # clean target directory for fresh import
        target_dir = os.path.join(skills_dir, name)

        if os.path.isdir(target_dir):
            shutil.rmtree(target_dir)

        os.makedirs(target_dir, exist_ok=True)

        count = 0

        for path in paths:
            if path == ".":
                scan_dir = os.path.join(temp_dir, "skills")
            else:
                scan_dir = os.path.join(temp_dir, "skills", path)

            if not os.path.isdir(scan_dir):
                print(f"  path not found: skills/{path}")
                continue

            for entry in sorted(os.listdir(scan_dir)):
                entry_dir = os.path.join(scan_dir, entry)

                if not os.path.isdir(entry_dir):
                    continue

                skill_md = os.path.join(entry_dir, "SKILL.md")

                if not os.path.isfile(skill_md):
                    continue

                dest_dir = os.path.join(target_dir, entry)
                shutil.copytree(entry_dir, dest_dir, dirs_exist_ok=True)
                count += 1

        print(f"  {name}: imported {count} skill(s)")
        return count

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
