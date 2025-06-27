/**
 * IntroCutsceneState class
 * Plays a cinematic intro sequence with images and text overlays
 */
export class IntroCutsceneState {
    constructor(game) {
        this.game = game;
        this.script = null;
        this.currentEventIndex = -1;
        this.eventTimer = 0;
        this.lastImage = null; // To keep drawing the image behind the text
        this.lastText = null;
        this.skipListener = this.skip.bind(this);
        this.hasPlayedOnce = false; // Flag to ensure cutscene only plays once
    }

    async enter() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        console.log("Entering IntroCutsceneState");
        
        // If cutscene has already played once, go directly to menu
        if (this.hasPlayedOnce) {
            console.log("Cutscene already played once, going to menu");
            this.game.changeState('menu');
            return;
        }
        
        // Assets are now loaded upfront in LoadingState, so no need to load gameplay assets here
        
        try {
            const response = await fetch('assets/data/introCutscene.json');
            this.script = await response.json();
            this.currentEventIndex = -1;
            this.nextEvent(); // Start the first event
            
            // Add listeners to skip
            window.addEventListener('keydown', this.skipListener);
            window.addEventListener('mousedown', this.skipListener);
        } catch (error) {
            console.error("Failed to load cutscene script:", error);
            this.hasPlayedOnce = true; // Mark as played even on error
            this.game.changeState('menu');
        }
    }

    exit() {
        console.log("Exiting IntroCutsceneState");
        // CRITICAL: Remove listeners to prevent them from firing in other states
        window.removeEventListener('keydown', this.skipListener);
        window.removeEventListener('mousedown', this.skipListener);
        
        // Hide the loading screen div when the cutscene ends
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    skip() {
        console.log("Cutscene event skipped by user.");
        // Force the timer to zero to immediately advance to the next event
        this.eventTimer = 0;
    }

    nextEvent() {
        this.currentEventIndex++;
        const currentEvent = this.script.events[this.currentEventIndex];

        if (!currentEvent || currentEvent.type === 'end_scene') {
            this.hasPlayedOnce = true; // Mark cutscene as played
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
        if (!this.script) return;

        this.eventTimer -= deltaTime;
        if (this.eventTimer <= 0) {
            this.nextEvent();
        }
    }

    render(contexts) {
        if (!this.script || !this.script.events[this.currentEventIndex]) return;
        
        const ctx = contexts.ui; // Render everything on the top UI layer
        const currentEvent = this.script.events[this.currentEventIndex];

        // Black background as a base
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        // Draw the last displayed image (so text can overlay it)
        if (this.lastImage) {
            ctx.drawImage(this.lastImage, 0, 0, this.game.width, this.game.height);
        }
        
        // Render the text for a 'show_text' or 'show_image_with_text' event
        if (currentEvent.type === 'show_text' || currentEvent.type === 'show_image_with_text') {
            const text = currentEvent.type === 'show_text' ? currentEvent.text : this.lastText;
            ctx.textAlign = 'center';
            ctx.font = '24px Arial';
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 7;
            ctx.fillText(text, this.game.width / 2, this.game.height - 70);
        }
        
        // Handle the fade-to-black transition
        if (currentEvent.type === 'fade_to_black') {
            const progress = 1 - (this.eventTimer / currentEvent.duration);
            ctx.fillStyle = `rgba(0, 0, 0, ${progress})`;
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }
    }
} 