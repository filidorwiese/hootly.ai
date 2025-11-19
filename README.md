# FireClaude

Firefox extension for interacting with Claude AI directly from any webpage.

## Features

✅ **Phase 1-3 Completed:**
- Keyboard-activated dialog (Alt+W)
- Draggable & resizable interface
- Auto-expanding textarea with token counter
- Context injection (full page or text selection)
- Streaming API responses
- Markdown rendering with syntax highlighting
- Conversation history tracking
- Local storage persistence

🚧 **Not Yet Implemented:**
- Conversation history UI/search
- Full settings page
- Multi-turn conversation depth controls
- Theme customization
- Export functionality

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Extension

```bash
npm run build
```

This creates a `dist/` folder with the compiled extension.

### 3. Load in Firefox

1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select `dist/manifest.json`

### 4. Configure API Key

1. Click the FireClaude icon in the toolbar (or navigate to settings)
2. Enter your Anthropic API key
3. (Optional) Adjust model, max tokens, temperature

## Usage

### Basic Usage

1. Press `Alt+W` on any webpage to open dialog
2. Type your query
3. Press `Enter` to send (or click "Send")
4. Response streams in real-time with markdown formatting

### With Context

1. **Text Selection**: Select text on page → opens dialog → context automatically included
2. **Full Page**: Click 🌐 button to include entire page content

### Tips

- `Shift+Enter`: New line in input
- `Esc`: Close dialog
- Drag title bar to reposition
- Resize from corners/edges
- Position persists across sessions

## Development

### Dev Mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Project Structure

```
fireclaude/
├── src/
│   ├── background/       # Service worker (API calls)
│   ├── content/          # Injected UI (React)
│   │   └── components/   # Dialog, Input, Response, etc.
│   ├── settings/         # Settings page
│   └── shared/           # Types, storage, utils
├── public/icons/         # Extension icons
├── manifest.json         # Extension manifest
└── dist/                 # Built extension (git-ignored)
```

## Tech Stack

- **Build**: Vite + TypeScript
- **UI**: React + @emotion/css
- **Markdown**: marked + highlight.js
- **Drag/Resize**: react-rnd
- **API**: @anthropic-ai/sdk

## Contributing

This is Phase 1-3 implementation. Remaining phases:

- **Phase 4**: Full conversation features (thread UI, branching)
- **Phase 5**: Complete settings page
- **Phase 6**: Polish (animations, toasts, themes, right-click menu)

## License

MIT
