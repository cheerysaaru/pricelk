"""Shared HTTP helpers for retailer scrapers."""
from __future__ import annotations

import time

import requests

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "application/json, text/html, */*;q=0.8",
}


class Http:
    """Small session wrapper with retries and polite delays."""

    def __init__(self, timeout: int = 25, retries: int = 3, delay: float = 0.4) -> None:
        self.timeout = timeout
        self.retries = retries
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update(DEFAULT_HEADERS)

    def get(self, url: str, **kwargs) -> requests.Response:
        last: Exception | None = None
        for attempt in range(self.retries):
            try:
                r = self.session.get(url, timeout=self.timeout, **kwargs)
                if r.status_code in (429, 500, 502, 503, 504):
                    raise requests.HTTPError(f"status {r.status_code}", response=r)
                return r
            except Exception as e:  # noqa: BLE001
                last = e
                time.sleep(self.delay * (attempt + 1))
        raise RuntimeError(f"GET {url} failed after {self.retries} attempts: {last}") from last