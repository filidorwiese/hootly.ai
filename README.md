# Hootly.ai

![Hootly.ai Screenshot](extension/public/promo/promo-screenshot.png)

AI assistant for any webpage. Bring your own API key from Claude, OpenAI, Gemini, or OpenRouter. Free, private, no middleman.

Download for Firefox: https://addons.mozilla.org/nl/firefox/addon/hootly-ai/
Download for Chrome: https://chromewebstore.google.com/detail/hootlyai/amnifhjiliognmbndcbhibpecdoeadfh

## Prerequisites

- Node.js 18+

## Quick Start

```bash
cd extension
npm install
npm run build
```

**Firefox**: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `extension/dist/firefox/manifest.json`

**Chrome**: `chrome://extensions` → Enable Developer mode → Load unpacked → select `extension/dist/chrome/`

## Setup

1. Click toolbar icon → Settings
2. Enter API key (Claude, OpenAI, Gemini, or OpenRouter)
3. Select model
4. Press `Alt+C` on any webpage to chat

## Features

- **Multiple providers**: Claude, OpenAI, Gemini, OpenRouter
- **Context modes**: Text selection, full page, or clipboard
- **Personas**: Pre-built and custom AI personalities
- **History**: View and continue past conversations
- **Dark mode**: Auto, light, or dark theme
- **10 languages**: EN, NL, DE, FR, ES, IT, PT, ZH, JA, KO
- **Keyboard shortcuts**: `Alt+C` (toggle), `Esc` (close/stop)
- **Draggable/resizable** dialog with saved position
- **Privacy-focused**: On-demand injection, minimal permissions

## Monorepo Structure

```
hootly.ai/
├── extension/        # Browser extension (Firefox + Chrome)
│   ├── src/          # Extension source code
│   ├── dist/         # Build output
│   └── package.json  # Extension dependencies
├── website/          # Marketing website
└── package.json      # Root package (version tracking)
```

## Extension Commands

Run from `extension/` directory:

| Command | Description |
|---------|-------------|
| `npm run build` | Build for Firefox and Chrome |
| `npm run build:firefox` | Build Firefox only |
| `npm run build:chrome` | Build Chrome only |
| `npm test` | Run tests |
| `npm run release` | Create release zips |

## Tech Stack

React, TypeScript, Vite, Emotion CSS, Vitest

## Links

- [Report issues](https://github.com/filidorwiese/hootly.ai/issues)
- [Development guidelines](CLAUDE.md)
- [Privacy policy & License](PRIVACY.md)

