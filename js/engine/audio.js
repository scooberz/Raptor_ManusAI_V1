/**
 * AudioManager class
 * Handles sound effects and music playback using Web Audio API.
 * Falls back to procedural synthesis when no audio asset exists.
 */
import { logger } from '../utils/logger.js';

class AudioManager {
    constructor(assetList) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGainNode = this.audioContext.createGain();
        this.musicGainNode = this.audioContext.createGain();
        this.sfxGainNode = this.audioContext.createGain();

        this.musicGainNode.connect(this.masterGainNode);
        this.sfxGainNode.connect(this.masterGainNode);
        this.masterGainNode.connect(this.audioContext.destination);

        this._masterVolume = 1.0;
        this._musicVolume = 0.42;
        this._sfxVolume = 0.78;

        this.masterGainNode.gain.value = this._masterVolume;
        this.musicGainNode.gain.value = this._musicVolume;
        this.sfxGainNode.gain.value = this._sfxVolume;

        this.soundBuffers = {};
        this.currentMusicSource = null;
        this.currentMusicSynth = null;
        this.musicFadeInterval = null;

        this.loadAssets(assetList);
    }

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

    getMasterVolume() { return this._masterVolume; }
    getMusicVolume() { return this._musicVolume; }
    getSfxVolume() { return this._sfxVolume; }

    async ensureContextReady() {
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                logger.debug('Audio context resume deferred:', error);
            }
        }
    }

    async loadAssets(assetList) {
        logger.info('Loading audio assets...');
        const audioAssets = this.parseAssetListForAudio(assetList);
        const promises = Object.entries(audioAssets).map(([key, path]) => this.loadSound(key, path));
        await Promise.all(promises);
        logger.info('All audio assets loaded.');
    }

    parseAssetListForAudio(assetList) {
        const audioAssets = {};
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
            this.soundBuffers[key] = audioBuffer;
            logger.debug(`Loaded ${key}`);
        } catch (error) {
            logger.error(`Error loading sound ${key} from ${url}:`, error);
        }
    }

    async playSound(soundName, pitchVariation = 0.1, xPosition = null) {
        await this.ensureContextReady();

        const buffer = this.soundBuffers[soundName];
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            const cents = (Math.random() * 2 - 1) * pitchVariation * 100;
            source.detune.value = cents;

            const soundGainNode = this.audioContext.createGain();
            soundGainNode.gain.value = 1.0;

            if (xPosition !== null) {
                const panner = this.audioContext.createStereoPanner();
                const gameWidth = 800;
                panner.pan.value = (xPosition / gameWidth) * 2 - 1;
                source.connect(panner).connect(soundGainNode);
            } else {
                source.connect(soundGainNode);
            }
            soundGainNode.connect(this.sfxGainNode);
            source.start(0);
            source.onended = () => {
                source.disconnect();
                soundGainNode.disconnect();
            };
            return;
        }

        this.playProceduralSound(soundName, xPosition);
    }

    playProceduralSound(soundName, xPosition = null) {
        const aliases = {
            uiHover: 'uiMove',
            purchase: 'uiConfirm',
            repair: 'uiConfirm',
            saveConfirm: 'uiConfirm',
            explosion: 'explosionMedium',
            enemyShoot: 'enemyFire'
        };
        const key = aliases[soundName] || soundName;
        const recipe = this.getSynthRecipe(key);
        if (!recipe) {
            return;
        }

        const panNode = this.audioContext.createStereoPanner();
        const master = this.audioContext.createGain();
        master.gain.value = recipe.volume ?? 0.12;
        panNode.connect(master);
        master.connect(this.sfxGainNode);
        if (xPosition !== null) {
            panNode.pan.value = Math.max(-1, Math.min(1, (xPosition / 800) * 2 - 1));
        }

        const now = this.audioContext.currentTime;
        const oscillators = [];
        const cleanupNodes = [panNode, master];

        if (recipe.noise) {
            const noiseSource = this.createNoiseSource(recipe.noise.duration || 0.2);
            const filter = this.audioContext.createBiquadFilter();
            filter.type = recipe.noise.filterType || 'bandpass';
            filter.frequency.setValueAtTime(recipe.noise.frequency || 800, now);
            filter.Q.value = recipe.noise.q || 0.7;
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(recipe.noise.attackGain || 0.001, now);
            gain.gain.exponentialRampToValueAtTime(recipe.noise.peakGain || 0.18, now + (recipe.noise.attack || 0.01));
            gain.gain.exponentialRampToValueAtTime(0.0001, now + (recipe.noise.duration || 0.2));
            noiseSource.connect(filter).connect(gain).connect(panNode);
            noiseSource.start(now);
            noiseSource.stop(now + (recipe.noise.duration || 0.2));
            oscillators.push(noiseSource);
            cleanupNodes.push(filter, gain);
        }

        (recipe.tones || []).forEach((tone, index) => {
            const osc = this.audioContext.createOscillator();
            osc.type = tone.type || 'square';
            const gain = this.audioContext.createGain();
            const filter = tone.filter ? this.audioContext.createBiquadFilter() : null;
            const attackTime = tone.attack || 0.003;
            const duration = tone.duration || 0.14;
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(tone.gain || 0.12, now + attackTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            const startFreq = (tone.startFreq || 220) * (1 + (Math.random() - 0.5) * 0.04);
            const endFreq = tone.endFreq || startFreq;
            osc.frequency.setValueAtTime(startFreq, now);
            if (tone.curve === 'linear') {
                osc.frequency.linearRampToValueAtTime(endFreq, now + duration);
            } else {
                osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + duration);
            }
            if (tone.detune) {
                osc.detune.value = tone.detune;
            }

            if (filter) {
                filter.type = tone.filter.type || 'lowpass';
                filter.frequency.setValueAtTime(tone.filter.frequency || 1500, now);
                filter.Q.value = tone.filter.q || 0.7;
                osc.connect(filter).connect(gain).connect(panNode);
                cleanupNodes.push(filter);
            } else {
                osc.connect(gain).connect(panNode);
            }

            osc.start(now + (tone.delay || 0));
            osc.stop(now + duration + (tone.delay || 0) + 0.02 + (index * 0.005));
            oscillators.push(osc);
            cleanupNodes.push(gain);
        });

        const endTime = Math.max(...[(recipe.noise?.duration || 0), ...(recipe.tones || []).map((tone) => (tone.delay || 0) + (tone.duration || 0.14))], 0.2);
        window.setTimeout(() => {
            oscillators.forEach((node) => {
                try { node.disconnect(); } catch (error) {}
            });
            cleanupNodes.forEach((node) => {
                try { node.disconnect(); } catch (error) {}
            });
        }, Math.ceil((endTime + 0.12) * 1000));
    }

    getSynthRecipe(name) {
        const recipes = {
            uiMove: {
                volume: 0.09,
                tones: [
                    { type: 'square', startFreq: 540, endFreq: 620, duration: 0.06, gain: 0.05, curve: 'linear' },
                    { type: 'triangle', startFreq: 810, endFreq: 720, duration: 0.08, gain: 0.03, delay: 0.01, curve: 'linear' }
                ]
            },
            uiConfirm: {
                volume: 0.12,
                tones: [
                    { type: 'square', startFreq: 460, endFreq: 690, duration: 0.08, gain: 0.08, curve: 'linear' },
                    { type: 'triangle', startFreq: 690, endFreq: 920, duration: 0.12, gain: 0.04, delay: 0.02, curve: 'linear' }
                ]
            },
            uiBack: {
                volume: 0.1,
                tones: [
                    { type: 'square', startFreq: 620, endFreq: 380, duration: 0.09, gain: 0.06 },
                    { type: 'triangle', startFreq: 420, endFreq: 250, duration: 0.12, gain: 0.03, delay: 0.015 }
                ]
            },
            pickup: {
                volume: 0.12,
                tones: [
                    { type: 'triangle', startFreq: 720, endFreq: 980, duration: 0.09, gain: 0.06, curve: 'linear' },
                    { type: 'triangle', startFreq: 980, endFreq: 1320, duration: 0.11, gain: 0.04, delay: 0.025, curve: 'linear' }
                ]
            },
            playerDamage: {
                volume: 0.14,
                noise: { duration: 0.16, frequency: 540, peakGain: 0.16, filterType: 'bandpass', q: 2.2 },
                tones: [
                    { type: 'sawtooth', startFreq: 220, endFreq: 90, duration: 0.18, gain: 0.08 }
                ]
            },
            enemyFire: {
                volume: 0.08,
                tones: [
                    { type: 'square', startFreq: 260, endFreq: 180, duration: 0.07, gain: 0.05 }
                ]
            },
            bossWarning: {
                volume: 0.14,
                tones: [
                    { type: 'sawtooth', startFreq: 190, endFreq: 190, duration: 0.22, gain: 0.07 },
                    { type: 'square', startFreq: 740, endFreq: 460, duration: 0.22, gain: 0.045, delay: 0.02 },
                    { type: 'square', startFreq: 190, endFreq: 190, duration: 0.18, gain: 0.05, delay: 0.26 },
                    { type: 'triangle', startFreq: 880, endFreq: 520, duration: 0.18, gain: 0.038, delay: 0.28 }
                ]
            },
            explosionSmall: {
                volume: 0.14,
                noise: { duration: 0.16, frequency: 900, peakGain: 0.2, filterType: 'lowpass', q: 0.5 },
                tones: [
                    { type: 'triangle', startFreq: 180, endFreq: 55, duration: 0.17, gain: 0.06 }
                ]
            },
            explosionMedium: {
                volume: 0.18,
                noise: { duration: 0.24, frequency: 700, peakGain: 0.28, filterType: 'lowpass', q: 0.7 },
                tones: [
                    { type: 'sawtooth', startFreq: 160, endFreq: 42, duration: 0.24, gain: 0.09 },
                    { type: 'triangle', startFreq: 92, endFreq: 38, duration: 0.28, gain: 0.06, delay: 0.015 }
                ]
            },
            explosionLarge: {
                volume: 0.24,
                noise: { duration: 0.38, frequency: 520, peakGain: 0.36, filterType: 'lowpass', q: 0.8 },
                tones: [
                    { type: 'sawtooth', startFreq: 120, endFreq: 28, duration: 0.42, gain: 0.13 },
                    { type: 'triangle', startFreq: 72, endFreq: 24, duration: 0.48, gain: 0.09, delay: 0.04 },
                    { type: 'square', startFreq: 36, endFreq: 24, duration: 0.3, gain: 0.04, delay: 0.08 }
                ]
            },
            megabomb: {
                volume: 0.26,
                noise: { duration: 0.55, frequency: 420, peakGain: 0.46, filterType: 'lowpass', q: 0.9 },
                tones: [
                    { type: 'sawtooth', startFreq: 160, endFreq: 18, duration: 0.6, gain: 0.18 },
                    { type: 'triangle', startFreq: 56, endFreq: 12, duration: 0.72, gain: 0.1, delay: 0.05 }
                ]
            }
        };

        return recipes[name] || null;
    }

    createNoiseSource(duration) {
        const bufferSize = Math.max(1, Math.floor(this.audioContext.sampleRate * duration));
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i += 1) {
            output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        return source;
    }

    async playMusic(musicName, loop = true) {
        await this.ensureContextReady();

        if (this.currentMusicSource) {
            await this.fadeOutMusic(this.currentMusicSource, 1000);
            this.currentMusicSource.stop();
            this.currentMusicSource.disconnect();
            this.currentMusicSource = null;
        }
        this.stopProceduralMusic();

        this.musicGainNode.gain.value = this._musicVolume;
        const buffer = this.soundBuffers[musicName];
        if (buffer) {
            this.currentMusicSource = this.audioContext.createBufferSource();
            this.currentMusicSource.buffer = buffer;
            this.currentMusicSource.loop = loop;
            this.currentMusicSource.connect(this.musicGainNode);
            this.currentMusicSource.start(0);
            this.fadeInMusic(this.currentMusicSource, 1000);
            return;
        }

        this.playProceduralMusic(musicName);
    }

    playProceduralMusic(musicName) {
        const profiles = {
            menuMusic: {
                baseFreqs: [110, 165, 247],
                type: 'triangle',
                secondaryType: 'sine',
                lfoRate: 0.15,
                lfoDepth: 12,
                gain: 0.028
            },
            gameMusic1: {
                baseFreqs: [92.5, 138.6, 207.65],
                type: 'sawtooth',
                secondaryType: 'triangle',
                lfoRate: 0.32,
                lfoDepth: 18,
                gain: 0.032
            },
            gameMusic2: {
                baseFreqs: [82.4, 123.47, 185],
                type: 'sawtooth',
                secondaryType: 'square',
                lfoRate: 0.28,
                lfoDepth: 16,
                gain: 0.03
            }
        };

        const profile = profiles[musicName] || profiles.gameMusic1;
        const nodes = [];
        const groupGain = this.audioContext.createGain();
        groupGain.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
        groupGain.gain.linearRampToValueAtTime(profile.gain, this.audioContext.currentTime + 1.6);
        groupGain.connect(this.musicGainNode);
        nodes.push(groupGain);

        profile.baseFreqs.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            osc.type = index === 0 ? profile.type : profile.secondaryType;
            osc.frequency.value = freq;

            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 700 + index * 220;
            filter.Q.value = 0.6;

            const gain = this.audioContext.createGain();
            gain.gain.value = index === 0 ? 0.8 : 0.32;

            const lfo = this.audioContext.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = profile.lfoRate + index * 0.04;
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = profile.lfoDepth + index * 4;
            lfo.connect(lfoGain).connect(osc.detune);

            osc.connect(filter).connect(gain).connect(groupGain);
            osc.start();
            lfo.start();
            nodes.push(osc, filter, gain, lfo, lfoGain);
        });

        this.currentMusicSynth = { nodes, groupGain };
    }

    stopProceduralMusic() {
        if (!this.currentMusicSynth) {
            return;
        }

        const { nodes, groupGain } = this.currentMusicSynth;
        const now = this.audioContext.currentTime;
        if (groupGain?.gain) {
            groupGain.gain.cancelScheduledValues(now);
            groupGain.gain.setValueAtTime(groupGain.gain.value, now);
            groupGain.gain.linearRampToValueAtTime(0.0001, now + 0.4);
        }
        window.setTimeout(() => {
            nodes.forEach((node) => {
                try {
                    if (typeof node.stop === 'function') {
                        node.stop();
                    }
                } catch (error) {}
                try { node.disconnect(); } catch (error) {}
            });
        }, 500);
        this.currentMusicSynth = null;
    }

    stopMusic() {
        if (this.currentMusicSource) {
            this.fadeOutMusic(this.currentMusicSource, 500).then(() => {
                this.currentMusicSource.stop();
                this.currentMusicSource.disconnect();
                this.currentMusicSource = null;
            });
        }
        this.stopProceduralMusic();
    }

    async fadeOutMusic(_source, duration) {
        const initialVolume = this.musicGainNode.gain.value;
        const fadeOutInterval = 50;
        const steps = duration / fadeOutInterval;
        const volumeStep = initialVolume / steps;

        return new Promise(resolve => {
            let currentStep = 0;
            this.musicFadeInterval = setInterval(() => {
                if (currentStep < steps) {
                    this.musicGainNode.gain.value = Math.max(0, initialVolume - (volumeStep * currentStep));
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

    fadeInMusic(_source, duration) {
        const targetVolume = this._musicVolume;
        this.musicGainNode.gain.value = 0;
        const fadeInInterval = 50;
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

    toggleMute() {
        if (this.masterGainNode.gain.value > 0) {
            this.masterGainNode.gain.value = 0;
            return true;
        }
        this.masterGainNode.gain.value = this._masterVolume;
        return false;
    }
}

export { AudioManager };
