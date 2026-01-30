# Hootly.ai

AI assistant for any webpage. Bring your own API key from Claude, OpenAI, Gemini, or OpenRouter. Free, private, no middleman.

## Quick Start

```bash
npm install
npm run build
```

**Firefox**: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `dist/firefox/manifest.json`

**Chrome**: `chrome://extensions` → Enable Developer mode → Load unpacked → select `dist/chrome/`

## Setup

1. Click toolbar icon → Settings
2. Enter API key (Claude, OpenAI, Gemini, or OpenRouter)
3. Select model
4. Press `Alt+C` on any webpage to chat

## Features

- **Multiple providers**: Claude, OpenAI, Gemini, OpenRouter
- **Context modes**: Text selection or full page
- **Personas**: Pre-built and custom AI personalities
- **History**: View and continue past conversations
- **10 languages**: EN, NL, DE, FR, ES, IT, PT, ZH, JA, KO
- **Keyboard shortcuts**: `Alt+C` (toggle), `Esc` (close/stop)
- **Draggable/resizable** dialog with saved position

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build for Firefox and Chrome |
| `npm run build:firefox` | Build Firefox only |
| `npm run build:chrome` | Build Chrome only |
| `npm test` | Run tests |
| `npm run release` | Create release zips |

## Project Structure

```
src/
├── background/       # Service worker (API calls)
├── content/          # Content script + React dialog
├── settings/         # Settings page
├── personas/         # Personas management page
├── history/          # History page
├── chat/             # Standalone chat page
└── shared/           # Utils, storage, i18n, models
```

## Tech Stack

React, TypeScript, Vite, Emotion CSS, Vitest

## License

MIT

## Links

- [Report issues](https://github.com/filidorwiese/hootly.ai/issues)
- [Development guidelines](CLAUDE.md)
