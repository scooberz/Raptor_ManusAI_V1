export class LoadingState {
    constructor(game) {
        this.game = game;
        this.loadingProgress = 0;
    }

    /**
     * The main entry point for the state. This will now reliably
     * load all assets and then transition to the next state.
     */
    async enter() {
        console.log("--- Running Final, Corrected LoadingState ---");
        const allAssets = [
            // UI & Backgrounds
            { key: 'logo', type: 'image', path: 'assets/images/ui/game_logo.png' },
            { key: 'menuBackground', type: 'image', path: 'assets/images/ui/menu_background.png' },
            { key: 'hangarBackground', type: 'image', path: 'assets/images/ui/hangar_background.png' },
            { key: 'shopBackground', type: 'image', path: 'assets/images/ui/shop_background.png' },
            { key: 'characterSelectBackground', type: 'image', path: 'assets/images/ui/character_select_background.png' },
            { key: 'cutscenePanel1', type: 'image', path: 'assets/images/ui/Raptor intro cutscene 1.png' },
            { key: 'cutscenePanel2', type: 'image', path: 'assets/images/ui/Raptor intro cutscene 2.png' },
            { key: 'healthBar', type: 'image', path: 'assets/images/ui/health_bar.png' },
            { key: 'shieldBar', type: 'image', path: 'assets/images/ui/shield_bar.png' },
            // Player Assets
            { key: 'playerShipBase', type: 'image', path: 'assets/images/player/player_ship_base.png' },
            { key: 'playerShipLeft', type: 'image', path: 'assets/images/player/player_ship_left.png' },
            { key: 'playerShipRight', type: 'image', path: 'assets/images/player/player_ship_right.png' },
            { key: 'playerShipThrust', type: 'image', path: 'assets/images/player/player_ship_thrust.png' },
            // Projectile Assets
            { key: 'enemyBullet', type: 'image', path: 'assets/images/projectiles/enemy_projectile.png' },
            { key: 'MISSILE', type: 'image', path: 'assets/images/projectiles/player_missile.png' },
            { key: 'enemyMissile', type: 'image', path: 'assets/images/projectiles/enemyMissile.png' },
            // Enemy Assets
            { key: 'enemyStriker', type: 'image', path: 'assets/images/enemies/striker.png' },
            { key: 'enemyCyclone', type: 'image', path: 'assets/images/enemies/cyclone.png' },
            { key: 'enemyGnat', type: 'image', path: 'assets/images/enemies/gnat.png' },
            { key: 'enemyReaper', type: 'image', path: 'assets/images/enemies/reaper.png' },
            { key: 'enemyDart', type: 'image', path: 'assets/images/enemies/dart.png' },
            { key: 'enemyGoliath', type: 'image', path: 'assets/images/enemies/goliath.png' },
            { key: 'enemyCutter', type: 'image', path: 'assets/images/enemies/cutter.png' },
            { key: 'enemyMine', type: 'image', path: 'assets/images/enemies/mine.png' },
            { key: 'enemyTurret', type: 'image', path: 'assets/images/enemies/enemy_turret.png' },
            { key: 'bossLevel1', type: 'image', path: 'assets/images/enemies/boss_level1.png' },
            // Environment & Backgrounds
            { key: 'backgroundLevel1', type: 'image', path: 'assets/images/environment/background_level1.png' },
            { key: 'fuelTank', type: 'image', path: 'assets/images/environment/FUEL_TANK.png' },
            { key: 'bunker', type: 'image', path: 'assets/images/environment/BUNKER.png' },
            { key: 'radarDish', type: 'image', path: 'assets/images/environment/RADAR_DISH.png' },
            // Effects & Collectibles
            { key: 'explosion1', type: 'image', path: 'assets/images/explosions/explosion_1.png' },
            { key: 'shieldPickup', type: 'image', path: 'assets/images/collectibles/shield_pickup.png' },
            { key: 'megabombPickup', type: 'image', path: 'assets/images/collectibles/megabomb_pickup.png' },
        ];
        try {
            await this.game.assets.loadAll(allAssets, (progress) => {
                this.loadingProgress = progress;
            });
            console.log("SUCCESS: All assets loaded. Transitioning state...");
            this.game.changeState('introCutscene');
        } catch (error) {
            console.error("CRITICAL ERROR in LoadingState:", error);
        }
    }

    render(contexts) {
        const ctx = contexts.ui;
        ctx.clearRect(0, 0, this.game.width, this.game.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        const barWidth = this.game.width * 0.6;
        const barX = (this.game.width - barWidth) / 2;
        ctx.fillStyle = 'cyan';
        ctx.fillRect(barX, this.game.height / 2, barWidth * this.loadingProgress, 30);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Loading... ${Math.round(this.loadingProgress * 100)}%`, this.game.width / 2, this.game.height / 2 + 22);
    }

    update(deltaTime) {}
    exit() {}
} 