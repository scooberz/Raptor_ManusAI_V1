import shopItems from '../data/shopItems.js';

class ShopState {
    constructor(game) {
        this.game = game;
        this.items = shopItems;
        this.selectedItemIndex = 0;
    }

    enter() {
        console.log("Entering Shop State");
        // The input handling will be done in the update method
    }

    exit() {
        console.log("Exiting Shop State");
    }

    update(deltaTime) {
        // Handle input for shop navigation
        if (this.game.input.wasKeyJustPressed('ArrowUp') || this.game.input.wasKeyJustPressed('w')) {
            this.selectPreviousItem();
        }
        if (this.game.input.wasKeyJustPressed('ArrowDown') || this.game.input.wasKeyJustPressed('s')) {
            this.selectNextItem();
        }
        if (this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) {
            this.purchaseSelectedItem();
        }
        if (this.game.input.wasKeyJustPressed('Escape')) {
            this.exitShop();
        }
    }

    render(contexts) {
        const ctx = contexts.ui;
        ctx.clearRect(0, 0, this.game.width, this.game.height);

        // Background - try to use shop background image, fallback to solid color
        const shopBackground = this.game.assets.getImage('shopBackground');
        if (shopBackground) {
            // Draw the background image to fill the entire canvas
            ctx.drawImage(shopBackground, 0, 0, this.game.width, this.game.height);
        } else {
            // Fallback to solid color if image not loaded
            ctx.fillStyle = '#0a1128'; // Deep Space Blue
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }

        // Title
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial'; // Using Arial as fallback
        ctx.textAlign = 'center';
        ctx.fillText('WEAPONS & SUPPLY', this.game.width / 2, 60);

        // Player Money - with comprehensive fallback
        let playerMoney = 0;
        if (this.game.player && this.game.player.money !== undefined) {
            playerMoney = this.game.player.money;
        } else if (this.game.playerData && this.game.playerData.money !== undefined) {
            playerMoney = this.game.playerData.money;
        }
        
        // Debug info
        console.log('Shop Debug:', {
            hasPlayer: !!this.game.player,
            hasPlayerData: !!this.game.playerData,
            playerMoney: playerMoney,
            playerDataMoney: this.game.playerData ? this.game.playerData.money : 'undefined'
        });
        
        ctx.font = '24px Arial';
        ctx.fillText(`Funds: $${playerMoney}`, this.game.width / 2, 100);

        // Draw Items
        this.items.forEach((item, index) => {
            const yPos = 160 + (index * 60);
            if (index === this.selectedItemIndex) {
                ctx.fillStyle = '#F77F00'; // Accent Orange for selection
                ctx.fillRect(100, yPos - 30, this.game.width - 200, 50);
            }

            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.name, 120, yPos);

            ctx.textAlign = 'right';
            // Dim the price if the player can't afford it
            const canAfford = playerMoney >= item.price;
            ctx.fillStyle = canAfford ? 'white' : '#7D8491';
            ctx.fillText(`$${item.price}`, this.game.width - 120, yPos);
        });

         // Draw selected item description
        const selectedItem = this.items[this.selectedItemIndex];
        ctx.fillStyle = 'cyan';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(selectedItem.description, this.game.width / 2, this.game.height - 50);

        // Draw instructions
        ctx.fillStyle = '#aaa';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Arrow Keys: Navigate | Enter: Purchase | Escape: Exit', this.game.width / 2, this.game.height - 20);
    }

    // --- Input Handlers ---
    selectNextItem() {
        this.selectedItemIndex = (this.selectedItemIndex + 1) % this.items.length;
    }

    selectPreviousItem() {
        this.selectedItemIndex = (this.selectedItemIndex - 1 + this.items.length) % this.items.length;
    }

    exitShop() {
        // Transition back to the Hangar state
        this.game.changeState('hangar'); 
    }

    purchaseSelectedItem() {
        const item = this.items[this.selectedItemIndex];
        
        // Get money from either player object or game's playerData
        let currentMoney = 0;
        let moneySource = null;
        
        if (this.game.player && this.game.player.money !== undefined) {
            currentMoney = this.game.player.money;
            moneySource = this.game.player;
        } else if (this.game.playerData && this.game.playerData.money !== undefined) {
            currentMoney = this.game.playerData.money;
            moneySource = this.game.playerData;
        } else {
            console.log("No money source found - cannot purchase items");
            return;
        }

        if (currentMoney >= item.price) {
            // Deduct money from the source
            moneySource.money -= item.price;
            
            // If we have a player object, also apply the effect
            if (this.game.player) {
                console.log(`Purchased ${item.name} for $${item.price}`);
                this.applyItemEffect(this.game.player, item);
            } else {
                console.log(`Purchased ${item.name} for $${item.price} (no player object to apply effects to)`);
            }
            
            // We should ideally save the game state here
            // this.game.saveManager.saveGame();
        } else {
            console.log("Not enough funds!");
            // Optionally, play a "denied" sound effect
        }
    }

    applyItemEffect(player, item) {
        const effect = item.effect;
        switch (item.type) {
            case 'consumable':
                if (effect.stat === 'health') {
                    player.addHealth(effect.value);
                } else {
                    player[effect.stat] = (player[effect.stat] || 0) + effect.value;
                }
                break;
            case 'upgrade':
                 player[effect.stat] = effect.value;
                break;
            case 'unlock':
                if (!player.unlockedWeapons.includes(effect.value)) {
                    player.unlockedWeapons.push(effect.value);
                }
                break;
        }
         console.log(`Applied effect: ${item.name}. New player stats:`, player);
    }
}

export default ShopState; 