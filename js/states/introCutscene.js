/**
 * IntroCutsceneState class
 * Plays a cinematic intro sequence with images and text overlays.
 */
import { logger } from '../utils/logger.js';

export class IntroCutsceneState {
    constructor(game) {
        this.game = game;
        this.script = null;
        this.currentEventIndex = -1;
        this.eventTimer = 0;
        this.lastImage = null;
        this.lastText = null;
        this.skipListener = this.skip.bind(this);
        this.hasPlayedOnce = false;
        this.enteredAt = 0;
        this.skipGracePeriod = 400;
    }

    async enter() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }

        logger.info('Entering IntroCutsceneState');

        if (this.hasPlayedOnce) {
            logger.info('Cutscene already played once, going to menu');
            this.game.changeState('menu');
            return;
        }

        try {
            const response = await fetch('assets/data/introCutscene.json');
            this.script = await response.json();
            this.currentEventIndex = -1;
            this.enteredAt = performance.now();
            this.nextEvent();
            window.addEventListener('keydown', this.skipListener);
        } catch (error) {
            logger.error('Failed to load cutscene script:', error);
            this.hasPlayedOnce = true;
            this.game.changeState('menu');
        }
    }

    exit() {
        logger.info('Exiting IntroCutsceneState');
        window.removeEventListener('keydown', this.skipListener);
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    skip(event) {
        const elapsed = performance.now() - this.enteredAt;
        if (elapsed < this.skipGracePeriod) {
            return;
        }

        if (!event || event.type !== 'keydown') {
            return;
        }

        if (!['Enter', ' ', 'Spacebar', 'Escape'].includes(event.key)) {
            return;
        }

        logger.debug('Cutscene skipped by user input.');
        this.eventTimer = 0;
    }

    nextEvent() {
        this.currentEventIndex++;
        const currentEvent = this.script.events[this.currentEventIndex];

        if (!currentEvent || currentEvent.type === 'end_scene') {
            this.hasPlayedOnce = true;
            this.game.changeState('menu');
            return;
        }

        this.eventTimer = currentEvent.duration;

        if (currentEvent.type === 'show_image') {
            this.lastImage = this.game.assets.getImage(currentEvent.asset);
            this.lastText = null;
        } else if (currentEvent.type === 'show_image_with_text') {
            this.lastImage = this.game.assets.getImage(currentEvent.asset);
            this.lastText = currentEvent.text;
        } else if (currentEvent.type === 'show_text') {
            this.lastText = currentEvent.text;
        }
    }

    update(deltaTime) {
        if (!this.script) {
            return;
        }

        this.eventTimer -= deltaTime;
        if (this.eventTimer <= 0) {
            this.nextEvent();
        }
    }

    render(contexts) {
        if (!this.script || !this.script.events[this.currentEventIndex]) {
            return;
        }

        const ctx = contexts.ui;
        const currentEvent = this.script.events[this.currentEventIndex];

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        if (this.lastImage) {
            ctx.drawImage(this.lastImage, 0, 0, this.game.width, this.game.height);
        }

        if (currentEvent.type === 'show_text' || currentEvent.type === 'show_image_with_text') {
            const text = currentEvent.type === 'show_text' ? currentEvent.text : this.lastText;
            ctx.textAlign = 'center';
            ctx.font = '24px Arial';
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 7;
            ctx.fillText(text, this.game.width / 2, this.game.height - 70);
        }

        if (currentEvent.type === 'fade_to_black') {
            const progress = 1 - (this.eventTimer / currentEvent.duration);
            ctx.fillStyle = `rgba(0, 0, 0, ${progress})`;
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }

        ctx.save();
        ctx.textAlign = 'right';
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 204, 0, 0.9)';
        ctx.shadowBlur = 0;
        ctx.fillText('Press Enter to skip', this.game.width - 32, this.game.height - 28);
        ctx.restore();
    }
}
