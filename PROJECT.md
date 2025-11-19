
I want to create a firefox browser extension with the following requirements and features:

The name of the extension is "FireClaude"

### Core Functionality

**Popup Dialog**
- Opens via `Alt+W` keyboard shortcut (configurable in settings)
- Dimensions: 800×400px, draggable and resizable
- Semi-transparent backdrop to maintain page awareness
- Remembers last position on the page
- `Esc` key to close

**Input Area**
- Auto-expanding textarea (min 2 lines, max 6 lines before scrolling)
- `Enter` to send, `Shift+Enter` for newline
- Character/token count indicator
- Clear button to reset input

**Context Injection**
- 🌐 button toggles full page context (visual indicator when active)
- If text is selected on page, automatically uses selection instead (with visual indicator showing "Selection mode")
- Preview button to see what context will be sent
- Option to include page metadata (title, URL, meta description)

**Response Display**
- Scrollable response area with proper markdown rendering (headers, code blocks with syntax highlighting, lists, tables)
- 📋 Copy button for the response only
- Streaming response display (shows text as it generates)
- Collapsible sections for long responses

### Conversation Features

**Iterative Prompting**
- Previous context automatically included (configurable depth: last 1, 3, 5, or all exchanges)
- Visual conversation thread showing prompt/response pairs
- Ability to branch from any previous response
- "New conversation" button to start fresh

**History (📜)**
- Local history stored in browser (with configurable retention period)
- Search/filter through past conversations
- Export conversations as markdown/JSON
- Option to sync with Claude.ai account if connected
- Delete individual conversations or clear all

### Settings Page

**API Configuration**
- API key input with secure storage
- Model selection (Claude Sonnet, Opus, Haiku)
- Max tokens setting
- Temperature slider

**Behavior Settings**
- Custom keyboard shortcut
- Default context inclusion preference
- Auto-close after copy option
- Theme (light/dark/system)
- Font size for response area

**Context Settings**
- Max context length limit
- Include/exclude page elements (scripts, styles, images alt text)
- Custom system prompt prefix

### Additional Improvements

**Quality of Life**
- Loading indicator with cancel button during generation
- Error handling with clear messages (rate limits, API errors)
- Keyboard navigation throughout the interface
- Pin/unpin to keep dialog open while browsing

**Visual Polish**
- Subtle animations for open/close
- Toast notifications for copy success
- Syntax highlighting matching popular themes
- Responsive design for smaller viewports

**Advanced Features (Future)**
- Quick actions: "Summarize", "Explain", "Translate" buttons
- Save favorite prompts as templates
- Multi-language support
- Right-click context menu integration ("Ask Claudex about selection")
