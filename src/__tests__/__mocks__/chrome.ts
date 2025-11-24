// Chrome API mock for testing

type StorageData = Record<string, unknown>
type StorageCallback = (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>, areaName: string) => void

let storage: StorageData = {}
const storageListeners: StorageCallback[] = []

export const chromeMock = {
  storage: {
    local: {
      get: vi.fn((keys?: string | string[] | null) => {
        if (!keys) return Promise.resolve({ ...storage })
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: storage[keys] })
        }
        const result: StorageData = {}
        keys.forEach(key => {
          if (key in storage) result[key] = storage[key]
        })
        return Promise.resolve(result)
      }),
      set: vi.fn((items: StorageData) => {
        const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {}
        Object.entries(items).forEach(([key, value]) => {
          changes[key] = { oldValue: storage[key], newValue: value }
          storage[key] = value
        })
        storageListeners.forEach(listener => listener(changes, 'local'))
        return Promise.resolve()
      }),
      remove: vi.fn((keys: string | string[]) => {
        const keysArray = typeof keys === 'string' ? [keys] : keys
        const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {}
        keysArray.forEach(key => {
          changes[key] = { oldValue: storage[key], newValue: undefined }
          delete storage[key]
        })
        storageListeners.forEach(listener => listener(changes, 'local'))
        return Promise.resolve()
      }),
      clear: vi.fn(() => {
        storage = {}
        return Promise.resolve()
      }),
    },
    onChanged: {
      addListener: vi.fn((callback: StorageCallback) => {
        storageListeners.push(callback)
      }),
      removeListener: vi.fn((callback: StorageCallback) => {
        const index = storageListeners.indexOf(callback)
        if (index > -1) storageListeners.splice(index, 1)
      }),
    },
  },
  runtime: {
    sendMessage: vi.fn(() => Promise.resolve()),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
    id: 'mock-extension-id',
  },
  tabs: {
    query: vi.fn(() => Promise.resolve([{ id: 1, url: 'https://example.com' }])),
    sendMessage: vi.fn(() => Promise.resolve()),
    create: vi.fn(() => Promise.resolve({ id: 2 })),
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
    },
  },
  commands: {
    onCommand: {
      addListener: vi.fn(),
    },
  },
}

export function resetChromeMock() {
  storage = {}
  storageListeners.length = 0
  vi.clearAllMocks()
}

export function setMockStorage(data: StorageData) {
  storage = { ...data }
}

export function getMockStorage(): StorageData {
  return { ...storage }
}

// Install mock globally
export function installChromeMock() {
  ;(globalThis as unknown as { chrome: typeof chromeMock }).chrome = chromeMock
}
