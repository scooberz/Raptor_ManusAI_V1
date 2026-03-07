import shopItems, { shopCategories } from '../data/shopItems.js';
import { logger } from '../utils/logger.js';

class ShopState {
    constructor(game) {
        this.game = game;
        this.items = shopItems;
        this.categories = shopCategories;
        this.selectedCategoryIndex = 0;
        this.selectedItemIndex = 0;
    }

    enter() {
        logger.info('Entering Shop State');
        this.selectedCategoryIndex = 0;
        this.selectedItemIndex = 0;
        this.setupShopScreen();
    }

    exit() {
        logger.info('Exiting Shop State');
        const shopScreen = document.getElementById('shop-screen');
        if (shopScreen) {
            shopScreen.style.display = 'none';
        }
    }

    getCurrentCategory() {
        return this.categories[this.selectedCategoryIndex]?.id || this.categories[0].id;
    }

    getVisibleItems() {
        return this.items.filter((item) => item.category === this.getCurrentCategory());
    }

    getWorkingPlayerData() {
        return this.game.normalizePlayerData(this.game.playerData || this.game.getDefaultPlayerData());
    }

    getSystemRank(playerData, systemId) {
        return Math.max(0, Number(playerData?.ownedSystems?.[systemId]) || 0);
    }

    getHullRepairState(playerData, item) {
        const missingHull = Math.max(0, playerData.maxHealth - playerData.health);
        const repairAmount = Math.min(item.healAmount, missingHull);
        const price = repairAmount > 0 ? repairAmount * item.pricePerPoint : 0;
        return {
            price,
            canPurchase: repairAmount > 0 && playerData.money >= price,
            actionLabel: repairAmount > 0 ? 'Repair' : 'Full',
            statusText: repairAmount > 0 ? `Restore ${repairAmount} hull` : 'Hull already at maximum',
            repairAmount
        };
    }

    getItemState(item, playerData) {
        switch (item.purchaseMode) {
            case 'service':
                return this.getHullRepairState(playerData, item);
            case 'rank': {
                const rank = this.getSystemRank(playerData, item.systemId);
                if (rank >= item.maxRank) {
                    return {
                        price: 0,
                        canPurchase: false,
                        actionLabel: 'Max',
                        statusText: `Installed rank ${rank}/${item.maxRank}`,
                        rank
                    };
                }
                const price = item.basePrice + (rank * item.priceStep);
                return {
                    price,
                    canPurchase: playerData.money >= price,
                    actionLabel: `Buy Mk ${rank + 1}`,
                    statusText: `Current rank ${rank}/${item.maxRank}`,
                    rank
                };
            }
            case 'system': {
                const owned = this.getSystemRank(playerData, item.systemId) > 0;
                return {
                    price: owned ? 0 : item.price,
                    canPurchase: !owned && playerData.money >= item.price,
                    actionLabel: owned ? 'Installed' : 'Install',
                    statusText: owned ? 'Already installed' : 'Not installed'
                };
            }
            case 'secondary': {
                const owned = playerData.ownedSecondaryWeapons.includes(item.weaponId);
                const equipped = playerData.equippedSecondaryWeapon === item.weaponId;
                if (equipped) {
                    return {
                        price: 0,
                        canPurchase: false,
                        actionLabel: 'Equipped',
                        statusText: 'Currently equipped'
                    };
                }
                if (owned) {
                    return {
                        price: 0,
                        canPurchase: true,
                        actionLabel: 'Equip',
                        statusText: 'Owned but not equipped'
                    };
                }
                return {
                    price: item.price,
                    canPurchase: playerData.money >= item.price,
                    actionLabel: 'Purchase',
                    statusText: 'Not owned'
                };
            }
            case 'consumable':
                return {
                    price: item.price,
                    canPurchase: playerData.money >= item.price,
                    actionLabel: 'Stock',
                    statusText: `Current megabombs: ${playerData.megabombs}`
                };
            default:
                return { price: item.price || 0, canPurchase: false, actionLabel: 'N/A', statusText: '' };
        }
    }

    applyPurchase(item) {
        const playerData = this.getWorkingPlayerData();
        const state = this.getItemState(item, playerData);
        if (!state.canPurchase) {
            if (item.purchaseMode === 'secondary' && state.actionLabel === 'Equip') {
                playerData.equippedSecondaryWeapon = item.weaponId;
                this.game.setPlayerData(playerData);
                this.game.saveManager.saveGame();
                this.setupShopScreen();
            }
            return;
        }

        switch (item.purchaseMode) {
            case 'service':
                playerData.money -= state.price;
                playerData.health = Math.min(playerData.maxHealth, playerData.health + state.repairAmount);
                break;
            case 'rank':
                playerData.money -= state.price;
                playerData.ownedSystems[item.systemId] = (playerData.ownedSystems[item.systemId] || 0) + 1;
                if (item.systemId === 'armorPlating') {
                    playerData.maxHealth += 15;
                    playerData.health = Math.min(playerData.maxHealth, playerData.health + 15);
                }
                if (item.systemId === 'shieldCells') {
                    playerData.maxShield += 25;
                    playerData.shield = Math.min(playerData.maxShield, playerData.shield + 25);
                }
                break;
            case 'system':
                playerData.money -= state.price;
                playerData.ownedSystems[item.systemId] = 1;
                if (item.systemId === 'reactiveShieldEmitter' && playerData.maxShield > 0) {
                    playerData.shield = playerData.maxShield;
                }
                break;
            case 'secondary':
                if (!playerData.ownedSecondaryWeapons.includes(item.weaponId)) {
                    playerData.money -= state.price;
                    playerData.ownedSecondaryWeapons = [...playerData.ownedSecondaryWeapons, item.weaponId];
                    playerData.unlockedWeapons = [...playerData.ownedSecondaryWeapons];
                }
                playerData.equippedSecondaryWeapon = item.weaponId;
                break;
            case 'consumable':
                playerData.money -= state.price;
                if (item.consumableType === 'megabomb') {
                    playerData.megabombs += item.amount;
                }
                break;
            default:
                return;
        }

        this.game.setPlayerData(playerData);
        this.game.saveManager.saveGame();
        this.setupShopScreen();
    }

    update() {
        const visibleItems = this.getVisibleItems();

        if (this.game.input.wasKeyJustPressed('ArrowLeft') || this.game.input.wasKeyJustPressed('a')) {
            this.selectedCategoryIndex = (this.selectedCategoryIndex - 1 + this.categories.length) % this.categories.length;
            this.selectedItemIndex = 0;
            this.setupShopScreen();
        }
        if (this.game.input.wasKeyJustPressed('ArrowRight') || this.game.input.wasKeyJustPressed('d')) {
            this.selectedCategoryIndex = (this.selectedCategoryIndex + 1) % this.categories.length;
            this.selectedItemIndex = 0;
            this.setupShopScreen();
        }
        if (this.game.input.wasKeyJustPressed('ArrowUp') || this.game.input.wasKeyJustPressed('w')) {
            this.selectedItemIndex = (this.selectedItemIndex - 1 + visibleItems.length) % Math.max(visibleItems.length, 1);
            this.setupShopScreen();
        }
        if (this.game.input.wasKeyJustPressed('ArrowDown') || this.game.input.wasKeyJustPressed('s')) {
            this.selectedItemIndex = (this.selectedItemIndex + 1) % Math.max(visibleItems.length, 1);
            this.setupShopScreen();
        }
        if ((this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) && visibleItems[this.selectedItemIndex]) {
            this.applyPurchase(visibleItems[this.selectedItemIndex]);
        }
        if (this.game.input.wasKeyJustPressed('Escape')) {
            this.exitShop();
        }
    }

    render() {}

    exitShop() {
        this.game.changeState('hangar');
    }

    buildInstalledSystemsMarkup(playerData) {
        const lines = [];
        if (playerData.ownedSystems.bossHealthIndicator) lines.push('Boss Health Indicator');
        if (playerData.ownedSystems.targetingHud) lines.push('Targeting HUD');
        if (playerData.ownedSystems.threatComputer) lines.push('Threat Computer');
        if (playerData.ownedSystems.reactiveShieldEmitter) lines.push('Reactive Shield Emitter');
        if (playerData.ownedSystems.damageControlKit) lines.push('Damage Control Kit');
        if (playerData.ownedSystems.armorPlating) lines.push(`Armor Plating Mk ${playerData.ownedSystems.armorPlating}`);
        if (playerData.ownedSystems.shieldCells) lines.push(`Shield Cells Mk ${playerData.ownedSystems.shieldCells}`);
        if (playerData.ownedSystems.salvageUplink) lines.push(`Salvage Uplink Mk ${playerData.ownedSystems.salvageUplink}`);
        if (playerData.ownedSystems.missileLoader) lines.push(`Missile Loader Mk ${playerData.ownedSystems.missileLoader}`);
        return lines.length ? lines.join('<br>') : 'No systems installed';
    }

    setupShopScreen() {
        let shopScreen = document.getElementById('shop-screen');
        if (!shopScreen) {
            shopScreen = document.createElement('div');
            shopScreen.id = 'shop-screen';
            document.body.appendChild(shopScreen);
        }
        shopScreen.style.display = 'flex';
        shopScreen.innerHTML = '';

        const playerData = this.getWorkingPlayerData();
        const visibleItems = this.getVisibleItems();
        if (this.selectedItemIndex >= visibleItems.length) {
            this.selectedItemIndex = 0;
        }
        const selectedItem = visibleItems[this.selectedItemIndex] || visibleItems[0];
        const selectedState = selectedItem ? this.getItemState(selectedItem, playerData) : null;
        const shopBackground = this.game.assets.getImage('shopBackground');
        const ship = this.game.getPlayerShipProfile(playerData.shipId);

        const mainContainer = document.createElement('div');
        mainContainer.style.display = 'flex';
        mainContainer.style.flexDirection = 'column';
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
            bgImg.style.inset = '0';
            bgImg.style.zIndex = '1';
            mainContainer.appendChild(bgImg);
        } else {
            mainContainer.style.backgroundColor = '#0a1128';
        }

        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.56), rgba(0,0,0,0.74))';
        overlay.style.zIndex = '2';
        mainContainer.appendChild(overlay);

        const header = document.createElement('div');
        header.style.position = 'absolute';
        header.style.top = '18px';
        header.style.left = '50%';
        header.style.transform = 'translateX(-50%)';
        header.style.zIndex = '3';
        header.style.textAlign = 'center';
        header.innerHTML = `
            <div style="font-size: 40px; color: #ffcc00; letter-spacing: 0.08em;">HAROLD'S EMPORIUM</div>
            <div style="font-size: 16px; color: #dce5ee; margin-top: 8px;">Cash: $${playerData.money} | ${ship.displayName} | ${this.game.getDifficultyProfile(playerData.difficulty).displayName}</div>
        `;
        mainContainer.appendChild(header);

        const layout = document.createElement('div');
        layout.style.position = 'relative';
        layout.style.zIndex = '3';
        layout.style.display = 'grid';
        layout.style.gridTemplateColumns = '220px 1fr 360px';
        layout.style.gap = '18px';
        layout.style.width = '92%';
        layout.style.margin = '120px auto 34px';
        layout.style.alignItems = 'start';

        const categoryPanel = document.createElement('div');
        categoryPanel.style.background = 'rgba(8, 12, 18, 0.84)';
        categoryPanel.style.border = '1px solid rgba(255, 204, 0, 0.28)';
        categoryPanel.style.borderRadius = '10px';
        categoryPanel.style.padding = '14px';
        categoryPanel.innerHTML = '<div style="font-size: 18px; color: #ffcc00; margin-bottom: 12px;">Categories</div>';
        this.categories.forEach((category, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = category.label;
            button.style.width = '100%';
            button.style.marginBottom = '10px';
            button.style.padding = '12px';
            button.style.borderRadius = '8px';
            button.style.cursor = 'pointer';
            button.style.border = index === this.selectedCategoryIndex ? '2px solid #ffcc00' : '1px solid rgba(255,255,255,0.18)';
            button.style.background = index === this.selectedCategoryIndex ? 'rgba(36, 25, 9, 0.92)' : 'rgba(13, 17, 24, 0.92)';
            button.style.color = index === this.selectedCategoryIndex ? '#ffcc00' : '#ffffff';
            button.addEventListener('click', () => {
                this.selectedCategoryIndex = index;
                this.selectedItemIndex = 0;
                this.setupShopScreen();
            });
            categoryPanel.appendChild(button);
        });
        layout.appendChild(categoryPanel);

        const itemPanel = document.createElement('div');
        itemPanel.style.background = 'rgba(8, 12, 18, 0.84)';
        itemPanel.style.border = '1px solid rgba(255, 204, 0, 0.28)';
        itemPanel.style.borderRadius = '10px';
        itemPanel.style.padding = '14px';
        itemPanel.innerHTML = `<div style="font-size: 18px; color: #ffcc00; margin-bottom: 12px;">${this.categories[this.selectedCategoryIndex].label}</div>`;

        visibleItems.forEach((item, index) => {
            const state = this.getItemState(item, playerData);
            const row = document.createElement('button');
            row.type = 'button';
            row.style.width = '100%';
            row.style.display = 'grid';
            row.style.gridTemplateColumns = '1fr auto';
            row.style.gap = '12px';
            row.style.alignItems = 'center';
            row.style.textAlign = 'left';
            row.style.marginBottom = '10px';
            row.style.padding = '14px 16px';
            row.style.borderRadius = '8px';
            row.style.cursor = 'pointer';
            row.style.background = index === this.selectedItemIndex ? 'rgba(36, 25, 9, 0.92)' : 'rgba(13, 17, 24, 0.9)';
            row.style.border = index === this.selectedItemIndex ? '2px solid #ffcc00' : '1px solid rgba(255,255,255,0.14)';
            row.style.color = '#ffffff';
            row.innerHTML = `
                <div>
                    <div style="font-size: 18px; color: ${index === this.selectedItemIndex ? '#ffcc00' : '#ffffff'}; margin-bottom: 4px;">${item.name}</div>
                    <div style="font-size: 13px; color: #96a8bb;">${state.statusText}</div>
                </div>
                <div style="font-size: 16px; color: ${state.price > 0 ? (state.canPurchase ? '#dce5ee' : '#7D8491') : '#9fd7ff'};">${state.price > 0 ? `$${state.price}` : state.actionLabel}</div>
            `;
            row.addEventListener('click', () => {
                if (this.selectedItemIndex === index) {
                    this.applyPurchase(item);
                    return;
                }
                this.selectedItemIndex = index;
                this.setupShopScreen();
            });
            itemPanel.appendChild(row);
        });
        layout.appendChild(itemPanel);

        const detailPanel = document.createElement('div');
        detailPanel.style.background = 'rgba(8, 12, 18, 0.88)';
        detailPanel.style.border = '1px solid rgba(255, 204, 0, 0.28)';
        detailPanel.style.borderRadius = '10px';
        detailPanel.style.padding = '16px';
        detailPanel.innerHTML = selectedItem ? `
            <div style="font-size: 18px; color: #ffcc00; margin-bottom: 8px;">Selected Contract Item</div>
            <div style="font-size: 24px; color: white; margin-bottom: 8px;">${selectedItem.name}</div>
            <div style="font-size: 15px; color: #d8e2ec; line-height: 1.7; margin-bottom: 12px;">${selectedItem.description}</div>
            <div style="font-size: 14px; color: #9fd7ff; margin-bottom: 18px;">${selectedState?.statusText || ''}</div>
            <div style="display: inline-flex; padding: 10px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.16); background: rgba(0,0,0,0.35); color: ${selectedState?.canPurchase ? '#ffcc00' : '#d7d7d7'}; margin-bottom: 20px;">
                ${selectedState?.actionLabel || ''}${selectedState?.price > 0 ? ` - $${selectedState.price}` : ''}
            </div>
            <div style="font-size: 18px; color: #ffcc00; margin-bottom: 8px;">Current Loadout</div>
            <div style="font-size: 14px; color: #dce5ee; line-height: 1.8; margin-bottom: 16px;">
                Hull: ${playerData.health}/${playerData.maxHealth}<br>
                Shield: ${playerData.shield}/${playerData.maxShield}<br>
                Equipped Secondary: ${playerData.equippedSecondaryWeapon || 'None'}<br>
                Megabombs: ${playerData.megabombs}
            </div>
            <div style="font-size: 18px; color: #ffcc00; margin-bottom: 8px;">Installed Systems</div>
            <div style="font-size: 14px; color: #dce5ee; line-height: 1.7;">${this.buildInstalledSystemsMarkup(playerData)}</div>
        ` : '<div style="color:white;">No items available</div>';
        layout.appendChild(detailPanel);
        mainContainer.appendChild(layout);

        const footer = document.createElement('div');
        footer.style.position = 'absolute';
        footer.style.left = '24px';
        footer.style.right = '24px';
        footer.style.bottom = '18px';
        footer.style.zIndex = '3';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.style.alignItems = 'center';

        const backButton = document.createElement('button');
        backButton.type = 'button';
        backButton.textContent = 'Back to Hangar';
        backButton.style.padding = '12px 18px';
        backButton.style.borderRadius = '8px';
        backButton.style.border = '1px solid rgba(255,255,255,0.18)';
        backButton.style.background = 'rgba(8, 12, 18, 0.88)';
        backButton.style.color = '#ffffff';
        backButton.style.cursor = 'pointer';
        backButton.addEventListener('click', () => this.exitShop());
        footer.appendChild(backButton);

        const hint = document.createElement('div');
        hint.style.color = '#aab7c4';
        hint.style.fontSize = '14px';
        hint.textContent = 'Left/Right: category | Up/Down: item | Enter: purchase/equip | Esc: hangar';
        footer.appendChild(hint);
        mainContainer.appendChild(footer);

        shopScreen.appendChild(mainContainer);
    }
}

export default ShopState;

