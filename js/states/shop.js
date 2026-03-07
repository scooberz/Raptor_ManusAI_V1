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
                    return { price: 0, canPurchase: false, actionLabel: 'Max', statusText: `Installed rank ${rank}/${item.maxRank}`, rank };
                }
                const price = item.basePrice + (rank * item.priceStep);
                return { price, canPurchase: playerData.money >= price, actionLabel: `Buy Mk ${rank + 1}`, statusText: `Current rank ${rank}/${item.maxRank}`, rank };
            }
            case 'system': {
                const owned = this.getSystemRank(playerData, item.systemId) > 0;
                return { price: owned ? 0 : item.price, canPurchase: !owned && playerData.money >= item.price, actionLabel: owned ? 'Installed' : 'Install', statusText: owned ? 'Already installed' : 'Not installed' };
            }
            case 'secondary': {
                const owned = playerData.ownedSecondaryWeapons.includes(item.weaponId);
                const equipped = playerData.equippedSecondaryWeapon === item.weaponId;
                if (equipped) return { price: 0, canPurchase: false, actionLabel: 'Equipped', statusText: 'Currently equipped' };
                if (owned) return { price: 0, canPurchase: true, actionLabel: 'Equip', statusText: 'Owned but not equipped' };
                return { price: item.price, canPurchase: playerData.money >= item.price, actionLabel: 'Purchase', statusText: 'Not owned' };
            }
            case 'consumable':
                return { price: item.price, canPurchase: playerData.money >= item.price, actionLabel: 'Stock', statusText: `Current megabombs: ${playerData.megabombs}` };
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
                this.game.audio.playSound('uiConfirm');
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
        this.game.audio.playSound(item.purchaseMode === 'service' ? 'repair' : item.purchaseMode === 'consumable' ? 'uiConfirm' : 'purchase');
        this.setupShopScreen();
    }

    update() {
        const visibleItems = this.getVisibleItems();

        if (this.game.input.wasKeyJustPressed('ArrowLeft') || this.game.input.wasKeyJustPressed('a')) {
            this.selectedCategoryIndex = (this.selectedCategoryIndex - 1 + this.categories.length) % this.categories.length;
            this.selectedItemIndex = 0;
            this.game.audio.playSound('uiMove');
            this.setupShopScreen();
        }
        if (this.game.input.wasKeyJustPressed('ArrowRight') || this.game.input.wasKeyJustPressed('d')) {
            this.selectedCategoryIndex = (this.selectedCategoryIndex + 1) % this.categories.length;
            this.selectedItemIndex = 0;
            this.game.audio.playSound('uiMove');
            this.setupShopScreen();
        }
        if (this.game.input.wasKeyJustPressed('ArrowUp') || this.game.input.wasKeyJustPressed('w')) {
            this.selectedItemIndex = (this.selectedItemIndex - 1 + visibleItems.length) % Math.max(visibleItems.length, 1);
            this.game.audio.playSound('uiMove');
            this.setupShopScreen();
        }
        if (this.game.input.wasKeyJustPressed('ArrowDown') || this.game.input.wasKeyJustPressed('s')) {
            this.selectedItemIndex = (this.selectedItemIndex + 1) % Math.max(visibleItems.length, 1);
            this.game.audio.playSound('uiMove');
            this.setupShopScreen();
        }
        if ((this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) && visibleItems[this.selectedItemIndex]) {
            this.applyPurchase(visibleItems[this.selectedItemIndex]);
        }
        if (this.game.input.wasKeyJustPressed('Escape')) {
            this.game.audio.playSound('uiBack');
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

    buildItemButton(item, state, index) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `dos-list-button${index === this.selectedItemIndex ? ' selected' : ''}`;
        button.innerHTML = `
            <span class="title">${item.name}</span>
            <span class="meta">${state.statusText} ${state.price > 0 ? `// $${state.price}` : `// ${state.actionLabel}`}</span>
        `;
        button.addEventListener('click', () => {
            if (this.selectedItemIndex === index) {
                this.applyPurchase(item);
                return;
            }
            this.selectedItemIndex = index;
            this.game.audio.playSound('uiMove');
            this.setupShopScreen();
        });
        return button;
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

        const shell = document.createElement('div');
        shell.className = 'dos-shell';
        if (shopBackground) {
            const bgImg = document.createElement('img');
            bgImg.className = 'dos-bg-image';
            bgImg.src = shopBackground.src;
            bgImg.style.filter = 'brightness(0.34) saturate(0.8)';
            shell.appendChild(bgImg);
        }
        const overlay = document.createElement('div');
        overlay.className = 'dos-overlay';
        shell.appendChild(overlay);

        const layout = document.createElement('div');
        layout.className = 'dos-screen-layout';
        layout.style.paddingTop = '20px';
        layout.style.paddingBottom = '18px';

        const header = document.createElement('div');
        header.className = 'dos-frame compact alt';
        header.style.padding = '16px 18px';
        header.style.marginBottom = '16px';
        header.innerHTML = `
            <div class="dos-kicker">Harold's Emporium // Base Supply</div>
            <div class="dos-title" style="font-size:34px; margin:8px 0 6px;">Harold's Emporium</div>
            <div class="dos-subtitle">Cash $${playerData.money} // ${ship.displayName} // ${this.game.getDifficultyProfile(playerData.difficulty).displayName}</div>
        `;
        layout.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'dos-sidebar-layout';

        const categoryPanel = document.createElement('div');
        categoryPanel.className = 'dos-frame compact';
        categoryPanel.style.padding = '14px';
        categoryPanel.innerHTML = '<div class="dos-kicker">Categories</div>';
        const categoryList = document.createElement('div');
        categoryList.className = 'dos-terminal-list';
        categoryList.style.marginTop = '12px';
        this.categories.forEach((category, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `dos-button${index === this.selectedCategoryIndex ? ' selected' : ''}`;
            button.textContent = category.label;
            button.addEventListener('click', () => {
                this.selectedCategoryIndex = index;
                this.selectedItemIndex = 0;
                this.game.audio.playSound('uiMove');
                this.setupShopScreen();
            });
            categoryList.appendChild(button);
        });
        categoryPanel.appendChild(categoryList);
        grid.appendChild(categoryPanel);

        const itemPanel = document.createElement('div');
        itemPanel.className = 'dos-frame compact';
        itemPanel.style.padding = '14px';
        itemPanel.innerHTML = `<div class="dos-kicker">${this.categories[this.selectedCategoryIndex].label}</div>`;
        const itemList = document.createElement('div');
        itemList.className = 'dos-terminal-list';
        itemList.style.marginTop = '12px';
        visibleItems.forEach((item, index) => itemList.appendChild(this.buildItemButton(item, this.getItemState(item, playerData), index)));
        itemPanel.appendChild(itemList);
        grid.appendChild(itemPanel);

        const detailPanel = document.createElement('div');
        detailPanel.className = 'dos-frame compact';
        detailPanel.style.padding = '16px';
        detailPanel.innerHTML = selectedItem ? `
            <div class="dos-kicker">Selected Contract Item</div>
            <div class="dos-title" style="font-size:26px; margin:8px 0 10px;">${selectedItem.name}</div>
            <div class="dos-copy">${selectedItem.description}</div>
            <div style="margin:14px 0 16px;"><span class="dos-chip">${selectedState?.actionLabel || ''}${selectedState?.price > 0 ? ` // $${selectedState.price}` : ''}</span></div>
            <div class="dos-panel section" style="margin-bottom:12px;">
                <div class="dos-label">Current Loadout</div>
                <div class="dos-copy" style="margin-top:10px; line-height:1.8;">
                    Hull ${playerData.health}/${playerData.maxHealth}<br>
                    Shield ${playerData.shield}/${playerData.maxShield}<br>
                    Secondary ${playerData.equippedSecondaryWeapon || 'None'}<br>
                    Megabombs ${playerData.megabombs}
                </div>
            </div>
            <div class="dos-panel section">
                <div class="dos-label">Installed Systems</div>
                <div class="dos-copy" style="margin-top:10px; line-height:1.8;">${this.buildInstalledSystemsMarkup(playerData)}</div>
            </div>
        ` : '<div class="dos-copy">No items available.</div>';
        grid.appendChild(detailPanel);

        layout.appendChild(grid);

        const footer = document.createElement('div');
        footer.style.marginTop = '16px';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.style.alignItems = 'center';
        footer.style.gap = '12px';

        const backButton = document.createElement('button');
        backButton.type = 'button';
        backButton.className = 'dos-action-button';
        backButton.textContent = 'Back to Hangar';
        backButton.addEventListener('click', () => {
            this.game.audio.playSound('uiBack');
            this.exitShop();
        });
        footer.appendChild(backButton);

        const hint = document.createElement('div');
        hint.className = 'dos-footer-hint';
        hint.textContent = 'Left/Right category // Up/Down item // Enter purchase/equip // Esc hangar';
        footer.appendChild(hint);
        layout.appendChild(footer);

        shell.appendChild(layout);
        shopScreen.appendChild(shell);
    }
}

export default ShopState;
