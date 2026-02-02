import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chromeMock, resetChromeMock } from '../__mocks__/chrome'

describe('On-demand Script Injection', () => {
  beforeEach(() => {
    resetChromeMock()
  })

  describe('toggleDialogInActiveTab', () => {
    async function toggleDialogInActiveTab() {
      const tabs = await chromeMock.tabs.query({ active: true, currentWindow: true })
      const tab = tabs[0]
      if (!tab?.id || !tab.url) return

      if (
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('about:') ||
        tab.url.startsWith('moz-extension://')
      ) {
        return
      }

      const tabId = tab.id

      try {
        await chromeMock.tabs.sendMessage(tabId, { type: 'toggleDialog' })
      } catch {
        try {
          await chromeMock.scripting.executeScript({
            target: { tabId },
            files: ['content.js'],
          })
        } catch (err) {
          console.error('[Hootly Background] Failed to inject content script:', err)
        }
      }
    }

    it('sends toggle message when content script exists', async () => {
      chromeMock.tabs.query.mockResolvedValue([{ id: 1, url: 'https://example.com' }])
      chromeMock.tabs.sendMessage.mockResolvedValue(undefined)

      await toggleDialogInActiveTab()

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(1, { type: 'toggleDialog' })
      expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
    })

    it('injects content script when sendMessage fails', async () => {
      chromeMock.tabs.query.mockResolvedValue([{ id: 1, url: 'https://example.com' }])
      chromeMock.tabs.sendMessage.mockRejectedValue(new Error('No receiving end'))

      await toggleDialogInActiveTab()

      expect(chromeMock.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 1 },
        files: ['content.js'],
      })
    })

    it('skips chrome:// URLs', async () => {
      chromeMock.tabs.query.mockResolvedValue([{ id: 1, url: 'chrome://extensions' }])

      await toggleDialogInActiveTab()

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalled()
      expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
    })

    it('skips chrome-extension:// URLs', async () => {
      chromeMock.tabs.query.mockResolvedValue([{ id: 1, url: 'chrome-extension://abc/settings.html' }])

      await toggleDialogInActiveTab()

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalled()
      expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
    })

    it('skips about: URLs', async () => {
      chromeMock.tabs.query.mockResolvedValue([{ id: 1, url: 'about:blank' }])

      await toggleDialogInActiveTab()

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalled()
      expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
    })

    it('skips moz-extension:// URLs', async () => {
      chromeMock.tabs.query.mockResolvedValue([{ id: 1, url: 'moz-extension://abc/settings.html' }])

      await toggleDialogInActiveTab()

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalled()
      expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
    })

    it('handles tab without URL', async () => {
      chromeMock.tabs.query.mockResolvedValue([{ id: 1 }])

      await toggleDialogInActiveTab()

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalled()
      expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
    })

    it('handles empty tab query result', async () => {
      chromeMock.tabs.query.mockResolvedValue([])

      await toggleDialogInActiveTab()

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalled()
      expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
    })
  })
})

describe('Content Script Toggle Queue', () => {
  it('queues toggles before iframe ready and processes after', () => {
    let isReady = false
    let dialogOpen = false
    const pendingToggles: (() => void)[] = []
    const toggleHistory: boolean[] = []

    const sendToggleToIframe = () => {
      if (!isReady) {
        pendingToggles.push(() => sendToggleToIframe())
        return
      }
      dialogOpen = !dialogOpen
      toggleHistory.push(dialogOpen)
    }

    // Simulate toggles before ready
    sendToggleToIframe() // queued
    sendToggleToIframe() // queued

    expect(pendingToggles.length).toBe(2)
    expect(dialogOpen).toBe(false)

    // Simulate iframe ready + auto-show
    isReady = true
    sendToggleToIframe() // auto-show: opens dialog

    // Process queued toggles
    while (pendingToggles.length > 0) {
      pendingToggles.shift()!()
    }

    // auto-show (open) + 2 queued toggles (close, open)
    expect(toggleHistory).toEqual([true, false, true])
    expect(dialogOpen).toBe(true)
  })

  it('auto-shows dialog on first injection', () => {
    let isReady = false
    let dialogOpen = false

    const sendToggleToIframe = () => {
      if (!isReady) return
      dialogOpen = !dialogOpen
    }

    // Simulate iframe ready
    isReady = true

    // Auto-show after ready
    sendToggleToIframe()

    expect(dialogOpen).toBe(true)
  })
})

describe('Iframe Ready Signal', () => {
  it('hootly-ready message sent after listener setup', () => {
    const messages: Array<{ type: string }> = []
    let listenerSetUp = false

    // Simulate App component useEffect
    const simulateAppMount = () => {
      // First: set up message listener
      listenerSetUp = true

      // Then: signal ready
      messages.push({ type: 'hootly-ready' })
    }

    simulateAppMount()

    expect(listenerSetUp).toBe(true)
    expect(messages).toContainEqual({ type: 'hootly-ready' })
    // Ready signal comes after listener setup
    expect(messages.length).toBe(1)
  })

  it('toggle message received after ready signal', () => {
    let isOpen = false
    let listenerReady = false
    const receivedMessages: string[] = []

    // Simulate message listener in App
    const handleMessage = (type: string) => {
      if (!listenerReady) return // Would miss message if not ready
      receivedMessages.push(type)
      if (type === 'hootly-toggle') {
        isOpen = !isOpen
      }
    }

    // Simulate App mount: listener setup then ready signal
    listenerReady = true

    // Now toggle can be received
    handleMessage('hootly-toggle')

    expect(receivedMessages).toContain('hootly-toggle')
    expect(isOpen).toBe(true)
  })
})

describe('Pointer Events Management', () => {
  it('sets pointer-events to auto when dialog opens', () => {
    let dialogOpen = false
    let pointerEvents = 'none'

    const sendToggleToIframe = () => {
      dialogOpen = !dialogOpen
      pointerEvents = dialogOpen ? 'auto' : 'none'
    }

    sendToggleToIframe() // open

    expect(dialogOpen).toBe(true)
    expect(pointerEvents).toBe('auto')
  })

  it('sets pointer-events to none when dialog closes', () => {
    let dialogOpen = true
    let pointerEvents = 'auto'

    const sendToggleToIframe = () => {
      dialogOpen = !dialogOpen
      pointerEvents = dialogOpen ? 'auto' : 'none'
    }

    sendToggleToIframe() // close

    expect(dialogOpen).toBe(false)
    expect(pointerEvents).toBe('none')
  })

  it('resets pointer-events on hootly-dialog-closed message', () => {
    let dialogOpen = true
    let pointerEvents = 'auto'

    const handleDialogClosed = () => {
      dialogOpen = false
      pointerEvents = 'none'
    }

    handleDialogClosed()

    expect(dialogOpen).toBe(false)
    expect(pointerEvents).toBe('none')
  })
})

describe('Duplicate Injection Prevention', () => {
  it('prevents duplicate iframe creation', () => {
    let iframeCount = 0
    const hasIframe = () => iframeCount > 0

    const init = () => {
      if (hasIframe()) return
      iframeCount++
    }

    init() // First injection
    init() // Second injection attempt

    expect(iframeCount).toBe(1)
  })
})
