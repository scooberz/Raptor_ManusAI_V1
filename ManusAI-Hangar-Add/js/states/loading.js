/**
 * LoadingState class
 * Loads all game assets and shows a loading screen
 */
class LoadingState {
    constructor(game) {
        this.game = game;
        this.loadingProgress = 0;
        this.logo = null;
    }
    
    /**
     * Enter the loading state
     */
    enter() {
        console.log('Entering Loading State');
        
        // Show loading screen
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('menu-screen').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'none';
        
        // Set up asset loading callbacks
        this.game.assets.setProgressCallback(this.updateLoadingProgress.bind(this));
        this.game.assets.setCompleteCallback(() => {
            // Short delay before moving to menu state
            setTimeout(() => {
                this.game.changeState('menu');
            }, 500);
        });
        
        // Load all game assets
        this.loadAllAssets();
    }
    
    /**
     * Update loading progress display
     * @param {number} progress - Loading progress (0-100)
     */
    updateLoadingProgress(progress) {
        this.loadingProgress = progress;
        
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.textContent = `Loading... ${Math.floor(progress)}%`;
    }
    
    /**
     * Load all game assets
     */
    loadAllAssets() {
        const assets = {
            images: {
                // Player assets
                'playerShipBase': 'assets/images/player/player_ship_base.png',
                'playerShipThrust': 'assets/images/player/player_ship_thrust.png',
                
                // Enemy assets
                'enemyFighter': 'assets/images/enemies/enemy_fighter.png',
                'enemyTurret': 'assets/images/enemies/enemy_turret.png',
                'bossLevel1': 'assets/images/enemies/boss_level1.png',
                
                // Projectile assets
                'playerBullet': 'assets/images/projectiles/player_bullet.png',
                'enemyBullet': 'assets/images/projectiles/enemy_bullet.png',
                
                // Explosion assets
                'explosion1': 'assets/images/explosions/explosion_1.png',
                'explosion2': 'assets/images/explosions/explosion_2.png',
                
                // Collectible assets
                'healthPickup': 'assets/images/collectibles/health_pickup.png',
                'shieldPickup': 'assets/images/collectibles/shield_pickup.png',
                'megabombPickup': 'assets/images/collectibles/megabomb_pickup.png',
                
                // Environment assets
                'backgroundLevel1': 'assets/images/environment/background_level1.png',
                'backgroundLevel2': 'assets/images/environment/background_level2.png',
                
                // UI assets
                'healthBar': 'assets/images/ui/health_bar.png',
                'shieldBar': 'assets/images/ui/shield_bar.png',
                'logo': 'assets/images/ui/game_logo.png'
            },
            data: {
                // Level data
                'level1': 'assets/data/level1.json',
                'level2': 'assets/data/level2.json'
            }
        };
        
        // Load all assets
        this.game.assets.loadAssets(assets)
            .catch(error => {
                console.error('Error loading game assets:', error);
                // Show error message on loading screen
                document.getElementById('loading-screen').textContent = 'Error loading game assets. Please refresh the page.';
            });
    }
    
    /**
     * Update the loading state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Nothing to update in loading state
    }
    
    /**
     * Render the loading state
     */
    render() {
        const ctx = this.game.layers.ui;
        
        // Clear the screen
        ctx.clearRect(0, 0, this.game.width, this.game.height);
        
        // Draw logo if available
        if (this.logo) {
            const logoX = (this.game.width - this.logo.width) / 2;
            const logoY = (this.game.height - this.logo.height) / 3;
            ctx.drawImage(this.logo, logoX, logoY);
        }
        
        // Draw loading bar
        const barWidth = this.game.width * 0.6;
        const barHeight = 20;
        const barX = (this.game.width - barWidth) / 2;
        const barY = this.game.height * 0.7;
        
        // Bar background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress bar
        ctx.fillStyle = '#0095DD';
        ctx.fillRect(barX, barY, barWidth * (this.loadingProgress / 100), barHeight);
        
        // Bar border
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Loading text
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Loading... ${Math.floor(this.loadingProgress)}%`, this.game.width / 2, barY + barHeight + 30);
    }
    
    /**
     * Exit the loading state
     */
    exit() {
        console.log('Exiting Loading State');
        
        // Hide loading screen
        document.getElementById('loading-screen').style.display = 'none';
    }
}

