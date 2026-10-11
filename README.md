# 📱 App Store Screenshot Generator

**🔗 [Open AppStore Screenshot Generator](https://screenshots.linkandreas.de/)**

[![Version](https://img.shields.io/badge/version-1.9.0-blue.svg)](package.json)
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
- **🔤 Brand Typefaces**: Eight self-hosted typefaces (sans and serif) for headlines and descriptions.
- **🌓 Paper & Darkroom Themes**: A calm, proof-sheet editor in light and dark that leaves the color to your screenshots.
- **🤖 MCP Server**: Let Claude, Cursor or any MCP client render branded screenshot sets for you ([below](#-mcp-server-for-ai-agents)).
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

## 🤖 MCP Server for AI Agents

The `mcp/` package is a [Model Context Protocol](https://modelcontextprotocol.io) server that renders
the same screenshots as the editor (same frames, layout and typefaces) without a browser, so an AI
agent can produce a complete, branded set from your app's raw screenshots.

### Hosted (no install)

Add `https://screenshots.linkandreas.de/mcp` as a remote MCP server (Streamable HTTP):

```bash
# Claude Code
claude mcp add --transport http appstore-screenshots https://screenshots.linkandreas.de/mcp
```

In Claude (web/desktop) add it under *Settings → Connectors → Add custom connector*; in Cursor add
`{"mcpServers": {"appstore-screenshots": {"url": "https://screenshots.linkandreas.de/mcp"}}}` to
`.cursor/mcp.json`.

The hosted server can't read files on your machine. Pass screenshots as https URLs, or upload them
first and pass the returned reference:

```bash
curl -s --data-binary @screen.png https://screenshots.linkandreas.de/mcp/uploads
# → {"image":"upload:…","width":1320,"height":2868,"expiresAt":"…"}
```

Results come back as download links (each PNG plus a ZIP of the set) that expire after an hour.

### Local (reads and writes files directly)

```bash
npm run mcp:install && npm run mcp:build
claude mcp add appstore-screenshots -- node "$PWD/mcp/dist/server.js"
```

Locally, `image` can be a file path and the PNGs are written to `outputDir` (default
`./appstore-screenshots`, relative to where the agent starts the server).

### Tools

| Tool | What it does |
| --- | --- |
| `get_design_options` | Devices and required screenshot sizes, frame colors, typefaces, background presets, layout limits, defaults and copywriting tips. |
| `render_screenshots` | Renders a set: a `brand` (background, text colors, typefaces, frame color, device position…) plus one `screens` entry per image with its `title`, `subtitle`, `locale`, `device` and optional overrides. Returns file locations, warnings and small previews the agent can check. |

The `app_store_screenshot_set` prompt walks an agent through planning the copy, choosing a brand,
rendering and reviewing. Output follows the editor's ZIP layout:
`iPhone_6.9/<locale>/screen_<n>.png` (1320×2868) and `iPad_13/<locale>/screen_<n>.png` (2064×2752).

Example request to an agent:

> Use the appstore-screenshots tools to make App Store screenshots for my habit tracker from
> `./shots/*.png`, in English and German. Brand: cream background `#f3ede2`, ink text, Instrument
> Serif headlines, Cosmic Orange frame.

Japanese, Chinese, Korean and other non-Latin text is rendered with Noto fonts fetched from Google
Fonts on demand. Run the tests with `npm run mcp:test`.

## 🚢 Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: GitHub tests the MCP server, builds the
Docker images and pushes them, tagged with the commit SHA:

- `ghcr.io/linkandreas/appstore-screenshot-generator`: the Vite build served by
  [Caddy](https://caddyserver.com) (configured in `docker/Caddyfile`), which also proxies `/mcp`
  to the MCP container.
- `ghcr.io/linkandreas/appstore-screenshot-mcp`: the MCP server (`Dockerfile` target `mcp`).

The Hostinger VPS only receives `compose.yaml` in `~/appstore-screenshot-generator`, pulls those
images and restarts the containers.

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

