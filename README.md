# Hootly.ai

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Extension

```bash
npm run build
```

This creates a `dist/` folder with the compiled extensions.

### 3. Load in Firefox

1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select `dist/firefox/manifest.json`

### 4. Configure Settings

1. Click the Hootly icon in the toolbar (or navigate to settings)
2. Enter your Anthropic API key
3. (Optional) Customize:
   - Model selection
   - Max tokens
   - Temperature
   - Keyboard shortcut (default: Alt+C)

## Usage

### Basic Usage

1. Press your configured keyboard shortcut (default: `Alt+C`) on any webpage to open dialog
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

### Configuring Available Models

Models are configured in `src/config/models.json`:

```json
{
  "models": [
    {
      "id": "claude-sonnet-4-5-20250929",
      "name": "Claude Sonnet 4.5",
      "description": "Smartest model for complex agents and coding",
      "recommended": true,
      "legacy": false
    }
  ],
  "defaultModel": "claude-sonnet-4-5-20250929"
}
```

To update models:
1. Edit `src/config/models.json`
2. Run `npm run build`
3. Settings dropdown auto-populates from config

## Project Structure

```
hootly.ai/
├── src/
│   ├── background/       # Service worker (API calls)
│   ├── content/          # Injected UI (React)
│   │   └── components/   # Dialog, Input, Response, etc.
│   ├── settings/         # Settings page
│   ├── config/           # Configuration files (models.json)
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
