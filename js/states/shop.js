import shopItems from '../data/shopItems.js';

class ShopState {
    constructor(game) {
        this.game = game;
        this.items = shopItems;
        this.selectedItemIndex = 0;
    }

    enter() {
        console.log("Entering Shop State");
        this.setupShopScreen();
    }

    exit() {
        console.log("Exiting Shop State");
        const shopScreen = document.getElementById('shop-screen');
        if (shopScreen) {
            shopScreen.style.display = 'none';
        }
    }

    update(deltaTime) {
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

    setupShopScreen() {
        let shopScreen = document.getElementById('shop-screen');
        if (!shopScreen) {
            shopScreen = document.createElement('div');
            shopScreen.id = 'shop-screen';
            shopScreen.style.position = 'absolute';
            shopScreen.style.top = '0';
            shopScreen.style.left = '0';
            shopScreen.style.width = '100%';
            shopScreen.style.height = '100%';
            shopScreen.style.display = 'flex';
            shopScreen.style.zIndex = '1000';
            document.body.appendChild(shopScreen);
        } else {
            shopScreen.style.display = 'flex';
        }

        document.getElementById('menu-screen').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'none';
        document.getElementById('hangar-screen').style.display = 'none';

        shopScreen.innerHTML = '';

        const shopBackground = this.game.assets.getImage('shopBackground');

        const mainContainer = document.createElement('div');
        mainContainer.style.display = 'flex';
        mainContainer.style.flexDirection = 'column';
        mainContainer.style.alignItems = 'center';
        mainContainer.style.justifyContent = 'center';
        mainContainer.style.width = '100%';
        mainContainer.style.height = '100%';
        mainContainer.style.position = 'relative';
        mainContainer.style.overflow = 'hidden';

        if (shopBackground) {
            const bgImg = document.createElement('img');
            bgImg.src = shopBackground.src;
            bgImg.style.width = '100%';
            bgImg.style.height = '100%';
            bgImg.style.objectFit = 'cover';
            bgImg.style.position = 'absolute';
            bgImg.style.top = '0';
            bgImg.style.left = '0';
            bgImg.style.zIndex = '1';
            mainContainer.appendChild(bgImg);
        } else {
            mainContainer.style.backgroundColor = '#0a1128';
        }

        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '2';
        mainContainer.appendChild(overlay);

        const title = document.createElement('h1');
        title.textContent = 'WEAPONS & SUPPLY';
        title.style.color = 'white';
        title.style.fontSize = '40px';
        title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        title.style.zIndex = '3';
        title.style.position = 'absolute';
        title.style.top = '20px';
        title.style.left = '50%';
        title.style.transform = 'translateX(-50%)';
        mainContainer.appendChild(title);

        let playerMoney = 0;
        if (this.game.player && this.game.player.money !== undefined) {
            playerMoney = this.game.player.money;
        } else if (this.game.playerData && this.game.playerData.money !== undefined) {
            playerMoney = this.game.playerData.money;
        }

        const moneyDisplay = document.createElement('div');
        moneyDisplay.textContent = `Funds: $${playerMoney}`;
        moneyDisplay.style.color = '#ffcc00';
        moneyDisplay.style.fontSize = '24px';
        moneyDisplay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        moneyDisplay.style.zIndex = '3';
        moneyDisplay.style.position = 'absolute';
        moneyDisplay.style.top = '80px';
        moneyDisplay.style.left = '50%';
        moneyDisplay.style.transform = 'translateX(-50%)';
        mainContainer.appendChild(moneyDisplay);

        // Add health display on middle left side
        let playerHealth = 75; // Default fallback
        if (this.game.player && this.game.player.health !== undefined) {
            playerHealth = this.game.player.health;
        } else if (this.game.playerData && this.game.playerData.health !== undefined) {
            playerHealth = this.game.playerData.health;
        }

        const healthDisplay = document.createElement('div');
        healthDisplay.innerHTML = `
            <div style="color: #ffcc00; font-size: 20px; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">PILOT HEALTH</div>
            <div style="color: white; font-size: 36px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">${playerHealth}/100</div>
        `;
        healthDisplay.style.zIndex = '3';
        healthDisplay.style.position = 'absolute';
        healthDisplay.style.bottom = '80px';
        healthDisplay.style.left = '20px';
        healthDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        healthDisplay.style.padding = '20px';
        healthDisplay.style.borderRadius = '10px';
        healthDisplay.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        healthDisplay.style.textAlign = 'center';
        mainContainer.appendChild(healthDisplay);

        const itemsContainer = document.createElement('div');
        itemsContainer.style.display = 'flex';
        itemsContainer.style.flexDirection = 'column';
        itemsContainer.style.alignItems = 'center';
        itemsContainer.style.justifyContent = 'center';
        itemsContainer.style.position = 'absolute';
        itemsContainer.style.top = '45%';
        itemsContainer.style.left = '50%';
        itemsContainer.style.transform = 'translate(-50%, -50%)';
        itemsContainer.style.zIndex = '3';
        itemsContainer.style.width = '80%';
        itemsContainer.style.maxWidth = '800px';

        this.items.forEach((item, index) => {
            const itemRow = document.createElement('div');
            itemRow.style.display = 'flex';
            itemRow.style.alignItems = 'center';
            itemRow.style.width = '100%';
            itemRow.style.margin = '5px 0';
            itemRow.style.position = 'relative';

            const itemElement = document.createElement('div');
            itemElement.style.display = 'flex';
            itemElement.style.justifyContent = 'space-between';
            itemElement.style.alignItems = 'center';
            itemElement.style.width = '300px';
            itemElement.style.padding = '15px 20px';
            itemElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            itemElement.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            itemElement.style.borderRadius = '8px';
            itemElement.style.cursor = 'pointer';
            itemElement.style.transition = 'all 0.2s ease';
            itemElement.style.color = 'white';
            itemElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';

            const itemName = document.createElement('span');
            itemName.textContent = item.name;
            itemName.style.fontSize = '20px';
            itemName.style.fontWeight = 'bold';

            const itemPrice = document.createElement('span');
            // Get current money dynamically
            let currentMoney = 0;
            if (this.game.player && this.game.player.money !== undefined) {
                currentMoney = this.game.player.money;
            } else if (this.game.playerData && this.game.playerData.money !== undefined) {
                currentMoney = this.game.playerData.money;
            }
            const canAfford = currentMoney >= item.price;
            itemPrice.textContent = `$${item.price}`;
            itemPrice.style.fontSize = '20px';
            itemPrice.style.color = canAfford ? 'white' : '#7D8491';

            itemElement.appendChild(itemName);
            itemElement.appendChild(itemPrice);

            const description = document.createElement('div');
            description.textContent = item.description;
            description.style.color = 'cyan';
            description.style.fontSize = '16px';
            description.style.position = 'absolute';
            description.style.left = '350px';
            description.style.top = '50%';
            description.style.transform = 'translateY(-50%)';
            description.style.maxWidth = '400px';
            description.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            description.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            description.style.padding = '10px';
            description.style.borderRadius = '5px';
            description.style.border = '1px solid #333';
            description.style.display = 'none';
            description.style.zIndex = '10';

            itemElement.addEventListener('mouseover', () => {
                this.selectedItemIndex = index;
                itemElement.style.color = '#ffcc00';
                itemElement.style.textShadow = '0 0 15px #ffcc00';
                itemElement.style.borderColor = '#ffcc00';
                description.style.display = 'block';
            });

            itemElement.addEventListener('mouseout', () => {
                itemElement.style.color = 'white';
                itemElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
                itemElement.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                description.style.display = 'none';
            });

            itemElement.addEventListener('click', () => {
                this.selectedItemIndex = index;
                this.purchaseSelectedItem();
            });

            itemRow.appendChild(itemElement);
            itemRow.appendChild(description);
            itemsContainer.appendChild(itemRow);
        });

        mainContainer.appendChild(itemsContainer);

        const instructions = document.createElement('div');
        instructions.innerHTML = 'Arrow Keys: Navigate | Enter: Purchase | Escape: Exit';
        instructions.style.color = '#aaa';
        instructions.style.fontSize = '14px';
        instructions.style.textAlign = 'center';
        instructions.style.position = 'absolute';
        instructions.style.bottom = '50px';
        instructions.style.left = '50%';
        instructions.style.transform = 'translateX(-50%)';
        instructions.style.zIndex = '3';
        instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        instructions.style.padding = '10px';
        instructions.style.borderRadius = '5px';
        instructions.style.border = '1px solid #333';
        mainContainer.appendChild(instructions);

        const backButton = document.createElement('button');
        backButton.textContent = '← Back to Hangar';
        backButton.style.position = 'absolute';
        backButton.style.bottom = '20px';
        backButton.style.left = '20px';
        backButton.style.zIndex = '4';
        backButton.style.padding = '12px 20px';
        backButton.style.fontSize = '16px';
        backButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        backButton.style.color = 'white';
        backButton.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        backButton.style.borderRadius = '6px';
        backButton.style.cursor = 'pointer';
        backButton.style.transition = 'all 0.2s ease';
        backButton.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';

        backButton.addEventListener('mouseover', () => {
            backButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            backButton.style.color = '#ffcc00';
            backButton.style.textShadow = '0 0 15px #ffcc00';
            backButton.style.borderColor = '#ffcc00';
        });

        backButton.addEventListener('mouseout', () => {
            backButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            backButton.style.color = 'white';
            backButton.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            backButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });

        backButton.addEventListener('click', () => {
            this.exitShop();
        });

        mainContainer.appendChild(backButton);
        shopScreen.appendChild(mainContainer);
    }

    render(contexts) {
        // Shop is now rendered using HTML/CSS
    }

    selectNextItem() {
        this.selectedItemIndex = (this.selectedItemIndex + 1) % this.items.length;
        this.highlightSelectedItem();
    }

    selectPreviousItem() {
        this.selectedItemIndex = (this.selectedItemIndex - 1 + this.items.length) % this.items.length;
        this.highlightSelectedItem();
    }

    /**
     * Highlight the currently selected item for keyboard navigation
     */
    highlightSelectedItem() {
        const shopScreen = document.getElementById('shop-screen');
        const items = shopScreen.querySelectorAll('div > div > div > div > div');
        
        items.forEach((item, index) => {
            if (index < this.items.length) {
                if (index === this.selectedItemIndex) {
                    item.style.color = '#ffcc00';
                    item.style.textShadow = '0 0 15px #ffcc00';
                    item.style.borderColor = '#ffcc00';
                } else {
                    item.style.color = 'white';
                    item.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
                    item.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }
            }
        });
    }

    exitShop() {
        this.game.changeState('hangar'); 
    }

    purchaseSelectedItem() {
        const item = this.items[this.selectedItemIndex];
        
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
            moneySource.money -= item.price;
            
            // Apply effect to both player and playerData if they exist
            if (this.game.player) {
                console.log(`Purchased ${item.name} for $${item.price}`);
                this.applyItemEffect(this.game.player, item);
            }
            
            // Also apply to playerData for persistence
            if (this.game.playerData) {
                this.applyItemEffect(this.game.playerData, item);
                // Save updated playerData to localStorage
                try {
                    localStorage.setItem('raptor_manus_save', JSON.stringify(this.game.playerData));
                } catch (error) {
                    console.error('Error saving updated player data:', error);
                }
            }
            
            // Update displays and refresh shop
            this.updateMoneyDisplay();
            this.updateHealthDisplay();
            this.refreshShopDisplay();
        } else {
            console.log("Not enough funds!");
        }
    }

    refreshShopDisplay() {
        // Refresh the shop display to update price colors and other dynamic elements
        this.setupShopScreen();
    }

    updateMoneyDisplay() {
        const shopScreen = document.getElementById('shop-screen');
        const moneyDisplay = shopScreen.querySelector('div > div > div:nth-child(3)');
        if (moneyDisplay) {
            let playerMoney = 0;
            if (this.game.player && this.game.player.money !== undefined) {
                playerMoney = this.game.player.money;
            } else if (this.game.playerData && this.game.playerData.money !== undefined) {
                playerMoney = this.game.playerData.money;
            }
            moneyDisplay.textContent = `Funds: $${playerMoney}`;
        }
    }

    updateHealthDisplay() {
        const shopScreen = document.getElementById('shop-screen');
        const healthDisplay = shopScreen.querySelector('div > div > div:nth-child(4)');
        if (healthDisplay) {
            let playerHealth = 75; // Default fallback
            if (this.game.player && this.game.player.health !== undefined) {
                playerHealth = this.game.player.health;
            } else if (this.game.playerData && this.game.playerData.health !== undefined) {
                playerHealth = this.game.playerData.health;
            }
            
            const healthValue = healthDisplay.querySelector('div:nth-child(2)');
            if (healthValue) {
                healthValue.textContent = `${playerHealth}/100`;
            }
        }
    }

    applyItemEffect(player, item) {
        const effect = item.effect;
        switch (item.type) {
            case 'consumable':
                if (effect.stat === 'health') {
                    // For energy module, increase health by 25 up to maximum of 100
                    const currentHealth = player.health || 75;
                    const newHealth = Math.min(100, currentHealth + effect.value);
                    player.health = newHealth;
                    console.log(`Energy module applied: ${currentHealth} -> ${newHealth}`);
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
