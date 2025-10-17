import { vi } from 'vitest';
global.chrome = {
    runtime: {
        sendMessage: vi.fn(),
        onMessage: {
            addListener: vi.fn(),
        },
        onInstalled: {
            addListener: vi.fn(),
        },
    },
    storage: {
        local: {
            get: vi.fn(),
            set: vi.fn(),
            clear: vi.fn(),
        },
    },
    alarms: {
        create: vi.fn(),
        onAlarm: {
            addListener: vi.fn(),
        },
    },
};
