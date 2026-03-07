/**
 * Game class
 * The main engine that runs the entire game, manages the canvas layers,
 * the game loop, and the state machine.
 */
import { InputHandler } from './input.js';
import { AssetManager } from './assets.js';
import { AudioManager } from './audio.js';
import { CollisionSystem } from './collision.js';
import { EntityManager } from './entity.js';
import { SaveManager } from './saveManager.js';
import { ObjectPool } from './ObjectPool.js';
import { Projectile } from '../entities/projectile.js';
import { Missile } from '../entities/missile.js';
import { BootState } from '../states/boot.js';
import { LoadingState } from '../states/LoadingState.js';
import { IntroCutsceneState } from '../states/introCutscene.js';
import { MenuState } from '../states/menu.js';
import { GameState } from '../states/gameState.js';
import { PauseState } from '../states/pause.js';
import { GameOverState } from '../states/gameover.js';
import { HangarState } from '../states/hangar.js';
import ShopState from '../states/shop.js';
import { CharacterSelectState } from '../states/characterSelect.js';
import { DifficultySelectState } from '../states/difficultySelect.js';
import { SectorBriefingState } from '../states/sectorBriefing.js';
import { LandingState } from '../states/landing.js';
import { getPlayerShipProfile, getAllPlayerShips } from '../data/playerShips.js';
import { getDifficultyProfile, getAllDifficultyProfiles } from '../data/difficultyProfiles.js';
import { getMissionProfile } from '../data/missions.js';
import { logger } from '../utils/logger.js';

class Game {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60;
        this.currentFPS = 0;
        this.debugMode = false;

        this.gameLoop = this.gameLoop.bind(this);

        this.layers = {
            background: document.getElementById('background-layer'),
            environment: document.getElementById('environment-layer'),
            enemy: document.getElementById('enemy-layer'),
            projectile: document.getElementById('projectile-layer'),
            player: document.getElementById('player-layer'),
            explosion: document.getElementById('explosion-layer'),
            ui: document.getElementById('ui-layer')
        };

        this.contexts = {};
        for (const key in this.layers) {
            const canvas = this.layers[key];
            const ctx = canvas.getContext('2d', { alpha: true });
            ctx.globalCompositeOperation = 'source-over';
            ctx.imageSmoothingEnabled = true;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.contexts[key] = ctx;
        }

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.playerData = this.getDefaultPlayerData();
        this.player = null;
        this.mainScrollSpeed = 50;

        this.input = new InputHandler();
        this.assets = new AssetManager(this);
        this.audio = new AudioManager(this.assets);
        this.collision = new CollisionSystem(this);
        this.entityManager = new EntityManager(this);
        this.saveManager = new SaveManager(this);
        this.projectilePool = new ObjectPool(() => new Projectile(this), 50);
        this.missilePool = new ObjectPool(() => new Missile(this), 20);

        this.states = {
            boot: new BootState(this),
            loading: new LoadingState(this),
            introCutscene: new IntroCutsceneState(this),
            menu: new MenuState(this),
            game: new GameState(this),
            pause: new PauseState(this),
            gameover: new GameOverState(this),
            hangar: new HangarState(this),
            shop: new ShopState(this),
            characterSelect: new CharacterSelectState(this),
            difficultySelect: new DifficultySelectState(this),
            sectorBriefing: new SectorBriefingState(this),
            landing: new LandingState(this)
        };
        this.currentState = null;

        (async () => {
            await this.changeState('boot');
        })();

        requestAnimationFrame(this.gameLoop);
    }

    getDefaultOwnedSystems() {
        return {
            armorPlating: 0,
            shieldCells: 0,
            reactiveShieldEmitter: 0,
            bossHealthIndicator: 0,
            targetingHud: 0,
            threatComputer: 0,
            damageControlKit: 0,
            salvageUplink: 0,
            missileLoader: 0
        };
    }

    normalizeOwnedSystems(value = {}) {
        const defaults = this.getDefaultOwnedSystems();
        const normalized = { ...defaults };
        if (value && typeof value === 'object') {
            Object.keys(defaults).forEach((key) => {
                normalized[key] = Math.max(0, Number(value[key]) || 0);
            });
        }
        return normalized;
    }

    getDefaultPlayerData() {
        const ship = this.getPlayerShipProfile('raptor');
        return {
            name: 'Pilot',
            callsign: 'RAPTOR',
            money: 10000,
            level: 1,
            score: 0,
            lives: 3,
            health: ship.maxHealth,
            maxHealth: ship.maxHealth,
            shield: 0,
            maxShield: 0,
            megabombs: 3,
            unlockedWeapons: [],
            ownedSecondaryWeapons: [],
            equippedSecondaryWeapon: null,
            ownedSystems: this.getDefaultOwnedSystems(),
            lastCompletedLevel: 0,
            difficulty: 'rookie',
            shipId: ship.id,
            primaryWeaponLevel: 1,
            eventFlags: {},
            endingFlags: {},
            missionResults: [],
            timestamp: Date.now()
        };
    }

    getPlayerShipProfile(shipId = 'raptor') {
        return getPlayerShipProfile(shipId);
    }

    getAllPlayerShips() {
        return getAllPlayerShips();
    }

    getDifficultyProfile(difficultyId = 'rookie') {
        return getDifficultyProfile(difficultyId);
    }

    getAllDifficultyProfiles() {
        return getAllDifficultyProfiles();
    }

    getMissionProfile(level = 1) {
        return getMissionProfile(level);
    }

    getSystemRank(systemId, data = this.playerData) {
        return Math.max(0, Number(data?.ownedSystems?.[systemId]) || 0);
    }

    hasSystem(systemId, data = this.playerData) {
        return this.getSystemRank(systemId, data) > 0;
    }

    calculateMissionScore(missionResult) {
        if (!missionResult) {
            return 0;
        }

        const moneyComponent = Math.max(0, missionResult.moneyEarned || 0);
        const airKillComponent = Math.max(0, missionResult.airTargetsDestroyed || 0) * 18;
        const groundKillComponent = Math.max(0, missionResult.groundTargetsDestroyed || 0) * 8;
        const completionComponent = missionResult.completed ? 750 : 0;
        return moneyComponent + airKillComponent + groundKillComponent + completionComponent;
    }

    calculateCampaignScore(playerData = this.playerData, extraMissionResult = null) {
        const results = Array.isArray(playerData?.missionResults) ? [...playerData.missionResults] : [];
        if (extraMissionResult) {
            results.push(extraMissionResult);
        }

        const subtotal = results.reduce((sum, result) => sum + (result.baseScore || this.calculateMissionScore(result)), 0);
        const difficulty = this.getDifficultyProfile(playerData?.difficulty);
        const total = Math.floor(subtotal * (difficulty.scoreMultiplier || 1));

        return {
            total,
            subtotal,
            completedMissions: results.filter((result) => result.completed).length,
            difficulty,
            resultsCount: results.length
        };
    }

    normalizePlayerData(data = {}) {
        const defaults = this.getDefaultPlayerData();
        const merged = { ...defaults, ...data };
        const ship = this.getPlayerShipProfile(merged.shipId || defaults.shipId);
        const difficulty = this.getDifficultyProfile(merged.difficulty || defaults.difficulty);
        const ownedSecondaryWeapons = Array.isArray(merged.ownedSecondaryWeapons) ? merged.ownedSecondaryWeapons : [];
        const unlockedWeapons = Array.isArray(merged.unlockedWeapons) ? merged.unlockedWeapons : [];
        const combinedSecondaries = [...new Set([...ownedSecondaryWeapons, ...unlockedWeapons])];

        merged.shipId = ship.id;
        merged.difficulty = difficulty.id;
        merged.level = Math.max(1, Number(merged.level) || 1);
        merged.money = Number(merged.money) || 0;
        merged.score = Number(merged.score) || 0;
        merged.lives = Math.max(1, Number(merged.lives) || defaults.lives);
        const parsedMaxHealth = Number(merged.maxHealth);
        const parsedHealth = Number(merged.health);
        const parsedMaxShield = Number(merged.maxShield);
        const parsedShield = Number(merged.shield);
        merged.maxHealth = Math.max(1, Number.isFinite(parsedMaxHealth) && parsedMaxHealth > 0 ? parsedMaxHealth : ship.maxHealth);
        merged.health = Math.min(merged.maxHealth, Math.max(0, Number.isFinite(parsedHealth) ? parsedHealth : ship.maxHealth));
        merged.maxShield = Math.max(0, Number.isFinite(parsedMaxShield) ? parsedMaxShield : 0);
        merged.shield = Math.min(merged.maxShield, Math.max(0, Number.isFinite(parsedShield) ? parsedShield : 0));
        merged.megabombs = Math.max(0, Number(merged.megabombs) || defaults.megabombs);
        merged.lastCompletedLevel = Math.max(0, Number(merged.lastCompletedLevel) || 0);
        merged.primaryWeaponLevel = Math.max(1, Number(merged.primaryWeaponLevel) || 1);
        merged.ownedSecondaryWeapons = combinedSecondaries;
        merged.unlockedWeapons = [...combinedSecondaries];
        merged.equippedSecondaryWeapon = combinedSecondaries.includes(merged.equippedSecondaryWeapon)
            ? merged.equippedSecondaryWeapon
            : (combinedSecondaries[0] || null);
        merged.ownedSystems = this.normalizeOwnedSystems(merged.ownedSystems);
        merged.eventFlags = merged.eventFlags && typeof merged.eventFlags === 'object' ? { ...merged.eventFlags } : {};
        merged.endingFlags = merged.endingFlags && typeof merged.endingFlags === 'object' ? { ...merged.endingFlags } : {};
        merged.missionResults = Array.isArray(merged.missionResults) ? [...merged.missionResults] : [];
        merged.timestamp = Date.now();
        return merged;
    }

    setPlayerData(data = {}) {
        this.playerData = this.normalizePlayerData(data);
        return this.playerData;
    }

    resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        this.width = windowWidth;
        this.height = windowHeight;

        for (const key in this.layers) {
            const canvas = this.layers[key];
            canvas.width = windowWidth;
            canvas.height = windowHeight;
            canvas.style.width = `${windowWidth}px`;
            canvas.style.height = `${windowHeight}px`;
            canvas.style.position = 'absolute';
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.transform = '';
        }

        if (this.currentState && typeof this.currentState.resize === 'function') {
            this.currentState.resize();
        }
    }

    update(deltaTime) {
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
        this.input.update();

        if (this.input.skipWavePressed) {
            logger.debug('DEBUG: Skip Wave Pressed!');
            if (this.currentState && typeof this.currentState.skipWave === 'function') {
                this.currentState.skipWave();
            }
        }

        if (this.input.restartLevelPressed) {
            logger.debug('DEBUG: Restart Level Pressed!');
            if (this.currentState && typeof this.currentState.restartLevel === 'function') {
                this.currentState.restartLevel();
            }
        }

        if (this.input.cycleLevelPressed) {
            logger.debug('DEBUG: Cycle Level Pressed!');
            this.cycleLevel();
        }
    }

    render() {
        for (const key in this.contexts) {
            const ctx = this.contexts[key];
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, this.width, this.height);
        }

        if (this.currentState) {
            this.currentState.render(this.contexts);
        }
    }

    gameLoop(timestamp) {
        if (!this.lastTime) {
            this.lastTime = timestamp;
        }

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.currentFPS = Math.round(1000 / Math.max(deltaTime, 1));
        this.accumulator += deltaTime;

        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }

        this.render();
        requestAnimationFrame(this.gameLoop);
    }

    cycleLevel() {
        logger.debug('Attempting to cycle level...');
        if (this.currentState instanceof GameState) {
            this.currentState.cycleLevel();
        } else {
            logger.debug('Cannot cycle level: Not in GameState.');
        }
    }

    async changeState(stateName, context = {}) {
        logger.info(`Changing state from ${this.currentState ? this.currentState.constructor.name : 'null'} to ${stateName}`);

        const previousState = this.currentState;
        if (previousState && typeof previousState.exit === 'function') {
            logger.info(`Exiting current state: ${previousState.constructor.name}`);
            previousState.exit();
        }

        const newState = this.states[stateName];
        if (!newState) {
            logger.error(`State "${stateName}" not found!`);
            return;
        }

        this.currentState = newState;
        if (typeof this.currentState.enter === 'function') {
            const result = this.currentState.enter({
                ...context,
                fromState: previousState,
                fromStateName: previousState?.name || previousState?.constructor?.name || null
            });
            if (result && typeof result.then === 'function') {
                await result;
            }
        }

        logger.info(`Successfully entered state: ${stateName}`);
    }
}

export { Game };


