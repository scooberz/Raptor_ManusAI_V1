import { logger } from '../utils/logger.js';

class DifficultySelectState {
    constructor(game) {
        this.game = game;
        this.name = 'difficultySelect';
        this.selectedIndex = 1;
    }

    enter() {
        const options = this.game.getAllDifficultyProfiles();
        const currentDifficulty = this.game.getDifficultyProfile(this.game.playerData?.difficulty).id;
        this.selectedIndex = Math.max(0, options.findIndex((item) => item.id === currentDifficulty));
        this.setupScreen();
    }

    setupScreen() {
        const screen = document.getElementById('difficulty-screen');
        screen.style.display = 'flex';
        screen.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.background = 'radial-gradient(circle at top, rgba(46,73,102,0.45), rgba(6,9,14,0.96) 65%)';

        const title = document.createElement('div');
        title.textContent = 'SELECT CONTRACT DIFFICULTY';
        title.style.color = '#ffcc00';
        title.style.fontSize = '42px';
        title.style.marginBottom = '16px';
        title.style.letterSpacing = '0.08em';
        wrapper.appendChild(title);

        const ship = this.game.getPlayerShipProfile(this.game.playerData?.shipId);
        const subtitle = document.createElement('div');
        subtitle.textContent = `${ship.displayName} assigned to ${this.game.playerData?.callsign}`;
        subtitle.style.color = '#d7e8f5';
        subtitle.style.fontSize = '18px';
        subtitle.style.marginBottom = '34px';
        wrapper.appendChild(subtitle);

        const list = document.createElement('div');
        list.style.display = 'grid';
        list.style.gridTemplateColumns = 'repeat(2, minmax(260px, 320px))';
        list.style.gap = '18px';
        list.style.maxWidth = '760px';
        list.style.width = '100%';

        this.game.getAllDifficultyProfiles().forEach((option, index) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.style.padding = '18px';
            card.style.background = index === this.selectedIndex ? 'rgba(40, 24, 6, 0.92)' : 'rgba(12, 16, 24, 0.84)';
            card.style.border = index === this.selectedIndex ? '2px solid #ffcc00' : '1px solid rgba(255,255,255,0.18)';
            card.style.borderRadius = '10px';
            card.style.color = 'white';
            card.style.cursor = 'pointer';
            card.style.textAlign = 'left';
            card.style.minHeight = '160px';
            card.innerHTML = `
                <div style="font-size: 26px; color: ${index === this.selectedIndex ? '#ffcc00' : '#ffffff'}; margin-bottom: 10px;">${option.displayName}</div>
                <div style="font-size: 15px; line-height: 1.6; color: #d0dae5;">${option.summary}</div>
                <div style="font-size: 13px; color: #8fb6d8; margin-top: 14px;">Enemy Health x${option.enemyHealthMultiplier.toFixed(2)} | Fire Interval x${option.enemyFireIntervalMultiplier.toFixed(2)}</div>
            `;
            card.addEventListener('click', () => {
                this.selectedIndex = index;
                this.selectDifficulty();
            });
            list.appendChild(card);
        });

        wrapper.appendChild(list);

        const hint = document.createElement('div');
        hint.textContent = 'Arrow keys move, Enter confirms, Esc returns to pilot setup';
        hint.style.color = '#92a6ba';
        hint.style.fontSize = '14px';
        hint.style.marginTop = '24px';
        wrapper.appendChild(hint);

        screen.appendChild(wrapper);
    }

    selectDifficulty() {
        const difficulty = this.game.getAllDifficultyProfiles()[this.selectedIndex];
        this.game.setPlayerData({ ...this.game.playerData, difficulty: difficulty.id });
        this.game.saveManager.saveGame();
        this.game.changeState('hangar');
    }

    update() {
        const options = this.game.getAllDifficultyProfiles();
        if (this.game.input.wasKeyJustPressed('ArrowLeft') || this.game.input.wasKeyJustPressed('a')) {
            this.selectedIndex = (this.selectedIndex - 1 + options.length) % options.length;
            this.setupScreen();
        }
        if (this.game.input.wasKeyJustPressed('ArrowRight') || this.game.input.wasKeyJustPressed('d')) {
            this.selectedIndex = (this.selectedIndex + 1) % options.length;
            this.setupScreen();
        }
        if (this.game.input.wasKeyJustPressed('ArrowUp') || this.game.input.wasKeyJustPressed('w')) {
            this.selectedIndex = (this.selectedIndex - 2 + options.length) % options.length;
            this.setupScreen();
        }
        if (this.game.input.wasKeyJustPressed('ArrowDown') || this.game.input.wasKeyJustPressed('s')) {
            this.selectedIndex = (this.selectedIndex + 2) % options.length;
            this.setupScreen();
        }
        if (this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) {
            this.selectDifficulty();
        }
        if (this.game.input.wasKeyJustPressed('Escape')) {
            this.game.changeState('characterSelect');
        }
    }

    render() {}

    exit() {
        const screen = document.getElementById('difficulty-screen');
        if (screen) {
            screen.style.display = 'none';
        }
        logger.info('Exiting Difficulty Select State');
    }
}

export { DifficultySelectState };
