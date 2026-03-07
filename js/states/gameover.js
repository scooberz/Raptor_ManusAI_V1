/**
 * GameOverState class
 * Handles the game over and final contract summary screen.
 */
import { logger } from '../utils/logger.js';

class GameOverState {
    constructor(game) {
        this.game = game;
        this.finalScore = 0;
        this.scoreBreakdown = null;
        this.victory = false;
        this.menuOptions = [
            { text: 'Play Again', meta: 'Restart the current contract level', action: () => this.playAgain() },
            { text: 'Return to Menu', meta: 'Exit to the root terminal', action: () => this.returnToMenu() }
        ];
        this.selectedOption = 0;
        this.optionElements = [];
    }

    enter() {
        logger.info('Entering Game Over State');
        document.getElementById('game-over-screen').style.display = 'flex';

        const gameState = this.game.states.game;
        const partialResult = gameState?.missionStats ? gameState.buildMissionResult(false) : null;
        this.scoreBreakdown = this.game.calculateCampaignScore(this.game.playerData, partialResult);
        this.finalScore = this.scoreBreakdown.total;
        this.victory = Boolean(this.game.playerData?.endingFlags?.campaignComplete);
        this.selectedOption = 0;
        this.setupGameOverScreen();
    }

    setupGameOverScreen() {
        const gameOverScreen = document.getElementById('game-over-screen');
        gameOverScreen.innerHTML = '';
        this.optionElements = [];

        const background = this.game.assets.getImage('menuBackground') || this.game.assets.getImage('hangarBackground');

        const shell = document.createElement('div');
        shell.className = 'dos-shell';
        shell.style.background = this.victory
            ? 'radial-gradient(circle at top, rgba(80, 62, 16, 0.38), rgba(4, 8, 12, 0.98) 72%)'
            : 'radial-gradient(circle at top, rgba(68, 18, 18, 0.32), rgba(4, 8, 12, 0.98) 72%)';

        if (background) {
            const bg = document.createElement('img');
            bg.className = 'dos-bg-image';
            bg.src = background.src;
            bg.style.filter = this.victory ? 'brightness(0.2) saturate(0.82)' : 'brightness(0.16) saturate(0.68)';
            shell.appendChild(bg);
        }

        const overlay = document.createElement('div');
        overlay.className = 'dos-overlay';
        shell.appendChild(overlay);

        const layout = document.createElement('div');
        layout.className = 'dos-screen-layout';
        layout.style.display = 'flex';
        layout.style.alignItems = 'center';
        layout.style.justifyContent = 'center';
        layout.style.height = '100%';

        const frame = document.createElement('div');
        frame.className = `dos-frame compact ${this.victory ? 'alt' : ''}`;
        frame.style.width = 'min(980px, 88%)';
        frame.style.padding = '22px';

        const title = this.victory ? 'Contract Complete' : 'Aircraft Lost';
        const subtitle = this.victory
            ? 'Campaign route closed. Final contract score archived.'
            : 'The current sortie has ended. Contract score archived.';

        frame.innerHTML = `
            <div class="dos-kicker">${this.victory ? 'Victory Archive' : 'Failure Debrief'} // Contract Ledger</div>
            <div class="dos-title" style="margin:8px 0 6px; color:${this.victory ? '#ffcc00' : '#ff6b5f'};">${title}</div>
            <div class="dos-subtitle">${subtitle}</div>
        `;

        const summaryGrid = document.createElement('div');
        summaryGrid.className = 'dos-grid-3';
        summaryGrid.style.marginTop = '18px';

        const metrics = [
            { label: 'Final Contract Score', value: `${this.finalScore}`, color: '#ffcc00' },
            { label: 'Contract Value', value: `${this.scoreBreakdown?.subtotal || 0}`, color: '#dce5ee' },
            { label: 'Difficulty', value: `${this.scoreBreakdown?.difficulty?.displayName || 'Rookie'} x${(this.scoreBreakdown?.difficulty?.scoreMultiplier || 1).toFixed(2)}`, color: '#8fd7ff' }
        ];

        metrics.forEach((metric) => {
            const panel = document.createElement('div');
            panel.className = 'dos-panel section';
            panel.innerHTML = `
                <div class="dos-label">${metric.label}</div>
                <div style="font: bold 24px var(--dos-font); color:${metric.color}; margin-top:8px;">${metric.value}</div>
            `;
            summaryGrid.appendChild(panel);
        });
        frame.appendChild(summaryGrid);

        const detailGrid = document.createElement('div');
        detailGrid.className = 'dos-grid-2';
        detailGrid.style.marginTop = '18px';

        const performancePanel = document.createElement('div');
        performancePanel.className = 'dos-panel section';
        performancePanel.innerHTML = `
            <div class="dos-label">Campaign Totals</div>
            <div class="dos-copy" style="margin-top:10px; line-height:1.8;">
                Missions Counted ${this.scoreBreakdown?.resultsCount || 0}<br>
                Missions Cleared ${this.scoreBreakdown?.completedMissions || 0}<br>
                Pilot ${this.game.playerData?.callsign || 'RAPTOR'}<br>
                Airframe ${this.game.getPlayerShipProfile(this.game.playerData?.shipId).displayName}
            </div>
        `;
        detailGrid.appendChild(performancePanel);

        const verdictPanel = document.createElement('div');
        verdictPanel.className = 'dos-panel section';
        verdictPanel.innerHTML = `
            <div class="dos-label">Final Verdict</div>
            <div class="dos-copy" style="margin-top:10px; line-height:1.8;">
                ${this.victory ? 'Contract completed with route archive preserved.' : 'Sortie failed before contract completion.'}<br>
                ${this.victory ? 'Proceed to the root terminal for a new run or future route branch.' : 'Restart the current contract or return to the root terminal.'}
            </div>
        `;
        detailGrid.appendChild(verdictPanel);
        frame.appendChild(detailGrid);

        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'dos-panel section';
        optionsPanel.style.marginTop = '18px';
        optionsPanel.innerHTML = '<div class="dos-label">Terminal Actions</div>';

        const optionList = document.createElement('div');
        optionList.className = 'dos-terminal-list';
        optionList.style.marginTop = '12px';
        this.menuOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `dos-list-button${index === this.selectedOption ? ' selected' : ''}`;
            button.innerHTML = `<span class="title">${option.text}</span><span class="meta">${option.meta}</span>`;
            button.addEventListener('mouseover', () => {
                if (this.selectedOption !== index) {
                    this.game.audio.playSound('uiMove');
                }
                this.selectedOption = index;
                this.updateMenuSelection();
            });
            button.addEventListener('focus', () => {
                if (this.selectedOption !== index) {
                    this.game.audio.playSound('uiMove');
                }
                this.selectedOption = index;
                this.updateMenuSelection();
            });
            button.addEventListener('click', () => {
                this.game.audio.playSound('uiConfirm');
                option.action();
            });
            this.optionElements.push(button);
            optionList.appendChild(button);
        });
        optionsPanel.appendChild(optionList);
        frame.appendChild(optionsPanel);

        const footer = document.createElement('div');
        footer.style.marginTop = '16px';
        footer.className = 'dos-footer-hint';
        footer.textContent = 'Arrow Keys select // Enter confirm';
        frame.appendChild(footer);

        layout.appendChild(frame);
        shell.appendChild(layout);
        gameOverScreen.appendChild(shell);
    }

    updateMenuSelection() {
        this.optionElements.forEach((option, index) => {
            option.classList.toggle('selected', index === this.selectedOption);
        });
    }

    update() {
        if (this.game.input.wasKeyJustPressed('ArrowUp') || this.game.input.wasKeyJustPressed('w')) {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
            this.game.audio.playSound('uiMove');
            this.updateMenuSelection();
        }

        if (this.game.input.wasKeyJustPressed('ArrowDown') || this.game.input.wasKeyJustPressed('s')) {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
            this.game.audio.playSound('uiMove');
            this.updateMenuSelection();
        }

        if (this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) {
            this.game.audio.playSound('uiConfirm');
            this.menuOptions[this.selectedOption].action();
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
