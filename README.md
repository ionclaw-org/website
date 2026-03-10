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

IonClaw is a C++ AI agent orchestrator that runs anywhere as a native build — Linux, macOS, Windows, iOS, and Android — with zero external dependencies. The only one that runs on mobile: a true personal assistant, with privacy and security by design because it runs on your smartphone.

Built with [Kaktos](https://github.com/paulocoutinhox/kaktos), a Python static site generator.

## Requirements

- Python 3.9+

## Development

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 kaktos.py
```

## Build

```bash
python3 kaktos.py build
```

All files will be generated in the `build` folder.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2026, Paulo Coutinho
