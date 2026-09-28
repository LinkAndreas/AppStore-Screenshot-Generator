# 📱 App Store Screenshot Generator

**🔗 [Open AppStore Screenshot Generator](https://screenshots.linkandreas.de/)**

[![Version](https://img.shields.io/badge/version-1.7.1-blue.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)](https://vitejs.dev/)

A professional, high-performance web tool designed for developers and designers to generate pixel-perfect App Store marketing screenshots in seconds. Stop wasting time with manual alignment and repetitive exports.

*Coded using Google Antigravity.*

## 🚀 Features

- **⚡ Bulk Export**: Generate high-resolution assets for multiple devices (iPhone & iPad) and all localizations in a single click.
- **📱 Device-Accurate Scaling**: Pre-configured with the latest Apple device dimensions (iPhone 17 Pro Max, iPad Pro M4).
- **🌍 Global Ready**: Comprehensive localization support with flag icons and automated text replacement.
- **🎨 Premium Editor**: Curated palette of 28 high-impact gradients and 28 solid colors specifically chosen for marketing conversion.
- **🌓 Dynamic Themes**: Full support for Light and Dark modes with a distraction-free glassmorphic UI.
- **⚙️ Precise Control**: Fine-tune scale, rotation, and offsets with a live, 60fps preview.

## 🛠 Tech Stack

- **Core**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Vanilla CSS (High Performance)
- **Engine**: `html-to-image` for high-resolution canvas capture
- **Compression**: `JSZip` for automated bulk downloads

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/app-store-screenshot-generator.git
   cd app-store-screenshot-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Productivity Tips

- **Exporting**: Click "Download All Locales" to receive a pre-organized ZIP file categorized by device and localization.
- **Alignment**: Select a screen in the center canvas to reveal fine-tuning controls in the right sidebar.

## 🚢 Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: GitHub builds the Docker image (Vite
build served by [Caddy](https://caddyserver.com), configured in `docker/Caddyfile`) and pushes it to
`ghcr.io/linkandreas/appstore-screenshot-generator`, tagged with the commit SHA. The Hostinger VPS
only receives `compose.yaml` in `~/appstore-screenshot-generator`, pulls that image and restarts
the container.

The container publishes no ports; it joins the shared Docker network `web`, where the
`cloudflared` container reaches it at `http://appstore-screenshot-generator:32775` and serves it
with HTTPS at <https://screenshots.linkandreas.de>.

Repository secrets: `HOSTINGER_HOST`, `HOSTINGER_USERNAME`, `HOSTINGER_SSH_KEY`.

To roll back, run on the VPS:
`cd ~/appstore-screenshot-generator && TAG=<older commit sha> docker compose up -d`.

To run the production image locally:
`docker build -t appstore-screenshot-generator . && docker run --rm -p 32775:32775 appstore-screenshot-generator`
→ <http://localhost:32775>.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📦 Assets & Attribution

- Device Bezels: iPhone and iPad device frames are sourced from Apple’s official design resources:
  - https://devimages-cdn.apple.com/design/resources/download/Bezel-iPhone-17.dmg
  - https://devimages-cdn.apple.com/design/resources/download/Bezel-iPad-Pro-M4.dmg

All rights to these assets belong to Apple and are used in accordance with their design guidelines.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Created with ❤️ for the Apple Developer community.*

