# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FireOwl is a Firefox extension for interacting with Claude AI directly from any webpage. Built with Vite, React, and TypeScript.

**Status**: MVP functional with i18n support (10 languages).

## Build Commands

```bash
# Install dependencies
npm install

# Build extension for Firefox
npm run build

# Output: dist/ folder with manifest.json

# Run tests
npm test
```

## Testing in Firefox

1. Build: `npm run build`
2. Firefox → `about:debugging#/runtime/this-firefox`
3. "Load Temporary Add-on" → select `dist/manifest.json`
4. Configure API key via toolbar icon (settings page)
5. Test: Press `Alt+C` on any webpage

## Architecture

### Multi-Entry Build System

Vite configured for 4 separate entry points:

1. **Content Script** (`src/content/index.tsx`)
   - Injected into all pages
   - Creates transparent iframe for style isolation
   - Forwards keyboard shortcuts and messages to iframe
   - Exposes page info (URL, title, selection, text) to iframe via postMessage

2. **Iframe App** (`src/content/iframe-app.tsx`)
   - React app runs inside isolated iframe
   - Complete style isolation from host page
   - Communicates with content script via postMessage

3. **Background Worker** (`src/background/service-worker.ts`)
   - Handles Anthropic API calls (bypasses CORS)
   - Streams responses back to content script
   - Listens for keyboard command via `chrome.commands`

4. **Settings Page** (`src/settings/index.html` + `settings.ts`)
   - Standalone page for configuration
   - API key, model, language, shortcuts

### Iframe Style Isolation

The extension uses an iframe approach for complete CSS isolation:

```
Host Page
  └── #fireowl-frame (transparent iframe, pointer-events toggled)
        └── iframe.html (loads iframe-app.js)
              └── React App (Dialog, Response, InputArea)
```

- Iframe has `pointer-events: none` when dialog closed (clicks pass through)
- Iframe has `pointer-events: auto` when dialog open (interactive)
- Dialog notifies parent when closed via postMessage

### Message Passing Flow

```
User presses Alt+C
  ↓
content script (keydown listener)
  ↓
postMessage to iframe ('fireowl-toggle')
  ↓
App.tsx toggles dialog visibility
  ↓
iframe.style.pointerEvents = 'auto'
```

```
Dialog needs page context
  ↓
requestPageInfo() → postMessage('fireowl-get-page-info')
  ↓
content script responds with URL, title, selection, pageText
  ↓
Dialog uses cached page info for context
```

### Internationalization (i18n)

**Languages supported**: English, Dutch, German, French, Spanish, Italian, Portuguese, Chinese, Japanese, Korean

**Files**:
- `src/shared/i18n/index.ts` - Translation utility (`t()` function)
- `src/shared/i18n/*.json` - Translation files (en, nl, de, fr, es, it, pt, zh, ja, ko)

**Usage**:
```typescript
import { t } from '../shared/i18n';
t('dialog.close')  // Returns localized string
t('input.tokens', { count: 100 })  // With interpolation
```

**Auto-detection**: Uses `navigator.language`, falls back to English.

### Storage Architecture

**Wrapper**: `src/shared/storage.ts` wraps `chrome.storage.local`

**Schema**: Defined in `src/shared/types.ts`
- `Settings`: API key, model, temp, language, shortcuts
- `Conversation`: Array of `Message` objects
- `DialogPosition`: Last x/y/width for persistence

## Component Structure

### Dialog.tsx (Main Component)
- Wraps everything in `<Rnd>` for drag/resize
- Manages conversation state
- Auto-height with max-height response area
- Forest theme styling

### InputArea.tsx
- Auto-expanding textarea (2-6 lines)
- Token estimation display
- Context toggle and clear/send buttons in footer

### Response.tsx
- Markdown rendering via `marked` library
- Syntax highlighting via `highlight.js`
- Copy button per message
- Max-height with scroll

### ContextToggle.tsx
- Cycles through: selection → full page → disabled
- Shows badge with character count

## Key Files

- **`src/shared/types.ts`**: TypeScript interfaces
- **`src/shared/storage.ts`**: Chrome storage wrapper
- **`src/shared/utils.ts`**: Context extraction, page info via postMessage
- **`src/shared/i18n/`**: Translation system
- **`src/content/iframe.html`**: Iframe document template
- **`manifest.json`**: Extension config

## Development Workflow

1. Make changes to `src/`
2. Run `npm run build`
3. Firefox → `about:debugging` → Reload extension
4. Test on any webpage (Alt+C)
5. Check console for errors (both page console and background worker console)

**Note**: Temporary add-ons reset on Firefox restart.

## Common Pitfalls

### Iframe Communication
- Page info must be requested via postMessage (iframe can't access parent DOM)
- `requestPageInfo()` is async - must await before using extractSelection/extractPageText

### Style Isolation
- All styles must be in iframe.html or emotion CSS
- Google Fonts loaded via `<link>` in iframe.html
- Page CSS cannot affect extension UI

### Bundle Size
- ~1.2MB for iframe-app.js (highlight.js includes all languages)
- Can be optimized by importing only common languages
