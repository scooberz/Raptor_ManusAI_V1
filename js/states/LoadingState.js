import { logger } from '../utils/logger.js';

export class LoadingState {
    constructor(game) {
        this.game = game;
        this.loadingProgress = 0;
    }

    async enter() {
        logger.info('Running LoadingState');

        this.game.assets.setProgressCallback((progress) => {
            this.loadingProgress = progress / 100;
        });

        const allAssets = {
            images: {
                menuBackground: 'assets/images/ui/menu_background.png',
                hangarBackground: 'assets/images/ui/hangar_background.png',
                shopBackground: 'assets/images/ui/shop_background.png',
                characterSelectBackground: 'assets/images/ui/character_select_background.png',
                cutscenePanel1: 'assets/images/ui/Raptor intro cutscene 1.png',
                cutscenePanel2: 'assets/images/ui/Raptor intro cutscene 2.png',
                healthBar: 'assets/images/ui/health_bar.png',
                shieldBar: 'assets/images/ui/shield_bar.png',
                playerShipBase: 'assets/images/player/player_ship_base.png',
                playerShipLeft: 'assets/images/player/player_ship_left.png',
                playerShipRight: 'assets/images/player/player_ship_right.png',
                playerShipThrust: 'assets/images/player/player_ship_thrust.png',
                playerBullet: 'assets/images/projectiles/player_bullet.png',
                enemyBullet: 'assets/images/projectiles/enemy_projectile.png',
                MISSILE: 'assets/images/projectiles/player_missile.png',
                enemyMissile: 'assets/images/projectiles/enemyMissile.png',
                enemyFighter: 'assets/images/enemies/enemy_fighter.png',
                enemyStriker: 'assets/images/enemies/striker.png',
                enemyCyclone: 'assets/images/enemies/cyclone.png',
                enemyGnat: 'assets/images/enemies/gnat.png',
                enemyReaper: 'assets/images/enemies/reaper.png',
                enemyDart: 'assets/images/enemies/dart.png',
                enemyGoliath: 'assets/images/enemies/goliath.png',
                enemyCutter: 'assets/images/enemies/cutter.png',
                enemyMine: 'assets/images/enemies/mine.png',
                enemyTurret: 'assets/images/enemies/enemy_turret.png',
                bossLevel1: 'assets/images/enemies/boss_level1.png',
                backgroundLevel1: 'assets/images/environment/background_level1.png',
                backgroundLevel2: 'assets/images/environment/background_level2.png',
                tileset_level1: 'assets/images/environment/tileset.png',
                fuelTank: 'assets/images/environment/FUEL_TANK.png',
                bunker: 'assets/images/environment/BUNKER.png',
                radarDish: 'assets/images/environment/RADAR_DISH.png',
                explosion1: 'assets/images/explosions/explosion_1.png',
                explosion2: 'assets/images/explosions/explosion_2.png',
                impactEffect: 'assets/images/explosions/explosion_2.png',
                healthPickup: 'assets/images/collectibles/health_pickup.png',
                shieldPickup: 'assets/images/collectibles/shield_pickup.png',
                megabombPickup: 'assets/images/collectibles/megabomb_pickup.png'
            }
        };

        try {
            await this.game.assets.loadAssets(allAssets);
            logger.info('All visual assets loaded. Transitioning to intro cutscene.');
            this.game.changeState('introCutscene');
        } catch (error) {
            logger.error('Critical error in LoadingState:', error);
            this.game.changeState('introCutscene');
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
