/**
 * AudioManager class
 * Handles sound effects and music playback
 */
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.muted = false;
    }
    
    /**
     * Add a sound to the manager
     * @param {string} key - The key to store the sound under
     * @param {Audio} audio - The audio element
     */
    addSound(key, audio) {
        this.sounds[key] = audio;
    }
    
    /**
     * Play a sound effect
     * @param {string} key - The key of the sound to play
     */
    playSound(key) {
        if (this.muted || !this.sounds[key]) {
            // Silently ignore missing sounds
            if (!this.sounds[key]) {
                console.log(`Sound not found: ${key}`);
            }
            return;
        }
        
        // Clone the audio to allow multiple instances of the same sound
        const sound = this.sounds[key].cloneNode();
        sound.volume = this.sfxVolume;
        
        // Play the sound
        sound.play().catch(error => {
            console.log(`Error playing sound ${key}:`, error);
        });
    }
    
    /**
     * Play background music
     * @param {string} key - The key of the music to play
     */
    playMusic(key) {
        if (this.muted || !this.sounds[key]) {
            // Silently ignore missing music
            if (!this.sounds[key]) {
                console.log(`Music not found: ${key}`);
            }
            return;
        }
        
        // Stop current music if playing
        if (this.music) {
            this.stopMusic();
        }
        
        // Set and play new music
        this.music = this.sounds[key];
        this.music.volume = this.musicVolume;
        this.music.loop = true;
        
        this.music.play().catch(error => {
            console.log(`Error playing music ${key}:`, error);
        });
    }
    
    /**
     * Stop the currently playing music
     */
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
    
    /**
     * Pause the currently playing music
     */
    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }
    
    /**
     * Resume the paused music
     */
    resumeMusic() {
        if (this.music && !this.muted) {
            this.music.play().catch(error => {
                console.log('Error resuming music:', error);
            });
        }
    }
    
    /**
     * Set the volume for music
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
    }
    
    /**
     * Set the volume for sound effects
     * @param {number} volume - Volume level (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Toggle mute state for all audio
     * @returns {boolean} The new mute state
     */
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.muted) {
            if (this.music) {
                this.music.pause();
            }
        } else {
            if (this.music) {
                this.music.play().catch(error => {
                    console.log('Error resuming music after unmute:', error);
                });
            }
        }
        
        return this.muted;
    }
    
    /**
     * Set mute state for all audio
     * @param {boolean} muted - The mute state to set
     */
    setMute(muted) {
        if (this.muted !== muted) {
            this.toggleMute();
        }
    }
}

