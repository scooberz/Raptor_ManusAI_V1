// tests/jest-setup.js
window.addEventListener = jest.fn();
window.requestAnimationFrame = jest.fn((cb) => cb());
window.AudioContext = jest.fn().mockImplementation(() => ({
    createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: { setValueAtTime: jest.fn() },
    })),
    destination: {},
}));

document.getElementById = jest.fn((id) => ({
    getContext: jest.fn(() => ({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        canvas: { width: 800, height: 600 },
    })),
    style: {},
    addEventListener: jest.fn(),
}));