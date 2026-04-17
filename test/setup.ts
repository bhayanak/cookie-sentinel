import '@testing-library/jest-dom';

// Mock chrome APIs
const chromeMock = {
  cookies: {
    getAll: vi.fn().mockResolvedValue([]),
    set: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue({}),
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  tabs: {
    get: vi.fn().mockResolvedValue({ url: 'https://example.com' }),
    query: vi.fn().mockResolvedValue([{ id: 1, url: 'https://example.com' }]),
    sendMessage: vi.fn().mockResolvedValue({}),
  },
  runtime: {
    sendMessage: vi.fn().mockResolvedValue({ success: true, data: [] }),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([{ result: { items: [], hostname: 'example.com' } }]),
  },
  devtools: {
    inspectedWindow: { tabId: 1 },
    panels: { create: vi.fn() },
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
};

Object.assign(globalThis, { chrome: chromeMock });
