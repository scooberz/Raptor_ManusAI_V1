/**
 * MenuState class
 * Handles the main menu of the game with a shared DOS terminal presentation.
 */
import { logger } from '../utils/logger.js';

class MenuState {
    constructor(game) {
        this.game = game;
        this.background = null;
        this.menuOptions = [
            { text: 'Start New Game', action: () => this.startNewGame() },
            { text: 'Load Game', action: () => this.loadGame() },
            { text: 'Readme', action: () => this.showReadme() },
            { text: 'Options', action: () => this.showOptionsMenu() },
            { text: 'Credits', action: () => this.showCredits() }
        ];
        this.selectedOption = 0;
        this.menuOptionElements = [];
    }

    enter() {
        logger.info('Entering Menu State');

        const menuScreen = document.getElementById('menu-screen');
        const loadingScreen = document.getElementById('loading-screen');
        const gameOverScreen = document.getElementById('game-over-screen');

        if (menuScreen) menuScreen.style.display = 'flex';
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (gameOverScreen) gameOverScreen.style.display = 'none';

        this.background = this.game.assets.getImage('menuBackground');
        this.selectedOption = 0;
        this.setupMenuScreen();
    }

    createShell(screen, backgroundImage = null) {
        screen.innerHTML = '';
        const shell = document.createElement('div');
        shell.className = 'dos-shell';

        if (backgroundImage) {
            const bgImg = document.createElement('img');
            bgImg.className = 'dos-bg-image';
            bgImg.src = backgroundImage.src;
            shell.appendChild(bgImg);
        }

        const overlay = document.createElement('div');
        overlay.className = 'dos-overlay';
        shell.appendChild(overlay);

        screen.appendChild(shell);
        return shell;
    }

    createFrame(extraClass = '') {
        const frame = document.createElement('div');
        frame.className = `dos-frame compact ${extraClass}`.trim();
        return frame;
    }

    createActionButton(label, onClick, className = 'dos-action-button') {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.textContent = label;
        button.addEventListener('click', () => {
            this.game.audio.playSound('uiConfirm');
            onClick();
        });
        return button;
    }

    createBackButton(onClick) {
        return this.createActionButton('Back', onClick);
    }

    getSaveSummaryMarkup() {
        const playerData = this.game.saveManager.loadGame();
        if (!(playerData && playerData.name && playerData.callsign)) {
            return '<div class="dos-copy dos-dim">No pilot file found.</div>';
        }

        const ship = this.game.getPlayerShipProfile(playerData.shipId);
        const difficulty = this.game.getDifficultyProfile(playerData.difficulty);
        return `
            <div class="dos-copy">
                <strong>${playerData.name}</strong><br>
                ${playerData.callsign}<br>
                ${ship.displayName} // ${difficulty.displayName}<br>
                Mission ${playerData.level || 1} // $${playerData.money || 0}
            </div>
        `;
    }

    setupMenuScreen() {
        const menuScreen = document.getElementById('menu-screen');
        const shell = this.createShell(menuScreen, this.background);
        this.menuOptionElements = [];

        const layout = document.createElement('div');
        layout.className = 'dos-screen-layout';
        layout.style.display = 'grid';
        layout.style.gridTemplateColumns = 'minmax(360px, 560px) minmax(240px, 320px)';
        layout.style.gap = '22px';
        layout.style.alignItems = 'end';
        layout.style.height = '100%';
        layout.style.padding = '7vh 0 8vh';

        const menuFrame = this.createFrame('alt');
        menuFrame.style.padding = '20px 22px';
        menuFrame.style.alignSelf = 'end';
        menuFrame.innerHTML = `
            <div class="dos-kicker">Contract Operations Terminal</div>
            <div class="dos-title" style="margin: 8px 0 10px;">Raptor</div>
            <div class="dos-subtitle" style="margin-bottom: 16px;">Call of the Shadows // Tribute Build</div>
        `;

        const list = document.createElement('div');
        list.className = 'dos-terminal-list';
        this.menuOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'dos-list-button';
            button.innerHTML = `
                <span class="title">${option.text}</span>
                <span class="meta">${this.getOptionMeta(option.text)}</span>
            `;
            button.addEventListener('mouseover', () => {
                if (this.selectedOption !== index) {
                    this.game.audio.playSound('uiMove');
                }
                this.selectedOption = index;
                this.highlightSelectedOption();
            });
            button.addEventListener('focus', () => {
                if (this.selectedOption !== index) {
                    this.game.audio.playSound('uiMove');
                }
                this.selectedOption = index;
                this.highlightSelectedOption();
            });
            button.addEventListener('click', () => {
                this.selectedOption = index;
                this.highlightSelectedOption();
                this.game.audio.playSound('uiConfirm');
                option.action();
            });
            this.menuOptionElements.push(button);
            list.appendChild(button);
        });
        menuFrame.appendChild(list);
        layout.appendChild(menuFrame);

        const sideColumn = document.createElement('div');
        sideColumn.style.display = 'grid';
        sideColumn.style.gap = '14px';
        sideColumn.style.alignSelf = 'end';

        const savePanel = this.createFrame();
        savePanel.style.padding = '16px';
        savePanel.innerHTML = `
            <div class="dos-label">Pilot File</div>
            <div style="margin-top:10px">${this.getSaveSummaryMarkup()}</div>
        `;
        sideColumn.appendChild(savePanel);

        const helpPanel = this.createFrame();
        helpPanel.style.padding = '16px';
        helpPanel.innerHTML = `
            <div class="dos-label">Terminal Controls</div>
            <div class="dos-copy" style="margin-top:10px; line-height:1.9;">
                Arrow Keys / W,S : Select<br>
                Enter : Confirm<br>
                Mouse : Direct Select
            </div>
        `;
        sideColumn.appendChild(helpPanel);

        layout.appendChild(sideColumn);
        shell.appendChild(layout);
        this.highlightSelectedOption();
    }

    getOptionMeta(text) {
        switch (text) {
            case 'Start New Game': return 'Create pilot // choose airframe';
            case 'Load Game': return 'Resume active contract file';
            case 'Readme': return 'Controls // design notes';
            case 'Options': return 'Resolution // window mode';
            case 'Credits': return 'Project and source notes';
            default: return '';
        }
    }

    startNewGame() {
        this.game.changeState('characterSelect');
    }

    loadGame() {
        this.showLoadGameScreen();
    }

    renderContentScreen({ kicker, title, subtitle = '', bodyBuilder, actions = [], backgroundImage = this.background }) {
        const menuScreen = document.getElementById('menu-screen');
        const shell = this.createShell(menuScreen, backgroundImage);
        this.menuOptionElements = [];

        const layout = document.createElement('div');
        layout.className = 'dos-screen-layout';
        layout.style.display = 'flex';
        layout.style.alignItems = 'center';
        layout.style.justifyContent = 'center';
        layout.style.height = '100%';

        const frame = this.createFrame();
        frame.style.width = 'min(980px, 88%)';
        frame.style.padding = '22px';
        frame.innerHTML = `
            <div class="dos-kicker">${kicker}</div>
            <div class="dos-title" style="margin:8px 0 10px;">${title}</div>
            ${subtitle ? `<div class="dos-subtitle" style="margin-bottom:16px;">${subtitle}</div>` : ''}
        `;

        const body = document.createElement('div');
        body.className = 'dos-panel section';
        bodyBuilder(body);
        frame.appendChild(body);

        const footer = document.createElement('div');
        footer.style.marginTop = '16px';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.style.alignItems = 'center';
        footer.style.gap = '12px';

        const actionRow = document.createElement('div');
        actionRow.style.display = 'flex';
        actionRow.style.gap = '10px';
        actions.forEach((action) => actionRow.appendChild(action));
        footer.appendChild(actionRow);

        const hint = document.createElement('div');
        hint.className = 'dos-footer-hint';
        hint.textContent = 'Esc returns to the root terminal';
        footer.appendChild(hint);

        frame.appendChild(footer);
        layout.appendChild(frame);
        shell.appendChild(layout);
    }

    showLoadGameScreen() {
        const playerData = this.game.saveManager.loadGame();
        const hasValidSave = !!(playerData && playerData.name && playerData.callsign);

        this.renderContentScreen({
            kicker: 'Pilot Recovery Console',
            title: 'Load Contract File',
            subtitle: 'Review the active pilot record before returning to the hangar.',
            bodyBuilder: (body) => {
                if (hasValidSave) {
                    const ship = this.game.getPlayerShipProfile(playerData.shipId);
                    const difficulty = this.game.getDifficultyProfile(playerData.difficulty);
                    body.innerHTML = `
                        <div class="dos-grid-2">
                            <div>
                                <div class="dos-label">Pilot</div>
                                <div class="dos-copy" style="margin-top:10px;">
                                    <strong>${playerData.name}</strong><br>
                                    Callsign ${playerData.callsign}<br>
                                    ${ship.displayName}<br>
                                    ${difficulty.displayName}
                                </div>
                            </div>
                            <div>
                                <div class="dos-label">Contract Status</div>
                                <div class="dos-copy" style="margin-top:10px;">
                                    Mission ${playerData.level || 1}<br>
                                    Funds $${playerData.money || 0}<br>
                                    Cleared ${playerData.lastCompletedLevel || 0}
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    body.innerHTML = '<div class="dos-copy">No valid pilot file found. Start a new game to create a contract record.</div>';
                }
            },
            actions: [
                this.createActionButton(hasValidSave ? 'Load Pilot' : 'No Save', () => {
                    if (!hasValidSave) return;
                    this.game.setPlayerData(playerData);
                    this.game.changeState('hangar');
                }),
                this.createActionButton('Delete Save', () => {
                    if (!hasValidSave) return;
                    if (confirm('Delete the saved pilot file?')) {
                        this.game.saveManager.deleteSaveGame();
                        this.showLoadGameScreen();
                    }
                }),
                this.createBackButton(() => this.setupMenuScreen())
            ]
        });
    }

    showReadme() {
        this.renderContentScreen({
            kicker: 'Field Manual',
            title: 'Readme',
            subtitle: 'Mission controls and design notes for the current tribute build.',
            bodyBuilder: (body) => {
                body.innerHTML = `
                    <div class="dos-grid-2">
                        <div class="dos-copy">
                            <div class="dos-label">Controls</div>
                            <div style="margin-top:10px;">
                                Move : Arrow Keys / WASD<br>
                                Fire : Space / Ctrl / Mouse Left<br>
                                Secondary : Shift<br>
                                Toggle Secondary : Alt<br>
                                Megabomb : B<br>
                                Pause : P / Esc
                            </div>
                        </div>
                        <div class="dos-copy">
                            <div class="dos-label">Current Build</div>
                            <div style="margin-top:10px;">
                                Cash-first HUD<br>
                                Persistent pilot / airframe data<br>
                                Difficulty scaling<br>
                                Hangar / shop / briefing loop<br>
                                Level 1 landmark pass
                            </div>
                        </div>
                    </div>
                `;
            },
            actions: [this.createBackButton(() => this.setupMenuScreen())]
        });
    }

    showCredits() {
        this.renderContentScreen({
            kicker: 'Project Record',
            title: 'Credits',
            subtitle: 'Source acknowledgment and current build attribution.',
            bodyBuilder: (body) => {
                body.innerHTML = `
                    <div class="dos-copy">
                        <strong>Raptor: Call of the Shadows Reimagined</strong><br><br>
                        Tribute project based on the 1994 original by Cygnus Studios / Apogee Software.<br>
                        Current codebase shaped through iterative AI-assisted development and local integration passes.<br>
                        Runtime art and code in this repo are maintained as a non-commercial fan project.
                    </div>
                `;
            },
            actions: [this.createBackButton(() => this.setupMenuScreen())]
        });
    }

    showOptionsMenu() {
        const resolutions = [
            { label: '960 x 540', width: 960, height: 540 },
            { label: '1280 x 720', width: 1280, height: 720 },
            { label: '1440 x 810', width: 1440, height: 810 }
        ];

        this.renderContentScreen({
            kicker: 'Display Configuration',
            title: 'Options',
            subtitle: 'Adjust the active window resolution or move the game into a dedicated popup.',
            bodyBuilder: (body) => {
                const list = document.createElement('div');
                list.className = 'dos-terminal-list';
                resolutions.forEach((res) => {
                    const selected = res.width === this.game.width && res.height === this.game.height;
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = `dos-list-button${selected ? ' selected' : ''}`;
                    button.innerHTML = `<span class="title">${res.label}</span><span class="meta">Render window</span>`;
                    button.addEventListener('click', () => {
                        this.game.audio.playSound('uiConfirm');
                        this.setGameResolution(res.width, res.height);
                        this.showOptionsMenu();
                    });
                    list.appendChild(button);
                });
                body.appendChild(list);
            },
            actions: [
                this.createActionButton('Pop Out', () => {
                    const width = this.game.width;
                    const height = this.game.height;
                    const features = `width=${width},height=${height},resizable=no,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`;
                    const popup = window.open(window.location.pathname, 'RaptorGamePopup', features);
                    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                        alert('Popup was blocked. Allow popups for this site to use the pop out view.');
                    }
                }),
                this.createBackButton(() => this.setupMenuScreen())
            ]
        });
    }

    updateMenuForLoadedAssets() {
        // Assets are loaded before the menu enters; no runtime patching required.
    }

    isMainMenuActive() {
        return this.menuOptionElements.length === this.menuOptions.length && this.menuOptionElements.every((option) => option.isConnected);
    }

    update() {
        if (!this.isMainMenuActive()) {
            if (this.game.input.wasKeyJustPressed('Escape')) {
                this.game.audio.playSound('uiBack');
                this.setupMenuScreen();
            }
            return;
        }

        if (this.game.input.wasKeyJustPressed('ArrowUp') || this.game.input.wasKeyJustPressed('w')) {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
            this.game.audio.playSound('uiMove');
            this.highlightSelectedOption();
        }

        if (this.game.input.wasKeyJustPressed('ArrowDown') || this.game.input.wasKeyJustPressed('s')) {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
            this.game.audio.playSound('uiMove');
            this.highlightSelectedOption();
        }

        if (this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) {
            this.game.audio.playSound('uiConfirm');
            this.menuOptions[this.selectedOption].action();
        }
    }

    highlightSelectedOption() {
        this.menuOptionElements.forEach((option, index) => {
            option.classList.toggle('selected', index === this.selectedOption);
        });
    }

    render() {}

    exit() {
        document.getElementById('menu-screen').style.display = 'none';
        logger.info('Exiting Menu State');
    }

    setGameResolution(width, height) {
        this.game.width = width;
        this.game.height = height;
        for (const key in this.game.layers) {
            const canvas = this.game.layers[key];
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
        }
        for (const key in this.game.layers) {
            const canvas = this.game.layers[key];
            canvas.style.position = 'absolute';
            canvas.style.left = '50%';
            canvas.style.top = '50%';
            canvas.style.transform = 'translate(-50%, -50%)';
        }
        if (this.game.currentState && typeof this.game.currentState.resize === 'function') {
            this.game.currentState.resize();
        }
    }
}

export { MenuState };
