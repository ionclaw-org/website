import os

from modules import time

# general
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
build_dir = os.path.join(root_dir, "build")
template_dir = os.path.join(root_dir, "templates")

title = "IonClaw"
rtl = False
base_url = "https://ionclaw.com"

page_description = (
    "IonClaw is an open-source C++ AI agent orchestrator that compiles"
    " into a single native binary — deploy on servers, desktops,"
    " Raspberry Pi, ESP32, and embedded systems with zero dependencies."
)
page_keywords = (
    "ionclaw, ai agents, ai orchestration, c++ ai, embedded ai,"
    " esp32 ai, raspberry pi ai, native binary, open source,"
    " multi-agent platform, agent management, iot ai"
)
page_author = "Paulo Coutinho"
page_language = "en"

page_og_locale = "en_US"
page_og_type = "website"
page_og_site_name = title
page_og_image = f"{base_url}/assets/images/logo-og.png"
page_og_image_width = "1024"
page_og_image_height = "1024"

page_twitter_card = "summary_large_image"
page_twitter_site = "@ionclawdev"

page_apple_mobile_web_app_title = title
page_application_name = title

version_js_file = time.current_time()
version_css_file = time.current_time()
