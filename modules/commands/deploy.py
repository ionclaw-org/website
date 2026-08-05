import importlib
import os
import zipfile

from modules import config
from modules.commands import build, gen


# -----------------------------------------------------------------------------
def run(params={}):
    # import skills from external sources
    import_cmd = importlib.import_module("modules.commands.import")
    import_cmd.run(params)

    # build static site
    build.run(params)

    # generate skills data
    gen.run(params)

    # create deploy zip
    create_zip()


# -----------------------------------------------------------------------------
def create_zip():
    print("creating deploy zip...")

    zip_path = os.path.join(config.root_dir, "deploy.zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(config.build_dir):
            for file_name in sorted(files):
                file_path = os.path.join(root, file_name)
                arcname = os.path.relpath(file_path, config.build_dir)
                zf.write(file_path, arcname)

    print(f"created: {zip_path}")
    print("done")
