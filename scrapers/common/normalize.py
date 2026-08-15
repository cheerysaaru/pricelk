"""Normalization helpers shared by all retailer scrapers.

Canonicalizes brand names, cleans product titles, and parses LKR prices
(including WooCommerce minor-unit strings like "22869900" -> 228699.00).
"""
from __future__ import annotations

import html
import re

# Map retailer-specific spellings / aliases to one canonical brand name.
BRAND_ALIASES: dict[str, str] = {
    # Phones
    "samsung": "Samsung",
    "galaxy": "Samsung",
    "apple": "Apple",
    "iphone": "Apple",
    "xiaomi": "Xiaomi",
    "redmi": "Xiaomi",
    "poco": "Xiaomi",
    "oneplus": "OnePlus",
    "oppo": "OPPO",
    "vivo": "vivo",
    "realme": "realme",
    "honor": "HONOR",
    "huawei": "Huawei",
    "nokia": "Nokia",
    "motorola": "Motorola",
    "google pixel": "Google",
    "pixel": "Google",
    "nothing": "Nothing",
    "tecno": "Tecno",
    "infinix": "Infinix",
    "itel": "itel",
    # Laptops
    "macbook": "Apple",
    "dell": "Dell",
    "lenovo": "Lenovo",
    "thinkpad": "Lenovo",
    "ideapad": "Lenovo",
    "legion": "Lenovo",
    "hp": "HP",
    "hewlett": "HP",
    "asus": "ASUS",
    "acer": "Acer",
    "msi": "MSI",
    "razer": "Razer",
    "microsoft surface": "Microsoft",
    "surface": "Microsoft",
    # TVs
    "lg": "LG",
    "sony": "Sony",
    "bravia": "Sony",
    "tcl": "TCL",
    "hisense": "Hisense",
    "panasonic": "Panasonic",
    "toshiba": "Toshiba",
    "sharp": "Sharp",
    "haier": "Haier",
    # Audio
    "jbl": "JBL",
    "bose": "Bose",
    "airpods": "Apple",
    "beats": "Beats",
    "anker": "Anker",
    "soundcore": "Anker",
    "skullcandy": "Skullcandy",
    "sennheiser": "Sennheiser",
    "audio technica": "Audio-Technica",
    # Appliances
    "singer": "Singer",
    "abans": "Abans",
    "cargills": "Cargills",
    "keells": "Keells",
    "electrolux": "Electrolux",
    "whirlpool": "Whirlpool",
    "indesit": "Indesit",
    "bosch": "Bosch",
    "midea": "Midea",
    "dawlance": "Dawlance",
    # Groceries / FMCG
    "anchor": "Anchor",
    "nespray": "Nestlé",
    "nestle": "Nestlé",
    "maggi": "Nestlé",
    "keells super": "Keells",
    "rathna": "Rathna",
    "prima": "Prima",
    "munchee": "Munchee",
    "maliban": "Maliban",
    "dilmah": "Dilmah",
    "lipton": "Lipton",
    "watawala": "Watawala",
    "elephant house": "Elephant House",
    # Footwear
    "nike": "Nike",
    "adidas": "Adidas",
    "puma": "Puma",
    "reebok": "Reebok",
    "new balance": "New Balance",
    "skechers": "Skechers",
    "crocs": "Crocs",
    "converse": "Converse",
    "vans": "Vans",
    # Cameras / drones
    "canon": "Canon",
    "nikon": "Nikon",
    "fujifilm": "Fujifilm",
    "gopro": "GoPro",
    "dji": "DJI",
    # Gaming
    "playstation": "Sony",
    "ps5": "Sony",
    "xbox": "Microsoft",
    "nintendo": "Nintendo",
    "switch": "Nintendo",
    # Misc
    "philips": "Philips",
    "braun": "Braun",
    "remington": "Remington",
    "dyson": "Dyson",
    "rowenta": "Rowenta",
    "preethi": "Preethi",
    "morphy": "Morphy Richards",
    "kenwood": "Kenwood",
    "black & decker": "Black & Decker",
    "black+decker": "Black & Decker",
    "stanley": "Stanley",
    "3m": "3M",
    "duracell": "Duracell",
    "energizer": "Energizer",
}

# Words that are not part of a brand name (e.g. "Samsung Galaxy S25" -> "Samsung").
_BRAND_STOP = {
    "the", "with", "and", "for", "new", "original", "genuine", "official",
    "smart", "smartphone", "phone", "mobile", "laptop", "notebook", "tv",
    "television", "led", "oled", "qled", "uhd", "4k", "8k", "smartphone",
}

_CLEAN_RE = re.compile(r"\s+")
_PRICE_RE = re.compile(r"[\d,]+(?:\.\d+)?")


def canonical_brand(name: str) -> str | None:
    """Return the canonical brand for a product name, or None if unknown."""
    if not name:
        return None
    lower = name.lower()
    # Longest alias first so "google pixel" wins over "pixel".
    for alias in sorted(BRAND_ALIASES, key=len, reverse=True):
        if alias in lower:
            return BRAND_ALIASES[alias]
    return None


def clean_name(name: str) -> str:
    """Collapse whitespace, unescape HTML entities, strip retailer noise."""
    if not name:
        return ""
    name = html.unescape(name)
    name = _CLEAN_RE.sub(" ", name).strip()
    for noise in ("buy now", "shop now", "add to cart", "price:", "rs.", "lkr"):
        name = name.replace(noise, "")
    return _CLEAN_RE.sub(" ", name).strip()


_JUNK_RE = re.compile(r"\boder#\b|\border#\b|\b\d{10,}\b", re.IGNORECASE)


def is_junk(name: str) -> bool:
    """True for non-product listings (order numbers, upgrade placeholders)."""
    return bool(name and _JUNK_RE.search(name))


def parse_lkr_price(value: str | int | float | None, minor_unit: int = 0) -> float | None:
    """Parse a price into LKR as a float.

    WooCommerce returns prices as strings in minor units (e.g. "22869900"
    with currency_minor_unit=2 -> 228699.00). HTML scrapers usually give
    "Rs. 228,699.00" or "228,699".
    """
    if value is None:
        return None
    if isinstance(value, (int, float)):
        num = float(value)
    else:
        m = _PRICE_RE.search(str(value))
        if not m:
            return None
        num = float(m.group(0).replace(",", ""))
    if minor_unit:
        num /= 10 ** minor_unit
    return round(num, 2)


def extract_attrs(name: str) -> dict[str, str]:
    """Pull common variant attributes out of a product title.

    Returns a dict like {"storage": "256GB", "ram": "12GB", "capacity": "7kg",
    "screen": "55", "color": "Titanium"}.
    """
    attrs: dict[str, str] = {}
    if not name:
        return attrs
    lower = name.lower()

    storage = re.search(r"(\d{1,3})\s*(tb|gb)\b", lower)
    if storage:
        attrs["storage"] = f"{storage.group(1).upper()}{storage.group(2).upper()}"

    ram = re.search(r"\b(\d{1,2})\s*gb\s*ram\b", lower)
    if ram:
        attrs["ram"] = f"{ram.group(1)}GB"

    capacity = re.search(r"\b(\d+(?:\.\d+)?)\s*(kg|l)\b", lower)
    if capacity:
        attrs["capacity"] = f"{capacity.group(1)}{capacity.group(2).upper()}"

    screen = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:inch|in)\b", lower)
    if screen:
        attrs["screen"] = screen.group(1)

    color = re.search(r"\b(titanium|graphite|black|white|silver|gold|blue|green|red|navy|grey|gray|pink|purple|beige|cream)\b", lower)
    if color:
        attrs["color"] = color.group(1).capitalize()

    return attrs