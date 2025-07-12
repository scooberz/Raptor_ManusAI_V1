import { AssetManager } from '../js/engine/assets.js';

// Mock the logger to avoid console output during tests
jest.mock('../js/utils/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Image constructor
global.Image = jest.fn().mockImplementation(() => ({
  crossOrigin: '',
  onload: null,
  onerror: null,
  src: '',
  width: 100,
  height: 100,
}));

// Mock fetch for JSON loading
global.fetch = jest.fn();

describe('AssetManager', () => {
  let assetManager;

  beforeEach(() => {
    assetManager = new AssetManager();
    jest.clearAllMocks();
  });

  describe('Constructor and Initial State', () => {
    test('should initialize with empty asset collections', () => {
      expect(assetManager.images).toEqual({});
      expect(assetManager.audio).toEqual({});
      expect(assetManager.data).toEqual({});
    });

    test('should initialize with zero loading counters', () => {
      expect(assetManager.totalAssets).toBe(0);
      expect(assetManager.loadedAssets).toBe(0);
    });

    test('should initialize with null callbacks', () => {
      expect(assetManager.onProgress).toBeNull();
      expect(assetManager.onComplete).toBeNull();
      expect(assetManager.onGameplayAssetsLoaded).toBeNull();
    });

    test('should initialize with gameplay assets not loaded', () => {
      expect(assetManager.gameplayAssetsLoaded).toBe(false);
    });
  });

  describe('Image Loading', () => {
    test('should load image successfully and store it', async () => {
      const mockImage = {
        crossOrigin: '',
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 100,
      };
      
      global.Image.mockImplementation(() => mockImage);

      const loadPromise = assetManager.loadImage('testImage', 'test.png');
      
      // Simulate successful image load
      mockImage.onload();

      const result = await loadPromise;

      expect(assetManager.images.testImage).toBe(mockImage);
      expect(assetManager.totalAssets).toBe(1);
      expect(assetManager.loadedAssets).toBe(1);
      expect(result).toBe(mockImage);
    });

    test('should handle image loading errors', async () => {
      const mockImage = {
        crossOrigin: '',
        onload: null,
        onerror: null,
        src: '',
      };
      
      global.Image.mockImplementation(() => mockImage);

      const loadPromise = assetManager.loadImage('testImage', 'invalid.png');
      
      // Simulate image load error
      const error = new Error('Image load failed');
      mockImage.onerror(error);

      await expect(loadPromise).rejects.toThrow('Failed to load image: invalid.png');
      expect(assetManager.totalAssets).toBe(1);
      expect(assetManager.loadedAssets).toBe(0); // Should not increment on error
    });

    test('should skip loading if image already exists', async () => {
      const existingImage = { width: 50, height: 50 };
      assetManager.images.existingImage = existingImage;

      const result = await assetManager.loadImage('existingImage', 'test.png');

      expect(result).toBe(existingImage);
      expect(assetManager.totalAssets).toBe(0); // Should not increment
      expect(assetManager.loadedAssets).toBe(0); // Should not increment
    });
  });

  describe('JSON Loading', () => {
    test('should load JSON data successfully', async () => {
      const mockData = { level: 1, enemies: ['fighter', 'bomber'] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await assetManager.loadJSON('levelData', 'level1.json');

      expect(assetManager.data.levelData).toEqual(mockData);
      expect(assetManager.totalAssets).toBe(1);
      expect(assetManager.loadedAssets).toBe(1);
      expect(result).toEqual(mockData);
    });

    test('should handle JSON loading errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(assetManager.loadJSON('levelData', 'invalid.json'))
        .rejects.toThrow('Failed to load JSON: invalid.json');
      
      expect(assetManager.totalAssets).toBe(1);
      expect(assetManager.loadedAssets).toBe(0); // Should not increment on error
    });

    test('should handle network errors during JSON loading', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(assetManager.loadJSON('levelData', 'level1.json'))
        .rejects.toThrow('Network error');
    });
  });

  describe('Asset Retrieval', () => {
    test('should retrieve stored images', () => {
      const testImage = { width: 100, height: 100 };
      assetManager.images.testImage = testImage;

      const result = assetManager.getImage('testImage');
      expect(result).toBe(testImage);
    });

    test('should return undefined for non-existent images', () => {
      const result = assetManager.getImage('nonExistent');
      expect(result).toBeUndefined();
    });

    test('should retrieve stored data', () => {
      const testData = { score: 1000 };
      assetManager.data.testData = testData;

      const result = assetManager.getData('testData');
      expect(result).toEqual(testData);
    });

    test('should return undefined for non-existent data', () => {
      const result = assetManager.getData('nonExistent');
      expect(result).toBeUndefined();
    });
  });

  describe('Loading Progress and Completion', () => {
    test('should calculate loading progress correctly', () => {
      assetManager.totalAssets = 4;
      assetManager.loadedAssets = 2;

      const progress = assetManager.getLoadingProgress();
      expect(progress).toBe(50);
    });

    test('should return 0 progress when no assets are queued', () => {
      const progress = assetManager.getLoadingProgress();
      expect(progress).toBe(0);
    });

    test('should return 100 progress when all assets are loaded', () => {
      assetManager.totalAssets = 3;
      assetManager.loadedAssets = 3;

      const progress = assetManager.getLoadingProgress();
      expect(progress).toBe(100);
    });

    test('should correctly identify when loading is complete', () => {
      assetManager.totalAssets = 2;
      assetManager.loadedAssets = 2;

      expect(assetManager.isLoadingComplete()).toBe(true);
    });

    test('should return false when loading is not complete', () => {
      assetManager.totalAssets = 3;
      assetManager.loadedAssets = 1;

      expect(assetManager.isLoadingComplete()).toBe(false);
    });

    test('should return false when no assets are queued', () => {
      expect(assetManager.isLoadingComplete()).toBe(false);
    });
  });

  describe('Callback Management', () => {
    test('should set progress callback', () => {
      const mockCallback = jest.fn();
      assetManager.setProgressCallback(mockCallback);

      expect(assetManager.onProgress).toBe(mockCallback);
    });

    test('should set complete callback', () => {
      const mockCallback = jest.fn();
      assetManager.setCompleteCallback(mockCallback);

      expect(assetManager.onComplete).toBe(mockCallback);
    });

    test('should set gameplay assets loaded callback', () => {
      const mockCallback = jest.fn();
      assetManager.setGameplayAssetsLoadedCallback(mockCallback);

      expect(assetManager.onGameplayAssetsLoaded).toBe(mockCallback);
    });

    test('should call progress callback when assets load', async () => {
      const mockProgressCallback = jest.fn();
      assetManager.setProgressCallback(mockProgressCallback);

      const mockImage = {
        crossOrigin: '',
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 100,
      };
      
      global.Image.mockImplementation(() => mockImage);

      const loadPromise = assetManager.loadImage('testImage', 'test.png');
      mockImage.onload();
      await loadPromise;

      expect(mockProgressCallback).toHaveBeenCalledWith(100);
    });

    test('should call complete callback when all assets are loaded', async () => {
      const mockCompleteCallback = jest.fn();
      assetManager.setCompleteCallback(mockCompleteCallback);

      const mockImage = {
        crossOrigin: '',
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 100,
      };
      
      global.Image.mockImplementation(() => mockImage);

      const loadPromise = assetManager.loadImage('testImage', 'test.png');
      mockImage.onload();
      await loadPromise;

      expect(mockCompleteCallback).toHaveBeenCalled();
    });
  });

  describe('Bulk Asset Loading', () => {
    test('should load multiple assets simultaneously', async () => {
      const mockImage1 = {
        crossOrigin: '',
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 100,
      };
      const mockImage2 = {
        crossOrigin: '',
        onload: null,
        onerror: null,
        src: '',
        width: 200,
        height: 200,
      };
      
      global.Image
        .mockImplementationOnce(() => mockImage1)
        .mockImplementationOnce(() => mockImage2);

      const mockData = { level: 1 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const assets = {
        images: {
          image1: 'image1.png',
          image2: 'image2.png',
        },
        data: {
          levelData: 'level1.json',
        },
      };

      const loadPromise = assetManager.loadAssets(assets);
      
      // Simulate image loads
      mockImage1.onload();
      mockImage2.onload();

      await loadPromise;

      expect(assetManager.images.image1).toBe(mockImage1);
      expect(assetManager.images.image2).toBe(mockImage2);
      expect(assetManager.data.levelData).toEqual(mockData);
      expect(assetManager.totalAssets).toBe(3);
      expect(assetManager.loadedAssets).toBe(3);
    });

    test('should store asset list when loading assets', async () => {
      const assets = {
        images: { testImage: 'test.png' },
        data: { testData: 'test.json' },
      };

      const mockImage = {
        crossOrigin: '',
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 100,
      };

      global.Image.mockImplementation(() => mockImage);

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const loadPromise = assetManager.loadAssets(assets);
      
      // Simulate image load
      mockImage.onload();

      await loadPromise;

      expect(assetManager.assetList).toEqual(assets);
    });
  });

  describe('Gameplay Assets Loading', () => {
    test('should load gameplay assets successfully', async () => {
      const mockCallback = jest.fn();
      assetManager.setGameplayAssetsLoadedCallback(mockCallback);

      // Mock all the image loads
      const mockImages = Array(30).fill(null).map(() => ({
        crossOrigin: '',
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 100,
      }));

      global.Image.mockImplementation(() => {
        const image = mockImages.shift();
        // Simulate immediate load
        if (image && image.onload) {
          setTimeout(() => image.onload(), 0);
        }
        return image;
      });

      const loadPromise = assetManager.loadGameplayAssets();
      await loadPromise;

      expect(assetManager.gameplayAssetsLoaded).toBe(true);
      expect(mockCallback).toHaveBeenCalled();
    }, 10000); // Increase timeout for this test

    test('should handle gameplay assets loading errors gracefully', async () => {
      global.Image.mockImplementation(() => {
        const image = {
          crossOrigin: '',
          onload: null,
          onerror: null,
          src: '',
        };
        // Simulate immediate error
        setTimeout(() => image.onerror(new Error('Load failed')), 0);
        return image;
      });

      // Should not throw error
      await expect(assetManager.loadGameplayAssets()).resolves.toBeUndefined();
      
      // Should not mark as loaded
      expect(assetManager.gameplayAssetsLoaded).toBe(false);
    });
  });
}); 