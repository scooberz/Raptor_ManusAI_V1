/**
 * GameOverState class
 * Handles the game over state
 */
import { logger } from '../utils/logger.js';

class GameOverState {
    constructor(game) {
        this.game = game;
        this.finalScore = 0;
        this.scoreBreakdown = null;
        this.victory = false;
        this.menuOptions = [
            { text: 'Play Again', action: () => this.playAgain() },
            { text: 'Return to Menu', action: () => this.returnToMenu() }
        ];
        this.selectedOption = 0;
        this.keyDelay = 200;
        this.lastKeyTime = 0;
    }

    enter() {
        logger.info('Entering Game Over State');
        document.getElementById('game-over-screen').style.display = 'flex';

        const gameState = this.game.states.game;
        const partialResult = gameState?.missionStats ? gameState.buildMissionResult(false) : null;
        this.scoreBreakdown = this.game.calculateCampaignScore(this.game.playerData, partialResult);
        this.finalScore = this.scoreBreakdown.total;

        if (this.game.states.game && this.game.states.game.level > 2) {
            this.victory = true;
        }

        this.setupGameOverScreen();
    }

    setupGameOverScreen() {
        const gameOverScreen = document.getElementById('game-over-screen');
        gameOverScreen.innerHTML = '';

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.88)';

        const title = document.createElement('h1');
        title.textContent = this.victory ? 'Victory!' : 'Game Over';
        title.style.color = this.victory ? '#ffcc00' : '#ff3333';
        title.style.fontSize = '48px';
        title.style.marginBottom = '20px';
        container.appendChild(title);

        const message = document.createElement('p');
        message.textContent = this.victory
            ? 'Congratulations! You have completed all levels!'
            : 'Your ship has been destroyed!';
        message.style.color = 'white';
        message.style.fontSize = '24px';
        message.style.marginBottom = '24px';
        container.appendChild(message);

        const score = document.createElement('p');
        score.textContent = `Final Contract Score: ${this.finalScore}`;
        score.style.color = '#ffcc00';
        score.style.fontSize = '36px';
        score.style.marginBottom = '18px';
        container.appendChild(score);

        if (this.scoreBreakdown) {
            const breakdown = document.createElement('div');
            breakdown.style.color = '#dce5ee';
            breakdown.style.fontSize = '18px';
            breakdown.style.lineHeight = '1.8';
            breakdown.style.marginBottom = '30px';
            breakdown.style.textAlign = 'center';
            breakdown.innerHTML = `
                Contract Value: ${this.scoreBreakdown.subtotal}<br>
                Missions Counted: ${this.scoreBreakdown.resultsCount}<br>
                Difficulty: ${this.scoreBreakdown.difficulty.displayName} x${this.scoreBreakdown.difficulty.scoreMultiplier.toFixed(2)}
            `;
            container.appendChild(breakdown);
        }

        this.menuOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.textContent = option.text;
            optionElement.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
            optionElement.style.fontSize = '24px';
            optionElement.style.margin = '10px';
            optionElement.style.cursor = 'pointer';
            optionElement.style.textShadow = index === this.selectedOption ? '0 0 10px #ffcc00' : 'none';
            optionElement.addEventListener('mouseover', () => {
                this.selectedOption = index;
                this.updateMenuSelection();
            });
            optionElement.addEventListener('click', option.action);
            container.appendChild(optionElement);
        });

        const instructions = document.createElement('div');
        instructions.style.position = 'absolute';
        instructions.style.bottom = '20px';
        instructions.style.color = '#aaa';
        instructions.style.fontSize = '16px';
        instructions.textContent = 'Use Arrow Keys to navigate, Enter to select';
        container.appendChild(instructions);

        gameOverScreen.appendChild(container);
    }

    updateMenuSelection() {
        const gameOverScreen = document.getElementById('game-over-screen');
        const options = gameOverScreen.querySelectorAll('div > div:not(:last-child)');

        options.forEach((option, index) => {
            option.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
            option.style.textShadow = index === this.selectedOption ? '0 0 10px #ffcc00' : 'none';
        });
    }

    update() {
        const now = Date.now();

        if (now - this.lastKeyTime > this.keyDelay) {
            if (this.game.input.isKeyPressed('ArrowUp') || this.game.input.isKeyPressed('w')) {
                this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                this.updateMenuSelection();
                this.lastKeyTime = now;
            }

            if (this.game.input.isKeyPressed('ArrowDown') || this.game.input.isKeyPressed('s')) {
                this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                this.updateMenuSelection();
                this.lastKeyTime = now;
            }

            if (this.game.input.isKeyPressed('Enter') || this.game.input.isKeyPressed(' ')) {
                this.menuOptions[this.selectedOption].action();
                this.lastKeyTime = now;
            }
        }
    }

    render() {}

    playAgain() {
        if (this.game.states.game) {
            this.game.states.game.level = this.game.playerData?.level || 1;
        }
        this.game.changeState('game');
    }

    returnToMenu() {
        this.game.changeState('menu');
    }

    exit() {
        logger.info('Exiting Game Over State');
        document.getElementById('game-over-screen').style.display = 'none';
    }
}

export { GameOverState };
