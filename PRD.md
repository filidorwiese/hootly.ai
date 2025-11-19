# FireClaude - Product Requirements Document

## Overview
Firefox browser extension for interacting with Claude AI directly from any webpage via keyboard-activated overlay dialog.

## Tech Stack
- **Build**: Vite + TypeScript + React
- **Styling**: @emotion/css (CSS-in-JS)
- **Testing**: Vitest (unit tests)
- **API**: @anthropic-ai/sdk
- **Markdown**: marked + highlight.js
- **State**: React Context + localStorage
- **Drag/Resize**: react-draggable + react-resizable

## Architecture

### Extension Components
1. **Content Script** (`src/content/`)
   - Injected into all pages
   - Renders React dialog overlay
   - Extracts page context
   - Handles keyboard shortcuts
   - Isolated CSS (emotion runtime)

2. **Background Service Worker** (`src/background/`)
   - Handles Anthropic API calls (bypasses CORS)
   - Manages streaming responses
   - Relays messages between content script and API
   - Stores API key securely

3. **Settings Page** (`src/settings/`)
   - Standalone HTML page
   - Configure API key, model, behavior
   - Accessible via browser toolbar icon

### Message Passing Architecture
```
Content Script → Background Worker → Anthropic API
     ↓                   ↓                 ↓
  UI Events         API Calls         Streaming
     ↑                   ↑                 ↑
  Render ← Message Relay ← SSE Stream
```

### Storage Schema
```typescript
// API Settings
interface Settings {
  apiKey: string;
  model: 'claude-3-5-sonnet' | 'claude-3-opus' | 'claude-3-haiku';
  maxTokens: number;
  temperature: number;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  shortcut: string;
  autoClose: boolean;
  defaultContext: 'none' | 'full' | 'selection';
  contextMaxLength: number;
  includeScripts: boolean;
  includeStyles: boolean;
  includeAltText: boolean;
  systemPrompt?: string;
  conversationDepth: 1 | 3 | 5 | 999;
  retentionDays: number;
}

// Conversation Storage
interface Conversation {
  id: string;
  title: string; // First prompt truncated
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  context?: PageContext;
}

interface PageContext {
  url: string;
  title: string;
  selection?: string;
  fullPage?: string;
  metadata?: {
    description?: string;
    keywords?: string;
  };
}
```

## Implementation Phases

### Phase 1: Foundation
**Goal**: Extension loads, responds to keyboard shortcut, basic infra works

**Tasks**:
1. Init Vite project with React-TS template
2. Configure `vite.config.ts` for multi-entry build:
   - `src/content/index.tsx` → `dist/content.js`
   - `src/background/service-worker.ts` → `dist/background.js`
   - `src/settings/index.html` → `dist/settings.html`
3. Create `manifest.json` (v3):
   - Permissions: `storage`, `activeTab`, `scripting`
   - Content script injection
   - Background service worker
   - Keyboard command `Alt+W`
   - Browser action (settings icon)
4. Setup @emotion/css + basic styling
5. Setup Vitest config
6. Create message passing skeleton:
   - `chrome.runtime.sendMessage()` from content
   - `chrome.runtime.onMessage` in background
7. Storage wrapper (`src/shared/storage.ts`)

**Validation**:
- Load unpacked extension in Firefox
- Alt+W triggers content script
- Console logs show message passing works

### Phase 2: Core UI
**Goal**: Dialog appears, accepts input, closes properly

**Tasks**:
1. **Dialog Component** (`src/content/components/Dialog.tsx`):
   - 800×400px fixed div with high z-index
   - Semi-transparent backdrop
   - Draggable via react-draggable
   - Resizable via react-resizable (min 400×200, max 1200×800)
   - Position persistence (localStorage: last x,y)
   - Esc key listener → close
   - Click backdrop → close

2. **InputArea Component** (`src/content/components/InputArea.tsx`):
   - Textarea with auto-expand (2-6 lines)
   - onKeyDown: Enter = submit, Shift+Enter = newline
   - Character count → estimate tokens (chars/3.5)
   - Clear button
   - Submit button (disabled while loading)

3. **ContextToggle Component** (`src/content/components/ContextToggle.tsx`):
   - 🌐 button with active/inactive state
   - Check `window.getSelection()` on dialog open
   - If selection exists: show "Selection mode (N chars)"
   - Else: use full-page toggle state
   - Preview button → modal with context preview
   - Metadata toggles (title, URL, description)

**Validation**:
- Dialog opens at last position
- Drag and resize work
- Input expands properly
- Context toggle shows correct state

### Phase 3: API Integration
**Goal**: Send prompts to Claude, stream responses, render markdown

**Tasks**:
1. **Background API Handler** (`src/background/service-worker.ts`):
   - Install @anthropic-ai/sdk
   - Listen for `sendPrompt` message
   - Call `client.messages.stream()`
   - Relay stream chunks via `chrome.tabs.sendMessage()`
   - Handle errors (auth, rate limit, network)
   - Support cancel via AbortController

2. **Response Component** (`src/content/components/Response.tsx`):
   - Scrollable container
   - Accumulate streamed text
   - Parse markdown with marked.js
   - Syntax highlight with highlight.js
   - Copy button (copies raw markdown)
   - Loading indicator
   - Cancel button

3. **Context Extraction** (`src/shared/utils.ts`):
   - `extractPageText()`: document.body.innerText
   - `extractSelection()`: window.getSelection().toString()
   - `extractMetadata()`: title, URL, meta tags
   - Apply max length limit

**Validation**:
- Prompt + context sent to API
- Response streams in real-time
- Markdown renders correctly (headers, code blocks, lists)
- Copy button works
- Cancel stops stream

### Phase 4: Conversation Features
**Goal**: Multi-turn conversations, history, export

**Tasks**:
1. **Conversation Context** (`src/content/context/ConversationContext.tsx`):
   - Current conversation state
   - Add user/assistant messages
   - Include last N messages in API calls (configurable depth)
   - New conversation button → reset

2. **History Component** (`src/content/components/History.tsx`):
   - 📜 button opens sidebar/modal
   - List past conversations (title, date)
   - Search/filter by text
   - Click to load conversation
   - Delete button per conversation
   - Export button (markdown/JSON)
   - Clear all button

3. **Storage Management** (`src/shared/storage.ts`):
   - Save conversation after each exchange
   - Load conversations list
   - Apply retention period (delete old)
   - Export formatters (markdown/JSON)

**Validation**:
- Multi-turn context works
- History persists across sessions
- Search filters correctly
- Export produces valid files
- Retention period deletes old conversations

### Phase 5: Settings Page
**Goal**: User can configure all options

**Tasks**:
1. **Settings UI** (`src/settings/Settings.tsx`):
   - Tabbed interface: API / Behavior / Context

2. **API Tab**:
   - API key input (type=password, show/hide toggle)
   - Model dropdown (sonnet/opus/haiku)
   - Max tokens slider (1k-100k, logarithmic)
   - Temperature slider (0-1, 0.1 steps)
   - Test connection button

3. **Behavior Tab**:
   - Keyboard shortcut picker
   - Default context mode radio
   - Auto-close toggle
   - Theme radio (light/dark/system)
   - Font size slider (12-20px)
   - Conversation depth selector (1/3/5/all)

4. **Context Tab**:
   - Max context length input
   - Checkboxes: include scripts/styles/alt-text
   - System prompt textarea
   - Retention period input (days)

5. **Settings Persistence**:
   - Save on change (debounced)
   - Load on mount
   - Apply theme immediately

**Validation**:
- All settings save and load correctly
- Settings affect extension behavior
- Theme applies immediately
- API test connection works

### Phase 6: Polish & QoL
**Goal**: Smooth UX, no rough edges

**Tasks**:
1. **Visual Polish**:
   - Fade-in/out animations for dialog (150ms)
   - Toast notifications (copy success, errors)
   - Loading spinner with progress indication
   - Syntax theme selector (match popular editors)
   - Responsive adjustments for small viewports

2. **Keyboard Navigation**:
   - Tab order through UI
   - Shortcuts: Ctrl+K = clear, Ctrl+N = new conversation
   - Focus management (input on open)

3. **Error Handling**:
   - User-friendly error messages
   - Retry button for transient failures
   - Offline detection
   - Invalid API key guidance

4. **Right-Click Menu**:
   - "Ask Claude about selection" context menu
   - Pre-fills dialog with selection
   - Opens dialog if closed

5. **Testing**:
   - Unit tests for utils (token counting, extraction)
   - Component tests for key flows
   - Manual testing checklist

**Validation**:
- No console errors
- Smooth animations
- Good error states
- Right-click menu works
- Keyboard nav complete

## Architectural Decisions

### 1. Token Counting: Character Estimation
- **Decision**: Use `chars / 3.5` instead of tiktoken-js
- **Reasoning**: tiktoken-js adds ~1MB; users need rough estimate, not exact count
- **Risk**: Underestimation → unexpected truncation
- **Mitigation**: Conservative estimate + warning at 80% of limit

### 2. Drag Library: react-draggable
- **Decision**: Use react-draggable (14KB gzipped)
- **Reasoning**: Mature, handles edge cases (touch, constraints). Cost justified.
- **Alternative Rejected**: Custom implementation (bug-prone, time sink)

### 3. Selection Mode Precedence
- **Decision**: Selection always overrides full-page toggle
- **Reasoning**: Selected text = explicit user intent
- **UX**: Clear visual showing "Selection mode (3 paragraphs)"
- **Mitigation**: Allow clearing selection without closing dialog

### 4. Conversation Branching
- **Decision**: Defer to future (cut from v1)
- **Reasoning**: Complex (tree structure, UI visualization), niche use case
- **Alternative**: Linear threads cover 90% of use cases
- **Future**: Can add later without breaking storage migration

### 5. Claude.ai Sync
- **Decision**: Cut entirely
- **Reasoning**: Requires OAuth flow (2-3 days), unclear API availability
- **Alternative**: Export to JSON/markdown covers "save my work" need
- **Future**: Premium feature if Anthropic exposes sync API

### 6. Right-Click Menu
- **Decision**: Include in Phase 6
- **Reasoning**: Trivial implementation (5 lines manifest), high UX value
- **No downside**: Natural extension of existing flow

## Technical Challenges

### 1. Vite Multi-Entry Build
**Challenge**: Extensions need separate bundles without code-splitting
**Solution**:
```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      input: {
        content: 'src/content/index.tsx',
        background: 'src/background/service-worker.ts',
        settings: 'src/settings/index.html'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js' // Disable code-splitting
      }
    }
  }
}
```

### 2. Content Script CSS Isolation
**Challenge**: Page styles bleeding into dialog
**Solution**:
- @emotion generates unique class names
- High z-index (9999)
- CSS reset on dialog root
- Alternative: Shadow DOM (but React incompatibility)

### 3. Streaming with Background Worker
**Challenge**: SSE streams don't cross message boundaries
**Solution**:
- Background worker accumulates chunks
- Sends incremental updates via postMessage
- Content script reconstructs stream
- Cancel via message + AbortController reference

### 4. Firefox vs Chrome Compatibility
**Challenge**: `chrome.*` API vs `browser.*` API
**Solution**:
- Use `chrome.*` (Firefox supports as alias)
- Manifest v3 required for both
- Test in both browsers before release

## Success Metrics
- Extension loads without errors
- Dialog responds in <100ms to shortcut
- API latency <2s for first token
- No memory leaks after 50 conversations
- Bundle size <500KB gzipped
- Works on 95% of websites (edge cases: canvas-based sites)

## Out of Scope (Future Enhancements)
- Conversation branching
- Claude.ai account sync
- Multi-language support
- Voice input
- Image context (screenshots)
- Quick action templates
- Mobile extension (if Firefox for Android supports)

## Timeline Estimate
- **Phase 1**: 0.5 days
- **Phase 2**: 1 day
- **Phase 3**: 1.5 days
- **Phase 4**: 1 day
- **Phase 5**: 1 day
- **Phase 6**: 0.5-1 day

**Total**: 5-6 days focused work
