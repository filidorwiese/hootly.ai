# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FireClaude is a Firefox extension for interacting with Claude AI directly from any webpage. Built with Vite, React, and TypeScript.

**Status**: Phase 1-3 complete (MVP functional). Phases 4-6 remaining (see PRD.md).

## Build Commands

```bash
# Install dependencies
npm install

# Development (watch mode, no extension loading)
npm run dev

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
5. Test: Press `Alt+W` on any webpage

## Architecture

### Multi-Entry Build System

Vite configured for 3 separate entry points (no code-splitting):

1. **Content Script** (`src/content/index.tsx`)
   - Injected into all pages
   - React app rendering dialog overlay
   - Listens for keyboard command via `window.postMessage`
   - Imports `highlight.js/styles/github.css` for syntax highlighting

2. **Background Worker** (`src/background/service-worker.ts`)
   - Handles Anthropic API calls (bypasses CORS)
   - Streams responses back to content script via `chrome.tabs.sendMessage`
   - Listens for keyboard command (`Alt+W`) via `chrome.commands`

3. **Settings Page** (`src/settings/index.html` + `settings.ts`)
   - Standalone page (not popup - toolbar icon opens this)
   - Basic API key/model/tokens/temp configuration
   - Loads/saves via `Storage` wrapper

**Key Build Detail**: `vite.config.ts` has custom plugin that copies `manifest.json`, `settings.html`, and icons to `dist/` root after build.

### Message Passing Flow

```
User presses Alt+W
  ↓
chrome.commands → background worker
  ↓
chrome.tabs.sendMessage({ type: 'toggleDialog' })
  ↓
content script → window.postMessage('fireclaude-toggle')
  ↓
React app toggles dialog visibility
```

```
User submits prompt
  ↓
Dialog.tsx → chrome.runtime.sendMessage({ type: 'sendPrompt', payload })
  ↓
background worker → Anthropic API (streaming)
  ↓
chrome.tabs.sendMessage({ type: 'streamChunk', payload: { content } })
  ↓
Dialog.tsx updates response state
  ↓
Response.tsx renders markdown with syntax highlighting
```

### Storage Architecture

**Wrapper**: `src/shared/storage.ts` wraps `chrome.storage.local`

**Schema**: Defined in `src/shared/types.ts`
- `Settings`: API key, model, temp, context options, UI preferences
- `Conversation`: Array of `Message` objects with timestamps
- `DialogPosition`: Last x/y/width/height for persistence

**Current Limitation**: Conversation history tracked in memory but not yet persisted or displayed (Phase 4).

### Context Injection

**Function**: `buildPageContext()` in `src/shared/utils.ts`

**Priority**:
1. Text selection (`window.getSelection()`) if exists
2. Full page text (`document.body.innerText`) if context toggle enabled
3. Filtered by settings (exclude scripts/styles)
4. Truncated to `contextMaxLength`

**Sent to API**: Context prepended to user prompt in background worker as structured text.

## Component Structure

### Dialog.tsx (Main Component)
- Wraps everything in `<Rnd>` for drag/resize (react-rnd)
- Manages conversation state (`conversationHistory`, `response`, `isLoading`)
- Listens for streaming messages from background
- Saves position to storage on drag/resize

### InputArea.tsx
- Auto-expanding textarea (2-6 lines)
- Token estimation: `chars / 3.5` (conservative estimate, not exact)
- Enter = submit, Shift+Enter = newline

### Response.tsx
- Markdown rendering via `marked` library
- Syntax highlighting via `highlight.js` with custom renderer
- Copy button (no toast yet - Phase 6)
- Error display

### ContextToggle.tsx
- Detects selection on mount via `extractSelection()`
- Shows badge: "Selection (N chars)" or "Full page" or "No context"
- Preview button not yet implemented (Phase 4)

## Key Files to Understand

- **`src/shared/types.ts`**: All TypeScript interfaces (Settings, Conversation, Message, PageContext, message types)
- **`src/shared/storage.ts`**: Chrome storage wrapper with typed methods
- **`src/shared/utils.ts`**: Context extraction, token estimation, date formatting
- **`vite.config.ts`**: Multi-entry build + post-build file copying
- **`manifest.json`**: Extension config (permissions, commands, content scripts)
- **`PRD.md`**: Detailed plan for remaining Phases 4-6

## Important Implementation Details

### Markdown + Syntax Highlighting
- Custom `marked.Renderer` in `Response.tsx` to integrate highlight.js
- Highlights code blocks during render, not post-processing
- CSS imported in `src/content/index.tsx`

### React in Content Script
- Creates isolated `div#fireclaude-root` appended to `document.body`
- Emotion CSS generates scoped class names (no style conflicts with page)
- High z-index (999999) to overlay all page content

### API Streaming
- Background worker uses `@anthropic-ai/sdk`'s `.stream()` method
- Accumulates chunks and relays incrementally to content script
- Content script concatenates chunks into response string
- Cancel not yet implemented (Phase 6)

### TypeScript Configuration
- `tsconfig.json` includes `@types/chrome` for extension APIs
- Strict mode enabled
- JSX set to `react-jsx` (new transform, no need to import React)

## Development Workflow

1. Make changes to `src/`
2. Run `npm run build`
3. Firefox → `about:debugging` → Reload extension
4. Test on any webpage (Alt+W)
5. Check console for errors (both page console and background worker console)

**Note**: Temporary add-ons reset on Firefox restart. Need to rebuild and reload each time.

## Common Pitfalls

### Build Warnings
- Bundle size warning (1.2MB) is expected - highlight.js includes all languages
- Can be optimized later by importing only common languages

### Message Passing
- Background worker can't send messages before content script loads
- Content script must handle case where dialog is toggled before React mounts
- Use `chrome.runtime.onMessage.addListener` return value `true` for async responses

### Storage Limits
- `chrome.storage.local` has ~10MB limit (Firefox)
- Conversation history will hit this eventually (need retention in Phase 4)

## Remaining Work

See **PRD.md** for detailed implementation plans:

- **Phase 4**: Conversation history UI, threading, export
- **Phase 5**: Complete settings page with all options
- **Phase 6**: Animations, toasts, keyboard nav, right-click menu, error recovery

Each phase has specific file locations, UI mockups, and validation checklists.
