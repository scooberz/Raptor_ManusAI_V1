/**
 * AudioManager class
 * Handles sound effects and music playback using Web Audio API
 */
class AudioManager {
    constructor(assetList) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGainNode = this.audioContext.createGain();
        this.musicGainNode = this.audioContext.createGain();
        this.sfxGainNode = this.audioContext.createGain();

        // Connect nodes: master -> (music/sfx) -> destination
        this.musicGainNode.connect(this.masterGainNode);
        this.sfxGainNode.connect(this.masterGainNode);
        this.masterGainNode.connect(this.audioContext.destination);

        // Default volumes
        this._masterVolume = 1.0;
        this._musicVolume = 0.5;
        this._sfxVolume = 0.7;

        // Apply initial volumes to gain nodes
        this.masterGainNode.gain.value = this._masterVolume;
        this.musicGainNode.gain.value = this._musicVolume;
        this.sfxGainNode.gain.value = this._sfxVolume;

        this.soundBuffers = {}; // Stores AudioBuffer objects for sound effects
        this.musicBuffer = null; // Stores AudioBuffer for current music
        this.currentMusicSource = null; // Current AudioBufferSourceNode for music
        this.musicFadeInterval = null; // For fading music

        this.loadAssets(assetList);
    }

    // --- Volume Control Methods ---

    setMasterVolume(value) {
        this._masterVolume = Math.max(0, Math.min(1, value));
        this.masterGainNode.gain.value = this._masterVolume;
    }

    setMusicVolume(value) {
        this._musicVolume = Math.max(0, Math.min(1, value));
        this.musicGainNode.gain.value = this._musicVolume;
    }

    setSfxVolume(value) {
        this._sfxVolume = Math.max(0, Math.min(1, value));
        this.sfxGainNode.gain.value = this._sfxVolume;
    }

    getMasterVolume() {
        return this._masterVolume;
    }

    getMusicVolume() {
        return this._musicVolume;
    }

    getSfxVolume() {
        return this._sfxVolume;
    }

    // --- Asset Loading ---
    async loadAssets(assetList) {
        console.log("Loading audio assets...");
        const audioAssets = this.parseAssetListForAudio(assetList);
        const promises = Object.entries(audioAssets).map(([key, path]) => this.loadSound(key, path));
        await Promise.all(promises);
        console.log("All audio assets loaded.");
    }

    parseAssetListForAudio(assetList) {
        const audioAssets = {};
        // Correctly access the 'audio' object inside the assetList
        if (assetList && assetList.audio) {
            for (const [key, path] of Object.entries(assetList.audio)) {
                audioAssets[key] = path;
            }
        }
        return audioAssets;
    }

    async loadSound(key, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            // Use the key as the sound name
            this.soundBuffers[key] = audioBuffer;
            console.log(`Loaded ${key}`);
        } catch (error) {
            console.error(`Error loading sound ${key} from ${url}:`, error);
        }
    }

    // --- Sound Effect Management ---
    playSound(soundName, pitchVariation = 0.1, xPosition = null) {
        const buffer = this.soundBuffers[soundName];
        if (!buffer) {
            console.warn(`[AudioManager] Sound not found: '${soundName}'`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        // Apply pitch variation
        const cents = (Math.random() * 2 - 1) * pitchVariation * 100; // +/- pitchVariation cents
        source.detune.value = cents;

        // Create a gain node for this specific sound to apply sfxVolume
        const soundGainNode = this.audioContext.createGain();
        soundGainNode.gain.value = 1.0; // Initial gain, actual volume controlled by sfxGainNode

        // Connect nodes: source -> (panner) -> soundGainNode -> sfxGainNode -> masterGainNode -> destination
        if (xPosition !== null) {
            const panner = this.audioContext.createStereoPanner();
            // Map xPosition (e.g., 0 to 800) to pan value (-1 to 1)
            // Assuming a game width of 800 for now, this can be made dynamic later
            const gameWidth = 800; 
            const panValue = (xPosition / gameWidth) * 2 - 1; // Normalize to -1 to 1
            panner.pan.value = panValue;
            source.connect(panner).connect(soundGainNode);
        } else {
            source.connect(soundGainNode);
        }
        soundGainNode.connect(this.sfxGainNode);

        source.start(0);
        // Clean up source node after it finishes playing
        source.onended = () => {
            source.disconnect();
            soundGainNode.disconnect();
        };
    }

    // --- Music Management ---
    async playMusic(musicName, loop = true) {
        // Stop any currently playing music with fade out
        if (this.currentMusicSource) {
            await this.fadeOutMusic(this.currentMusicSource, 1000); // Fade out over 1 second
            this.currentMusicSource.stop();
            this.currentMusicSource.disconnect();
            this.currentMusicSource = null;
        }

        const buffer = this.soundBuffers[musicName]; // Music is also stored in soundBuffers
        if (!buffer) {
            console.warn(`[AudioManager] Music not found: '${musicName}'`);
            return;
        }

        this.currentMusicSource = this.audioContext.createBufferSource();
        this.currentMusicSource.buffer = buffer;
        this.currentMusicSource.loop = loop;

        this.currentMusicSource.connect(this.musicGainNode);
        this.currentMusicSource.start(0);

        // Fade in the new music
        this.fadeInMusic(this.currentMusicSource, 1000); // Fade in over 1 second
    }

    stopMusic() {
        if (this.currentMusicSource) {
            this.fadeOutMusic(this.currentMusicSource, 500).then(() => {
                this.currentMusicSource.stop();
                this.currentMusicSource.disconnect();
                this.currentMusicSource = null;
            });
        }
    }

    async fadeOutMusic(source, duration) {
        const initialVolume = this.musicGainNode.gain.value;
        const fadeOutInterval = 50; // ms
        const steps = duration / fadeOutInterval;
        const volumeStep = initialVolume / steps;

        return new Promise(resolve => {
            let currentStep = 0;
            this.musicFadeInterval = setInterval(() => {
                if (currentStep < steps) {
                    this.musicGainNode.gain.value = initialVolume - (volumeStep * currentStep);
                    currentStep++;
                } else {
                    this.musicGainNode.gain.value = 0;
                    clearInterval(this.musicFadeInterval);
                    this.musicFadeInterval = null;
                    resolve();
                }
            }, fadeOutInterval);
        });
    }

    fadeInMusic(source, duration) {
        const targetVolume = this._musicVolume; // Fade in to the set music volume
        this.musicGainNode.gain.value = 0;
        const fadeInInterval = 50; // ms
        const steps = duration / fadeInInterval;
        const volumeStep = targetVolume / steps;

        let currentStep = 0;
        this.musicFadeInterval = setInterval(() => {
            if (currentStep < steps) {
                this.musicGainNode.gain.value = volumeStep * currentStep;
                currentStep++;
            } else {
                this.musicGainNode.gain.value = targetVolume;
                clearInterval(this.musicFadeInterval);
                this.musicFadeInterval = null;
            }
        }, fadeInInterval);
    }

    // Placeholder for mute/unmute if needed, though volume control handles this implicitly
    toggleMute() {
        if (this.masterGainNode.gain.value > 0) {
            this.masterGainNode.gain.value = 0;
            return true; // Muted
        } else {
            this.masterGainNode.gain.value = this._masterVolume; // Restore to previous master volume
            return false; // Unmuted
        }
    }
}

export { AudioManager };

