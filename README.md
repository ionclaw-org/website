<p align="center">
    <a href="https://ionclaw.com" target="_blank" rel="noopener noreferrer">
        <img width="180" src="extras/images/logo-ionclaw.png" alt="IonClaw Logo">
    </a>
    <br>
    <br>
    Official website for the IonClaw project.
    <br>
</p>

<br>

# IonClaw Website

This repository contains the source code for the official [IonClaw](https://ionclaw.com) website.

IonClaw is a C++ AI agent orchestrator that runs anywhere as a native build — Linux, macOS, Windows, iPhone, iPad, Apple TV, Apple Watch, and Android — with zero external dependencies, and it connects to WhatsApp and Telegram. The only one that runs across all your devices: a true personal assistant, with privacy and security by design because it runs on the device.

Built with [Kaktos](https://github.com/paulocoutinhox/kaktos), a Python static site generator. The frontend is Tailwind CSS bundled by Vite.

## Requirements

- Python 3.9+
- Node.js 20.19+ (see `.nvmrc`)

## Development

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 kaktos.py
```

The frontend dependencies install themselves on the first build, and the dev
server watches `templates/` and `frontend/` alike.

## Build

```bash
python3 kaktos.py build
```

All files will be generated in the `build` folder.

## Layout

```
frontend/src/      tailwind entry, design system, and page scripts
frontend/public/   images and static js, served under /static/
frontend/raw/      files copied to the site root (favicon, CNAME, robots.txt)
templates/         jinja layouts, shared partials, and pages
modules/           kaktos core plus the ionclaw-specific commands
```

## Marketplace

The skills marketplace is generated from the sources listed in `sources.yml`.

```bash
python3 kaktos.py import   # clone the skill sources into skills/
python3 kaktos.py gen      # write build/marketplace-data.json and the packages
python3 kaktos.py deploy   # import + build + gen, then zip build/ for upload
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2026, Paulo Coutinho
