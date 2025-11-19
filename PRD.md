# FireClaude - Remaining Implementation

## Status: Phase 1-3 Complete ✅

### What's Working
- Foundation: Vite build, types, storage, message passing
- Core UI: Draggable/resizable dialog, auto-expanding input, context toggle
- API Integration: Streaming responses, markdown rendering, context extraction

### What's Left
Phases 4-6 below

---

## Phase 4: Conversation Features

### Goal
Full conversation history management with persistent storage and visual thread display.

### Tasks

#### 4.1 Conversation History Storage
**Files**: `src/shared/storage.ts`, `src/shared/types.ts`

- Already have `Conversation` and `Message` types defined
- Already have basic storage methods (`saveConversation`, `getConversations`)
- Need to integrate into Dialog component properly
- Apply conversation depth setting (include last 1/3/5/all messages in API calls)

**Implementation**:
1. Update `Dialog.tsx` to load/save current conversation
2. Create new conversation on "New conversation" button
3. Apply `settings.conversationDepth` when building message history for API
4. Auto-generate conversation titles from first prompt

#### 4.2 History UI Component
**File**: `src/content/components/History.tsx` (new)

Create sidebar/modal with:
- List of past conversations (title + date)
- Search input (filter by content)
- Click to load conversation
- Delete button per conversation
- "Clear all" button with confirmation
- Export button (markdown/JSON)

**UI Design**:
```
┌─────────────────────────┐
│ 📜 History    [New] [×] │
├─────────────────────────┤
│ [🔍 Search...]          │
├─────────────────────────┤
│ ▸ How to center div     │
│   2 hours ago           │
├─────────────────────────┤
│ ▸ Explain React hooks   │
│   Yesterday             │
├─────────────────────────┤
│ ...                     │
├─────────────────────────┤
│ [Export All] [Clear]    │
└─────────────────────────┘
```

**Integration**:
- Add 📜 button to Dialog header
- Toggle history panel (slide in from right)
- Load conversation → populate Dialog state

#### 4.3 Visual Conversation Thread
**File**: `src/content/components/Response.tsx`

Update to show full conversation thread instead of just latest response:

```
┌────────────────────────────┐
│ 👤 User: How do I...       │
│    [with context badge]    │
├────────────────────────────┤
│ 🤖 Claude: You can...      │
│    [markdown rendered]     │
├────────────────────────────┤
│ 👤 User: Follow-up...      │
├────────────────────────────┤
│ 🤖 Claude: [streaming...]  │
└────────────────────────────┘
```

**Changes**:
- Accept `messages: Message[]` prop instead of single `content`
- Render list of message pairs
- Show context badge when message has context
- Copy button per assistant message
- Auto-scroll to bottom on new message

#### 4.4 New Conversation Button
**File**: `src/content/components/Dialog.tsx`

Add button to header:
- Saves current conversation if not empty
- Resets state (clear messages, response, input)
- Creates new conversation ID
- Confirmation if current has unsaved input

### Validation
- Start conversation → close dialog → reopen → history persists
- Multi-turn works with configurable depth
- Search filters correctly
- Export produces valid markdown/JSON
- Loading conversation populates dialog

---

## Phase 5: Complete Settings Page

### Goal
Full-featured settings page with all configuration options.

### Current State
Basic settings page exists at `src/settings/index.html` with minimal fields.

### Tasks

#### 5.1 Expand Settings UI
**File**: `src/settings/index.html` + new `src/settings/Settings.tsx`

Convert to React app for better UX.

**Tabs**:
1. **API** (mostly done)
   - API key input ✅
   - Model selection ✅
   - Max tokens ✅
   - Temperature ✅
   - Add: Test connection button with feedback

2. **Behavior** (new)
   - Keyboard shortcut picker (via `chrome.commands` API)
   - Default context mode: none/full/selection (radio)
   - Auto-close after copy (checkbox)
   - Theme: light/dark/system (radio)
   - Font size: 12-20px (slider with preview)
   - Conversation depth: 1/3/5/all (dropdown)

3. **Context** (new)
   - Max context length: 10k-200k chars (input)
   - Include scripts (checkbox)
   - Include styles (checkbox)
   - Include image alt text (checkbox)
   - Custom system prompt (textarea with character count)

4. **Storage** (new)
   - Retention period: 7/30/90/365 days (dropdown)
   - Clear old conversations now (button)
   - Storage usage indicator
   - Export all conversations (button)
   - Import conversations (file upload)

#### 5.2 Settings Persistence
**File**: `src/shared/storage.ts`

All settings already persist via `Storage.saveSettings()`. Just need to wire up new fields.

#### 5.3 Live Preview
Show real-time preview of:
- Theme changes
- Font size changes
- System prompt example

#### 5.4 Reset to Defaults
Button to restore all settings to `DEFAULT_SETTINGS`.

### Validation
- All settings save and load correctly
- Theme applies to both dialog and settings page
- Custom shortcut works
- System prompt appears in API calls
- Retention period deletes old conversations
- Export/import works without data loss

---

## Phase 6: Polish & Quality of Life

### Goal
Production-ready UX with smooth animations and edge case handling.

### Tasks

#### 6.1 Animations
**File**: `src/content/components/Dialog.tsx`

Add CSS transitions:
- Fade-in backdrop (150ms)
- Scale-in dialog (200ms with ease-out)
- Slide-in history panel (250ms)
- Smooth resize (no animation, just smooth dragging)

**Implementation**:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

#### 6.2 Toast Notifications
**File**: `src/content/components/Toast.tsx` (new)

Simple toast system:
- Copy success: "Response copied!"
- Error: "API error: [message]"
- Settings saved: "Settings updated"
- Position: top-right, auto-dismiss after 3s

**Component**:
```tsx
<Toast
  message="Response copied!"
  type="success"
  onDismiss={() => {}}
/>
```

Use React context or simple state management.

#### 6.3 Keyboard Navigation
**Files**: All components

Ensure full keyboard access:
- Tab through all interactive elements
- Focus visible on all buttons/inputs
- Keyboard shortcuts:
  - `Ctrl+K`: Clear input
  - `Ctrl+N`: New conversation
  - `Ctrl+H`: Toggle history
  - `Ctrl+/`: Show keyboard shortcuts help

Add shortcuts help modal triggered by `?` or `Ctrl+/`.

#### 6.4 Loading States
**File**: `src/content/components/Response.tsx`

Improve loading indicator:
- Show estimated time if >5s
- Pulse animation during streaming
- Cancel button (wire up `cancelStream` message)
- Progress indicator if possible

#### 6.5 Error Recovery
**Files**: `src/content/components/Dialog.tsx`, `src/background/service-worker.ts`

Handle edge cases:
- Network offline → show clear message + retry
- Rate limit → show countdown timer
- Invalid API key → link to settings
- Context too large → offer to truncate
- Empty response → "No response received"

Add retry logic with exponential backoff.

#### 6.6 Right-Click Context Menu
**Files**: `manifest.json`, `src/background/service-worker.ts`

Add context menu on text selection:
```json
{
  "permissions": ["contextMenus"],
  "background": {
    "service_worker": "background.js"
  }
}
```

**Background**:
```ts
chrome.contextMenus.create({
  id: 'ask-claude',
  title: 'Ask Claude about "%s"',
  contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Send message to content script
  // Open dialog with selection pre-filled
});
```

#### 6.7 Responsive Design
**File**: `src/content/components/Dialog.tsx`

Handle small viewports:
- Min size: 400×200
- On small screens (<768px wide): use 90vw width
- Stack history panel below on mobile
- Touch-friendly hit targets (44×44px minimum)

#### 6.8 Syntax Theme Selection
**File**: `src/settings/Settings.tsx`, `src/content/components/Response.tsx`

Allow choosing highlight.js theme:
- GitHub (current default)
- VS Code Dark
- Monokai
- Tomorrow Night

Load dynamically based on setting.

#### 6.9 Pin/Unpin Dialog
**File**: `src/content/components/Dialog.tsx`

Add 📌 button to header:
- When pinned: dialog stays open while browsing
- When unpinned: closes on backdrop click
- Persist pin state

### Validation
- No console errors
- Smooth 60fps animations
- All keyboard shortcuts work
- Toasts appear/dismiss correctly
- Right-click menu functions
- Works on mobile viewport
- Retry logic handles network issues
- Pin/unpin persists

---

## Implementation Order

Recommended sequence:
1. **Phase 4.2-4.3**: Visual history first (shows immediate value)
2. **Phase 4.1**: Wire up persistence
3. **Phase 4.4**: New conversation flow
4. **Phase 5**: Settings (can be done in parallel)
5. **Phase 6**: Polish incrementally

## Testing Checklist

### Phase 4
- [ ] Create 5+ conversations
- [ ] Search finds correct results
- [ ] Export produces valid files
- [ ] Import restores correctly
- [ ] Conversation depth setting works
- [ ] History persists across browser restarts
- [ ] Delete removes from storage

### Phase 5
- [ ] All settings save/load
- [ ] Theme changes apply immediately
- [ ] Custom shortcut works
- [ ] Retention deletes old conversations
- [ ] Storage usage accurate

### Phase 6
- [ ] Animations smooth on low-end device
- [ ] Toasts don't stack or overlap
- [ ] All keyboard shortcuts work
- [ ] Right-click menu functions
- [ ] Retry logic handles failures
- [ ] Works in Firefox mobile (if supported)

## Known Limitations

### Current Bundle Size
`content.js` is 1.2MB (395KB gzipped) due to:
- highlight.js includes all languages
- React + React-DOM
- marked parser

**Optimization opportunities**:
- Import only common highlight.js languages
- Use Preact instead of React (3KB vs 40KB)
- Code-split markdown parser (load on demand)
- Use lighter markdown parser

### Browser Compatibility
- Built for Firefox only (manifest v3)
- Chrome support requires testing (minimal changes expected)
- Safari requires conversion to Safari extension format

### Performance
- Large pages (>100k chars) may slow context extraction
- Highlight.js can be slow on very large code blocks
- Consider web worker for heavy processing

## Future Enhancements (Beyond Phase 6)

- **Templates**: Save favorite prompts
- **Multi-language**: i18n support
- **Voice input**: Speech-to-text
- **Image context**: Screenshot analysis
- **Collaboration**: Share conversations
- **Plugins**: Custom tools/functions
- **Mobile**: Firefox for Android support
