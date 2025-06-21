// The new, complete play.js
import { ScrollingBackground } from '../environment/scrolling-background.js';

class PlayState {
    constructor(game) {
        this.game = game;
        this.levelData = null;
        this.currentWaveIndex = 0;
        this.waveTimer = 0;
        this.scrollingBackground = new ScrollingBackground(this.game);
    }

    async enter() {
        console.log("Entering Play State");
        this.scrollingBackground.start();

        // Dynamically load the level data from the JSON file
        try {
            const response = await fetch('js/levels/level1.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.levelData = await response.json();
            console.log(`Successfully loaded level: ${this.levelData.levelName}`);
            this.currentWaveIndex = 0;
            this.waveTimer = this.levelData.waves[0].delay_after_previous_wave_ms || 3000;
        } catch (error) {
            console.error("Failed to load level data:", error);
            // Handle error, e.g., by going back to the menu
            this.game.changeState('menu');
        }
    }

    exit() {
        console.log("Exiting Play State");
        this.scrollingBackground.stop();
        // Clear out any remaining enemies when exiting the state
        this.game.entityManager.clear();
    }

    forceNextWave() {
        console.log("DEBUG: Forcing next wave.");
        // Clear out any remaining enemies from the current wave.
        this.game.entityManager.getEnemies().forEach(enemy => enemy.destroy());

        if (this.currentWaveIndex < this.levelData.waves.length - 1) {
            this.currentWaveIndex++;
            this.waveTimer = this.levelData.waves[this.currentWaveIndex].delay_after_previous_wave_ms || 1000;
            console.log(`DEBUG: Advanced to wave index ${this.currentWaveIndex}`);
        } else {
            console.log("DEBUG: Already on the last wave.");
        }
    }

    update(deltaTime) {
        console.log(`PLAY_STATE: Checking flag. Value is: ${this.game.input.skipWavePressed}`);
        if (this.game.input.skipWavePressed) {
            this.forceNextWave();
            this.game.input.skipWavePressed = false; // Reset the flag
        }

        if (!this.levelData) {
            // If level data hasn't loaded, do nothing.
            return;
        }

        // --- WAVE SPAWNING LOGIC ---
        if (this.currentWaveIndex < this.levelData.waves.length) {
            this.waveTimer -= deltaTime;

            if (this.waveTimer <= 0) {
                const currentWave = this.levelData.waves[this.currentWaveIndex];

                // Spawn enemies for the current wave
                currentWave.enemies.forEach(enemyInfo => {
                    this.game.enemyFactory.createEnemy(
                        enemyInfo.type,
                        enemyInfo.spawn_x,
                        enemyInfo.spawn_y
                    );
                });

                // Move to the next wave
                this.currentWaveIndex++;

                // Set timer for the NEXT wave, if it exists
                if (this.currentWaveIndex < this.levelData.waves.length) {
                    this.waveTimer = this.levelData.waves[this.currentWaveIndex].delay_after_previous_wave_ms || 3000;
                }
            }
        }

        // --- UPDATE GAME ENTITIES ---
        this.scrollingBackground.update(deltaTime);
        this.game.entityManager.update(deltaTime);
        this.game.collision.checkCollisions();
    }

    render(contexts) {
        this.scrollingBackground.render(contexts.background);
        this.game.entityManager.render(contexts);
        // Any specific PlayState UI rendering would go here
    }
}

export { PlayState };