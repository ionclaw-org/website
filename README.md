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
