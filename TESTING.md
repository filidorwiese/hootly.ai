# Testing Strategy

## Overview

Comprehensive testing strategy for Hootly browser extension. Focus on core functionality, not visual styles. External APIs mocked.

**Coverage target**: 80%

## Test Structure

```
src/__tests__/
├── __mocks__/
│   ├── chrome.ts          # Chrome API mocks
│   └── providers.ts       # LLM provider mocks
├── fixtures/              # Shared test data
│   ├── settings.ts
│   ├── conversations.ts
│   └── messages.ts
├── shared/
│   ├── storage.test.ts
│   ├── utils.test.ts
│   ├── i18n.test.ts
│   ├── models.test.ts
│   └── providers.test.ts
├── content/
│   ├── shortcut-parser.test.ts
│   └── message-handler.test.ts
├── components/
│   ├── ContextToggle.test.tsx
│   ├── InputArea.test.tsx
│   └── Dialog.test.tsx
└── integration/
    └── conversation-flow.test.ts
```

## Test Categories

### 1. Unit Tests (Pure Functions)

| Module | Functions | Notes |
|--------|-----------|-------|
| `utils.ts` | `estimateTokens()`, `generateId()`, `formatDate()`, `extractPageText()` | No side effects |
| `i18n/index.ts` | `t()`, `setLanguage()`, `getLanguage()` | Interpolation, fallbacks |
| `models.ts` | `selectDefaultModel()`, `modelExists()` | Model priority logic |
| `content/index.tsx` | `parseShortcut()` | Modifier key parsing |

### 2. Integration Tests (With Mocks)

| Area | What to Test |
|------|--------------|
| `Storage` class | CRUD with mocked `chrome.storage.local` |
| Provider factory | `getProvider()` returns correct class |
| Message handlers | Content script ↔ iframe routing |
| Background worker | Message dispatch, stream abort |

### 3. Component Tests

| Component | Key Behaviors |
|-----------|---------------|
| `ContextToggle` | State cycling: disabled → selection → fullpage → disabled |
| `InputArea` | Token count, textarea expansion, send button state |
| `Dialog` | Escape key (cancel vs close), conversation state |
| `Response` | Markdown rendering, code block copy |

### 4. Provider Tests

Mock streaming for each provider:
- Claude: `client.messages.stream()`
- OpenAI: `openai.chat.completions.create()`
- Gemini: `model.generateContentStream()`
- OpenRouter: fetch with SSE

### 5. E2E Tests

Use `web-ext` for Firefox-specific behaviors:
- Keyboard shortcut activation
- Iframe injection
- Extension popup

## Mocking Strategy

### Chrome APIs

In-memory implementation of:
- `chrome.storage.local.get/set/remove`
- `chrome.runtime.sendMessage/onMessage`
- `chrome.tabs.query/sendMessage`

### Providers

- Return async iterators with predefined chunks
- Test abort controller cancellation
- Test error responses (rate limit, invalid key)

### Message Passing

- Mock `window.postMessage` and `addEventListener('message')`
- Simulate cross-origin restrictions

## Critical Test Scenarios

1. **Storage persistence** - Settings save/load correctly
2. **Context extraction** - Selection vs full page text
3. **Token estimation** - Accurate for UI display
4. **i18n fallback** - Missing key → English
5. **Shortcut parsing** - `Alt+Shift+C` → correct modifiers
6. **Stream cancellation** - Abort mid-stream works
7. **Conversation history** - Messages persist across sessions
8. **Provider switching** - Changing provider handles model compatibility

## What's NOT Tested

- Visual styles
- Actual API responses (mocked)
- `react-rnd` drag/resize (library responsibility)
- `marked`/`highlight.js` rendering (library responsibility)

## Dependencies

```json
{
  "@testing-library/react": "^14.x",
  "@testing-library/user-event": "^14.x",
  "web-ext": "^7.x"
}
```

## Implementation Phases

### Phase 1: Setup & Infrastructure
- Chrome API mocks
- Provider mocks
- Shared fixtures
- Vitest config (coverage)

### Phase 2: Unit Tests
- utils.test.ts
- i18n.test.ts
- models.test.ts
- shortcut-parser.test.ts

### Phase 3: Integration Tests
- storage.test.ts
- providers.test.ts
- message-handler.test.ts

### Phase 4: Component Tests
- ContextToggle.test.tsx
- InputArea.test.tsx
- Dialog.test.tsx

### Phase 5: E2E
- web-ext setup
- conversation-flow.test.ts
