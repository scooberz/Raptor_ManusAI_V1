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
        
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                this.images[key] = image;
                this.loadedAssets++;
                this.notifyProgress();
                resolve(image);
            };
            image.onerror = () => {
                console.error(`Failed to load image: ${src}`);
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

