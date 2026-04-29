# Changelog

All notable changes to Cookie Sentinel will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-04-29

### Added
- Netscape `cookies.txt` export — download cookies in the standard format used by curl, wget, and the cookies.txt browser extension
- Export buttons in both DevTools panel and popup (JSON + TXT side by side)
- `exportToNetscape()` utility with `#HttpOnly_` prefix, subdomain flag, and session/expiry handling
- 9 new unit tests for cookies.txt export (67 total, 96.78% coverage)

## [1.0.1] - 2026-04-18

### Fixed
- Firefox packaging no longer overwrites Chrome `dist/manifest.json` (background service worker issue)
- Firefox manifest now includes required `data_collection_permissions` property

### Added
- Microsoft Edge packaging support (`pnpm package:edge`)
- Centralized version management — version is now defined only in `package.json`

### Changed
- Renamed extension from "Cookie Monster" to "Cookie Sentinel"
- Packaging scripts read version from `package.json` instead of hardcoded fallbacks
- Vite injects `__APP_VERSION__` at build time for all source files

## [1.0.0] - 2026-XX-XX

### Added
- Unified storage browser: cookies, localStorage, sessionStorage, IndexedDB, Cache Storage
- Full CRUD operations for all storage types
- Cross-storage search & filter by key, value, and domain
- Cookie classification engine (essential / functional / analytics / tracking)
- Per-site privacy score (0–100)
- Storage snapshot capture & diff comparison
- JSON export/import for debugging and testing
- DevTools panel with full-featured inspector
- Quick popup with privacy score and one-click actions
- Sensitive value masking (session tokens, auth cookies)
- Chrome (116+) and Firefox (109+) support via Manifest V3
- CI/CD with GitHub Actions, Trivy security scanning, SBOM generation
- 90%+ test coverage enforcement
