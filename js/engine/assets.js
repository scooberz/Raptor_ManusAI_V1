/**
 * AssetManager class
 * Handles loading and managing game assets (images, audio, data)
 */
class AssetManager {
    constructor() {
        this.images = {};
        this.audio = {};
        this.data = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.onProgress = null;
        this.onComplete = null;
    }
    
    /**
     * Load an image asset
     * @param {string} key - The key to store the image under
     * @param {string} src - The source URL of the image
     * @returns {Promise} A promise that resolves when the image is loaded
     */
    loadImage(key, src) {
        this.totalAssets++;
        console.log(`Loading image: ${key} from ${src}`);
        
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';  // Enable CORS for image processing
            
            image.onload = () => {
                console.log(`Image loaded: ${key}, size: ${image.width}x${image.height}`);
                
                // Create a temporary canvas
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                
                // Draw the image
                ctx.drawImage(image, 0, 0);
                
                // Get the image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Process the image data to make background pixels transparent
                let transparentPixels = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];
                    
                    // Check if pixel is part of the background
                    // This includes white, light gray, and very light colors
                    const isBackground = (
                        // White or near-white
                        (r > 240 && g > 240 && b > 240) ||
                        // Light gray
                        (Math.abs(r - g) < 5 && Math.abs(g - b) < 5 && r > 200) ||
                        // Very light colors
                        (r > 230 && g > 230 && b > 230)
                    );
                    
                    if (isBackground) {
                        data[i + 3] = 0;  // Set alpha to 0
                        transparentPixels++;
                    }
                }
                
                console.log(`Processed ${key}: Made ${transparentPixels} pixels transparent`);
                
                // Put the processed image data back
                ctx.putImageData(imageData, 0, 0);
                
                // Create a new image from the processed canvas
                const processedImage = new Image();
                processedImage.onload = () => {
                    this.images[key] = processedImage;
                    this.loadedAssets++;
                    this.notifyProgress();
                    resolve(processedImage);
                };
                processedImage.src = canvas.toDataURL('image/png');
            };
            
            image.onerror = (error) => {
                console.error(`Failed to load image: ${src}`, error);
                reject(new Error(`Failed to load image: ${src}`));
            };
            
            image.src = src;
        });
    }
    
    /**
     * Load an audio asset
     * @param {string} key - The key to store the audio under
     * @param {string} src - The source URL of the audio
     * @returns {Promise} A promise that resolves when the audio is loaded
     */
    loadAudio(key, src) {
        this.totalAssets++;
        
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.audio[key] = audio;
                this.loadedAssets++;
                this.notifyProgress();
                resolve(audio);
            };
            audio.onerror = () => {
                console.error(`Failed to load audio: ${src}`);
                reject(new Error(`Failed to load audio: ${src}`));
            };
            audio.src = src;
        });
    }
    
    /**
     * Load a JSON data asset
     * @param {string} key - The key to store the data under
     * @param {string} src - The source URL of the JSON data
     * @returns {Promise} A promise that resolves when the data is loaded
     */
    loadJSON(key, src) {
        this.totalAssets++;
        
        return fetch(src)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load JSON: ${src}`);
                }
                return response.json();
            })
            .then(data => {
                this.data[key] = data;
                this.loadedAssets++;
                this.notifyProgress();
                return data;
            })
            .catch(error => {
                console.error(`Failed to load JSON: ${src}`, error);
                throw error;
            });
    }
    
    /**
     * Load multiple assets at once
     * @param {Object} assets - Object containing assets to load
     * @returns {Promise} A promise that resolves when all assets are loaded
     */
    loadAssets(assets) {
        const promises = [];
        
        if (assets.images) {
            Object.entries(assets.images).forEach(([key, src]) => {
                promises.push(this.loadImage(key, src));
            });
        }
        
        // Define and load all new enemy sprites
        const enemySprites = {
            'enemyStriker': 'assets/images/enemies/striker.png',
            'enemyCyclone': 'assets/images/enemies/cyclone.png',
            'enemyGnat':    'assets/images/enemies/gnat.png',
            'enemyReaper':  'assets/images/enemies/reaper.png',
            'enemyDart':    'assets/images/enemies/dart.png',
            'enemyGoliath': 'assets/images/enemies/goliath.png',
            'enemyCutter':  'assets/images/enemies/cutter.png',
            'enemyMine':    'assets/images/enemies/mine.png'
        };

        Object.entries(enemySprites).forEach(([key, src]) => {
            promises.push(this.loadImage(key, src));
        });
        
        if (assets.audio) {
            Object.entries(assets.audio).forEach(([key, src]) => {
                promises.push(this.loadAudio(key, src));
            });
        }
        
        if (assets.data) {
            Object.entries(assets.data).forEach(([key, src]) => {
                promises.push(this.loadJSON(key, src));
            });
        }
        return Promise.all(promises);
    }
    
    /**
     * Get an image asset
     * @param {string} key - The key of the image to get
     * @returns {Image} The image asset
     */
    getImage(key) {
        return this.images[key];
    }
    
    /**
     * Get an audio asset
     * @param {string} key - The key of the audio to get
     * @returns {Audio} The audio asset
     */
    getAudio(key) {
        return this.audio[key];
    }
    
    /**
     * Get a data asset
     * @param {string} key - The key of the data to get
     * @returns {Object} The data asset
     */
    getData(key) {
        return this.data[key];
    }
    
    /**
     * Check if all assets are loaded
     * @returns {boolean} True if all assets are loaded
     */
    isLoadingComplete() {
        return this.loadedAssets === this.totalAssets && this.totalAssets > 0;
    }
    
    /**
     * Get the loading progress as a percentage
     * @returns {number} The loading progress (0-100)
     */
    getLoadingProgress() {
        return this.totalAssets > 0 ? (this.loadedAssets / this.totalAssets) * 100 : 0;
    }
    
    /**
     * Notify progress callback if set
     */
    notifyProgress() {
        if (this.onProgress) {
            this.onProgress(this.getLoadingProgress());
        }
        
        if (this.loadedAssets === this.totalAssets && this.onComplete) {
            this.onComplete();
        }
    }
    
    /**
     * Set a callback for loading progress
     * @param {Function} callback - The callback function
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }
    
    /**
     * Set a callback for when all assets are loaded
     * @param {Function} callback - The callback function
     */
    setCompleteCallback(callback) {
        this.onComplete = callback;
    }
}

