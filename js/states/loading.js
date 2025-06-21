/**
 * LoadingState class
 * Loads all game assets and shows a loading screen
 */
class LoadingState {
    constructor(game) {
        this.game = game;
        this.loadingProgress = 0;
        this.logo = null;
        // FIX #2: Add a flag to prevent this state from running more than once
        this.hasStartedLoading = false;
    }
    
    /**
     * Enter the loading state
     */
    enter() {
        // FIX #2: Add a "guard clause" at the top of the enter method.
        // If loading has already started, do nothing and exit immediately.
        if (this.hasStartedLoading) return;
        this.hasStartedLoading = true; // Set the flag so this can't run again

        console.log('Entering Loading State');
        
        // Show loading screen
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('menu-screen').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'none';
        
        // Reset loading progress
        this.loadingProgress = 0;
        
        // Set up asset loading callbacks
        this.game.assets.setProgressCallback(this.updateLoadingProgress.bind(this));
        this.game.assets.setCompleteCallback(() => {
            // Force progress to 100% if it's close
            if (this.loadingProgress > 95) {
                this.loadingProgress = 100;
            }
            
            // Ensure all assets are loaded before transitioning
            if (this.game.assets.isLoadingComplete()) {
                // Add a small delay to ensure everything is ready
                setTimeout(() => {
                    // Fade out loading screen
                    const loadingScreen = document.getElementById('loading-screen');
                    loadingScreen.style.transition = 'opacity 0.5s ease-out';
                    loadingScreen.style.opacity = '0';
                    
                    // Transition to menu after fade
                    setTimeout(() => {
                        this.game.changeState('menu');
                    }, 500);
                }, 300);
            } else {
                console.warn('Assets not fully loaded, waiting...');
                // Check again after a short delay
                setTimeout(() => {
                    if (this.game.assets.isLoadingComplete()) {
                        // Fade out loading screen
                        const loadingScreen = document.getElementById('loading-screen');
                        loadingScreen.style.transition = 'opacity 0.5s ease-out';
                        loadingScreen.style.opacity = '0';
                        
                        // Transition to menu after fade
                        setTimeout(() => {
                            this.game.changeState('menu');
                        }, 500);
                    } else {
                        console.error('Failed to load all assets');
                        document.getElementById('loading-screen').textContent = 'Error loading game assets. Please refresh the page.';
                    }
                }, 1000);
            }
        });
        
        // Load all game assets
        this.loadAllAssets();
    }
    
    /**
     * Update loading progress display
     * @param {number} progress - Loading progress (0-100)
     */
    updateLoadingProgress(progress) {
        // Ensure progress is a valid number
        if (typeof progress !== 'number' || isNaN(progress)) {
            progress = 0;
        }
        
        // Clamp progress between 0 and 100
        this.loadingProgress = Math.max(0, Math.min(100, progress));
        
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.textContent = `Loading... ${Math.floor(this.loadingProgress)}%`;
        }
    }
    
    /**
     * Load all game assets
     */
    loadAllAssets() {
        // Split assets into essential and non-essential
        const essentialAssets = {
            images: {
                // Player assets
                'playerShipBase': 'assets/images/player/player_ship_base.png',
                'playerShipLeft': 'assets/images/player/player_ship_left.png',
                'playerShipRight': 'assets/images/player/player_ship_right.png',
                'playerShipThrust': 'assets/images/player/player_ship_thrust.png',
                
                // Enemy assets (only load first level enemies)
                'enemyFighter': 'assets/images/enemies/enemy_turret.png',
                
                // Projectile assets
                'playerBullet': 'assets/images/projectiles/enemy_bullet.png',
                'enemyBullet': 'assets/images/projectiles/enemy_bullet.png',
                
                // Environment assets (only first level)
                'backgroundLevel1': 'assets/images/environment/background_level2.png',
                
                // UI assets (only essential)
                'healthBar': 'assets/images/ui/health_bar.png',
                'shieldBar': 'assets/images/ui/shield_bar.png'
            }
        };

        // Load essential assets first
        this.game.assets.loadAssets(essentialAssets)
            .then(() => {
                // Once essential assets are loaded, start loading non-essential assets in the background
                const nonEssentialAssets = {
                    images: {
                        // Additional player assets
                        'playerShipThrust': 'assets/images/player/player_ship_thrust.png',
                        
                        // Additional enemy assets
                        'enemyTurret': 'assets/images/enemies/enemy_turret.png',
                        'bossLevel1': 'assets/images/enemies/boss_level1.png',
                        
                        // Additional effects
                        'explosion1': 'assets/images/explosions/explosion_2.png',
                        'explosion2': 'assets/images/explosions/explosion_2.png',
                        
                        // Additional collectibles
                        'healthPickup': 'assets/images/collectibles/shield_pickup.png',
                        'shieldPickup': 'assets/images/collectibles/shield_pickup.png',
                        'megabombPickup': 'assets/images/collectibles/megabomb_pickup.png',
                        
                        // Additional environment
                        'backgroundLevel2': 'assets/images/environment/background_level2.png',
                        
                        // Additional UI
                        'logo': 'assets/images/ui/game_logo.png'
                    }
                };

                // Load non-essential assets in the background
                this.game.assets.loadAssets(nonEssentialAssets).catch(error => {
                    console.warn('Non-essential assets failed to load:', error);
                });
            })
            .catch(error => {
                console.error('Error loading essential assets:', error);
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
        const ctx = this.game.contexts.ui;
        
        // Clear the screen
        ctx.clearRect(0, 0, this.game.width, this.game.height);
        
        // Only draw loading elements if loading is not complete
        if (this.loadingProgress < 100) {
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
    }
    
    /**
     * Exit the loading state
     */
    exit() {
        console.log('Exiting Loading State');
        
        // Get loading screen and clear all its contents
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            // Clear any existing content
            while (loadingScreen.firstChild) {
                loadingScreen.removeChild(loadingScreen.firstChild);
            }
            
            // Hide the screen
            loadingScreen.style.display = 'none';
            
            // Clear any inline styles
            loadingScreen.style.cssText = '';
        }
        
        // Clear the UI canvas
        const ctx = this.game.contexts.ui;
        ctx.clearRect(0, 0, this.game.width, this.game.height);
    }
}

export { LoadingState };