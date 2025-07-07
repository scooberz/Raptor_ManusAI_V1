// tests/jest-setup.js

// Add missing properties to the JSDOM window object.
// This is safer than replacing the whole object.
window.addEventListener = jest.fn();
window.requestAnimationFrame = jest.fn();
window.AudioContext = jest.fn().mockImplementation(() => ({
    createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: { setValueAtTime: jest.fn() },
    })),
    destination: {},
}));

// Mock the document object's getElementById method.
document.getElementById = jest.fn((id) => ({
    getContext: jest.fn(() => ({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        canvas: { width: 800, height: 600 },
    })),
    style: {}, // Provide a dummy style object
}));