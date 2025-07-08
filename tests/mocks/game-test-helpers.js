/**
 * Sets up all necessary mocks for game testing
 */
export function setupGameMocks() {
    // Mock AudioContext
    const originalAudioContext = window.AudioContext;
    window.AudioContext = jest.fn().mockImplementation(function() {
        this.createGain = jest.fn(() => ({
            connect: jest.fn(),
            disconnect: jest.fn(),
            gain: { value: 1 },
        }));
        this.decodeAudioData = jest.fn();
    });
    window.webkitAudioContext = window.AudioContext;

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn(cb => {
        return 1;
    });

    // Mock Image constructor
    Object.defineProperty(global, 'Image', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
            addEventListener: jest.fn((event, callback) => {
                if (event === 'load') {
                    callback();
                }
            }),
            removeEventListener: jest.fn(),
            src: '',
            width: 100,
            height: 100,
        })),
    });

    // Mock window properties
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 600 });
    Object.defineProperty(window, 'ontouchstart', { writable: true, value: undefined });
    Object.defineProperty(navigator, 'maxTouchPoints', { writable: true, value: 0 });

    // Mock fetch API
    global.fetch = jest.fn((url) => {
        if (url.includes('introCutscene.json')) {
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ events: [] }),
            });
        } else if (url.includes('level1.json')) {
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ 
                    levelName: 'Mock Level', 
                    waves: [],
                    background: { width: 800, height: 600 }
                }),
            });
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
    });

    // Mock DOM elements
    setupDOMMocks();
}

/**
 * Sets up DOM-related mocks
 */
function setupDOMMocks() {
    // Mock document.getElementById
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
        // Mock canvas elements
        if (id.includes('layer')) {
            return createMockCanvas(id);
        }
        // Mock screen elements
        if (id === 'menu-screen' || id === 'game-over-screen' || id === 'loading-screen') {
            return { 
                style: { display: '' }, 
                appendChild: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            };
        }
        return null;
    });

    // Mock document.createElement
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        const element = {
            tagName: tagName.toUpperCase(),
            style: {},
            appendChild: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            setAttribute: jest.fn(),
        };

        if (tagName.toLowerCase() === 'canvas') {
            Object.assign(element, createMockCanvas());
        }
        return element;
    });

    // Mock window.addEventListener
    jest.spyOn(window, 'addEventListener').mockImplementation(jest.fn());
}

/**
 * Creates a mock canvas element
 */
function createMockCanvas(id = 'mock-canvas') {
    const canvas = {
        id: id,
        width: 800,
        height: 600,
        style: {},
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        appendChild: jest.fn(),
        getContext: jest.fn(() => ({
            clearRect: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            globalCompositeOperation: '',
            imageSmoothingEnabled: true,
            fillText: jest.fn(),
            drawImage: jest.fn(),
            canvas: { width: 800, height: 600 },
        })),
    };
    return canvas;
}

/**
 * Creates a mock game state
 */
export function createMockState(name) {
    return {
        name: name,
        enter: jest.fn(),
        exit: jest.fn(),
        update: jest.fn(),
        render: jest.fn(),
    };
}

/**
 * Creates a mock game object with all necessary properties
 */
export function createMockGame() {
    return {
        width: 800,
        height: 600,
        isTouchDevice: false,
        playerData: { health: 100, money: 0, score: 0 },
        assets: {
            getImage: jest.fn(),
            loadImage: jest.fn(),
        },
        input: {
            getMousePosition: jest.fn().mockReturnValue({ x: 0, y: 0 }),
            isMouseButtonPressed: jest.fn().mockReturnValue(false),
            isKeyPressed: jest.fn().mockReturnValue(false),
        },
        audio: {
            playSound: jest.fn(),
            playMusic: jest.fn(),
            stopMusic: jest.fn(),
        },
        collision: {
            addToGroup: jest.fn(),
            checkCollision: jest.fn(),
            collisionGroups: {
                enemies: [],
                enemyProjectiles: [],
            },
        },
        entityManager: {
            add: jest.fn(),
            update: jest.fn(),
            render: jest.fn(),
        },
        saveManager: {
            save: jest.fn(),
            load: jest.fn(),
        },
        projectilePool: {
            get: jest.fn(),
        },
        missilePool: {
            get: jest.fn(),
        },
        changeState: jest.fn(),
        currentState: null,
        states: {},
    };
}

/**
 * Cleans up all mocks after tests
 */
export function cleanupMocks() {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
} 