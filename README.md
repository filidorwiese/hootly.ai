# Hootly

Hootly is a browser extension that brings AI to any webpage. It's completely free—just connect your own API key from Claude, OpenAI, Gemini, or OpenRouter.

## Build Requirements

### Operating System
- Linux, macOS, or Windows
- Any OS that supports Node.js and npm

### Required Software

#### Node.js and npm
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)

**Installation:**
- **Linux/macOS**:
  ```bash
  # Using nvm (recommended)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 18
  nvm use 18

  # Or via package manager (Ubuntu/Debian)
  sudo apt update
  sudo apt install nodejs npm
  ```

- **macOS** (via Homebrew):
  ```bash
  brew install node
  ```

- **Windows**:
  Download installer from [nodejs.org](https://nodejs.org/)

**Verify Installation:**
```bash
node --version  # Should output v18.x.x or higher
npm --version   # Should output 9.x.x or higher
```

## Build Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`:
- React 18.3.x
- TypeScript 5.6.x
- Vite 6.x
- @anthropic-ai/sdk
- And all other dependencies

### Step 2: Build Extension

```bash
npm run build
```

**What this does:**
1. Runs TypeScript compiler (`tsc`)
2. Builds content scripts (content.js, iframe-app.js)
3. Builds background service worker (background.js)
4. Builds settings page
5. Generates extension icons
6. Copies manifests and HTML files
7. Creates output in `dist/firefox/` and `dist/chrome/` directories

**Build outputs:**
- `dist/firefox/` - Firefox extension (uses manifest.firefox.json)
- `dist/chrome/` - Chrome extension (uses manifest.chrome.json)

### Step 3: Create Release Archives (Optional)

To create distributable zip files for addon stores:

```bash
npm run release
```

This creates:
- `hootly-firefox-{version}.zip` - Ready for Firefox Add-ons store
- `hootly-chrome-{version}.zip` - Ready for Chrome Web Store

Version number is read from `package.json`.

## Loading the Extension

### Firefox

1. Build the extension: `npm run build`
2. Open Firefox
3. Navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select `dist/firefox/manifest.json`

**Note:** Temporary add-ons are removed when Firefox restarts.

### Chrome

1. Build the extension: `npm run build`
2. Open Chrome
3. Navigate to `chrome://extensions`
4. Enable "Developer mode" (toggle in top-right)
5. Click "Load unpacked"
6. Select the `dist/chrome/` folder

## Configuration

### First-Time Setup

1. Click the Hootly icon in the browser toolbar
2. Enter your Anthropic API key (get one at https://console.anthropic.com/)
3. Select a model (default: Claude Sonnet 4.5)
4. Configure optional settings:
   - Max tokens (default: 4096)
   - Temperature (default: 1.0)
   - Keyboard shortcut (default: Alt+C)
   - Language preference

### Supported Providers

- **Claude** (Anthropic)
- **OpenAI** (GPT models)
- **Google Gemini**
- **OpenRouter**

Configure API keys for each provider in settings.

## Usage

### Basic Usage

1. Press `Alt+C` (or your configured shortcut) on any webpage
2. Type your query in the input field
3. Click the green play button or press `Enter` to send
4. Response streams in real-time with:
   - Markdown formatting
   - Syntax-highlighted code blocks
   - Copy-to-clipboard for code

### With Context

**Text Selection:**
1. Select text on any webpage
2. Press `Alt+C`
3. Selected text is automatically included as context

**Full Page:**
1. Press `Alt+C` to open dialog
2. Click the context toggle button (cycles: none → selection → full page)
3. Full page content is included in your query

### Keyboard Shortcuts

- `Alt+C`: Toggle dialog (default, customizable)
- `Enter`: Send message
- `Shift+Enter`: New line in input
- `Esc`: Close dialog / Stop generation

### Dialog Features

- **Draggable**: Click and drag title bar to reposition
- **Resizable**: Drag edges or corners to resize
- **Persistent**: Position and size saved across sessions
- **Language Detection**: Auto-detects browser language
- **Conversation Memory**: Maintains context within session

## Development

### Development Mode

```bash
npm run dev
```

Starts Vite dev server with hot reload.

### Run Tests

```bash
npm test
```

Runs Vitest test suite.

### Project Structure

```
hootly.ai/
├── src/
│   ├── background/           # Service worker
│   │   └── service-worker.ts # Handles API calls, bypasses CORS
│   ├── content/              # Content scripts
│   │   ├── index.tsx         # Creates iframe, handles messages
│   │   ├── iframe-app.tsx    # React app entry point
│   │   ├── App.tsx           # Main app component
│   │   ├── components/       # React components
│   │   │   ├── Dialog.tsx    # Main dialog container
│   │   │   ├── InputArea.tsx # Input with context toggle
│   │   │   └── Response.tsx  # Markdown renderer
│   │   └── iframe.html       # Iframe document
│   ├── settings/             # Settings page
│   │   ├── index.html
│   │   └── settings.ts
│   ├── shared/               # Shared modules
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── storage.ts        # Chrome storage wrapper
│   │   ├── models.ts         # Model configurations
│   │   ├── providers/        # API provider implementations
│   │   │   ├── claude.ts
│   │   │   ├── openai.ts
│   │   │   ├── gemini.ts
│   │   │   └── openrouter.ts
│   │   ├── i18n/             # Internationalization
│   │   │   ├── index.ts
│   │   │   └── *.json        # Translations (10 languages)
│   │   └── utils.ts          # Helper functions
│   └── __tests__/            # Test files
├── scripts/
│   ├── generate-icons.js     # Icon generation script
│   └── release.js            # Release packaging script
├── public/icons/             # Source icon files
├── manifest.firefox.json     # Firefox manifest
├── manifest.chrome.json      # Chrome manifest
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── dist/firefox/             # Build output (Firefox)
└── dist/chrome/              # Build output (Chrome)
```

### Build Configuration

The build process uses Vite with a multi-entry configuration:

- **Library mode** for scripts (IIFE/ES modules)
- **Code splitting** enabled for vendor dependencies
- **No minification** for easier review
- **TypeScript compilation** with strict mode
- **React Fast Refresh** in development

Key build scripts:
- `build:firefox` - Sets TARGET=firefox, runs build:base
- `build:chrome` - Sets TARGET=chrome, runs build:base
- `build:base` - Compiles TypeScript, builds all entry points, generates icons
- `build:scripts` - Builds content.js, iframe-app.js, background.js separately

### Architecture

**Multi-Entry Build:**
- 4 separate entry points (content script, iframe app, background worker, settings)
- Each built independently to reduce coupling

**Iframe Isolation:**
- Extension UI runs in isolated iframe for complete CSS isolation
- Parent page styles cannot affect extension UI
- Message passing between content script and iframe

**Message Flow:**
```
User presses Alt+C
  ↓
Content script (index.tsx)
  ↓ postMessage('hootly-toggle')
Iframe (App.tsx)
  ↓
Dialog opens
  ↓
User sends message
  ↓
chrome.runtime.sendMessage
  ↓
Background worker (service-worker.ts)
  ↓
API call to provider
  ↓
Stream response back to content script
  ↓
Display in Dialog
```

## Tech Stack

- **Build System**: Vite 6.x + TypeScript 5.6.x
- **UI Framework**: React 18.3.x
- **Styling**: @emotion/css (CSS-in-JS)
- **Markdown Rendering**: marked + highlight.js
- **Drag/Resize**: react-rnd
- **API SDKs**:
  - @anthropic-ai/sdk (Claude)
  - openai (GPT models)
  - @google/generative-ai (Gemini)
- **Testing**: Vitest + Testing Library
- **Icons**: sharp (image processing)

## Internationalization (i18n)

Supported languages:
- English (en)
- Dutch (nl)
- German (de)
- French (fr)
- Spanish (es)
- Italian (it)
- Portuguese (pt)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)

Translation files: `src/shared/i18n/*.json`

Auto-detects browser language, fallback to English.

## Troubleshooting

### Build fails with "npm: command not found"
- Install Node.js and npm (see Build Requirements above)

### "Module not found" errors
- Run `npm install` to install dependencies
- Delete `node_modules/` and `package-lock.json`, then run `npm install` again

### Extension doesn't load in Firefox
- Ensure you built the extension: `npm run build`
- Check that `dist/firefox/manifest.json` exists
- Look for errors in `about:debugging` console

### Extension doesn't work in Chrome
- Ensure you built the extension: `npm run build`
- Check that `dist/chrome/` contains all files
- Enable "Developer mode" in `chrome://extensions`
- Check for errors in extension console (click "Errors" in chrome://extensions)

### API key not working
- Verify key is correct in settings
- Check browser console for error messages
- Ensure you have credits/quota with your provider

### Keyboard shortcut doesn't work
- Check for conflicts with other extensions or OS shortcuts
- Try changing shortcut in settings
- Some shortcuts are reserved by the browser

## License

MIT

## Contributing

Contributions welcome! Please open an issue first to discuss changes.

## Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/yourusername/hootly.ai/issues)
- Documentation: See CLAUDE.md for development guidelines
