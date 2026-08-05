import glob
import json
import os
import zipfile

import yaml
from pygemstones.io import file as f
from pygemstones.util import log as l

from modules import config


# -----------------------------------------------------------------------------
def run(params={}):
    print("generating skills data...")

    skills_dir = os.path.join(config.root_dir, "skills")
    output_dir = os.path.join(config.build_dir, "skills")

    if not f.dir_exists(skills_dir):
        l.e("Skills directory not found")
        return

    os.makedirs(output_dir, exist_ok=True)

    skills = []

    # walk skills/{source}/{skill-name}/ structure
    for source_name in sorted(os.listdir(skills_dir)):
        source_dir = os.path.join(skills_dir, source_name)

        if not os.path.isdir(source_dir):
            continue

        for skill_name in sorted(os.listdir(source_dir)):
            skill_dir = os.path.join(source_dir, skill_name)

            if not os.path.isdir(skill_dir):
                continue

            skill_md = os.path.join(skill_dir, "SKILL.md")

            if not os.path.isfile(skill_md):
                continue

            metadata = parse_skill_metadata(skill_md)

            if not metadata:
                print(f"  skipping {source_name}/{skill_name}: invalid metadata")
                continue

            skill_output_dir = os.path.join(output_dir, source_name, skill_name)
            os.makedirs(skill_output_dir, exist_ok=True)

            # generate package.zip
            zip_path = os.path.join(skill_output_dir, "package.zip")
            create_skill_zip(skill_dir, zip_path)

            base_path = f"{config.base_url}/skills/{source_name}/{skill_name}"

            # copy SKILL.md to build output
            skill_md_dest = os.path.join(skill_output_dir, "SKILL.md")
            f.copy_file(skill_md, skill_md_dest)

            skill_entry = {
                "name": metadata.get("name", skill_name),
                "description": metadata.get("description", ""),
                "source": source_name,
                "readme-url": f"{base_path}/SKILL.md",
                "download-url": f"{base_path}/package.zip",
            }

            # detect and copy license file
            license_file = find_license_file(skill_dir)

            if license_file:
                license_filename = os.path.basename(license_file)
                license_dest = os.path.join(skill_output_dir, license_filename)
                f.copy_file(license_file, license_dest)
                skill_entry["license"] = f"{base_path}/{license_filename}"

            skills.append(skill_entry)
            print(f"  processed: {source_name}/{skill_name}")

    # write marketplace-data.json to build root
    data_path = os.path.join(config.build_dir, "marketplace-data.json")
    data = {"skills": skills}

    with open(data_path, "w", encoding="utf-8") as fp:
        json.dump(data, fp, indent=2, ensure_ascii=False)

    print(f"generated {len(skills)} skill(s)")
    print("done")


# -----------------------------------------------------------------------------
def parse_skill_metadata(skill_md_path):
    with open(skill_md_path, "r", encoding="utf-8") as fp:
        content = fp.read()

    if not content.startswith("---"):
        return None

    parts = content.split("---", 2)

    if len(parts) < 3:
        return None

    frontmatter = parts[1].strip()

    try:
        return yaml.safe_load(frontmatter)
    except yaml.YAMLError:
        return None


# -----------------------------------------------------------------------------
def create_skill_zip(skill_dir, zip_path):
    skill_name = os.path.basename(skill_dir)

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(skill_dir):
            for dir_name in sorted(dirs):
                dir_path = os.path.join(root, dir_name)
                arcname = os.path.join(
                    skill_name, os.path.relpath(dir_path, skill_dir)
                )
                zf.mkdir(arcname)

            for file_name in sorted(files):
                file_path = os.path.join(root, file_name)
                arcname = os.path.join(
                    skill_name, os.path.relpath(file_path, skill_dir)
                )
                zf.write(file_path, arcname)


# -----------------------------------------------------------------------------
def find_license_file(skill_dir):
    matches = glob.glob(os.path.join(skill_dir, "LICENSE*"))

    if matches:
        return matches[0]

    return None
