/**
 * EditorState class - Raptor Forge Visual Level Editor
 * Mario Maker-inspired visual level editor for Raptor
 */
import { BackgroundManager } from '../environment/BackgroundManager.js';
import { EnemyFactory } from '../entities/enemyFactory.js';
import { environmentData } from '../../assets/data/environmentData.js';

class EditorState {
    constructor(game) {
        this.game = game;
        this.name = 'editor';
        
        // Core editor components
        this.backgroundManager = null;
        this.enemyFactory = null;
        
        // Editor state
        this.currentWave = {
            enemies: [],
            environment: []
        };
        this.selectedTool = null;
        this.selectedEntity = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // UI elements
        this.canvas = null;
        this.canvasContext = null;
        this.gridSize = 32;
        this.zoom = 1.0;
        this.cameraY = 0;
        
        // Available entity types
        this.enemyTypes = [
            'fighter', 'turret', 'bomber', 'striker', 'cyclone', 
            'gnat', 'reaper', 'dart', 'goliath', 'cutter', 'mine', 'boss1'
        ];
        this.environmentTypes = Object.keys(environmentData);
        
        // UI state
        this.showProperties = true;
        this.showPalette = true;
    }
    
    /**
     * Enter the editor state
     */
    async enter() {
        console.log('Entering Editor State - Raptor Forge');
        
        try {
            // Hide all other screens
            this.hideAllScreens();
            
            // Initialize editor components
            await this.initializeEditor();
            
            // Setup UI
            this.setupEditorUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Editor State initialized successfully');
        } catch (error) {
            console.error('Error entering Editor State:', error);
        }
    }
    
    /**
     * Exit the editor state
     */
    exit() {
        console.log('Exiting Editor State');
        
        // Clean up event listeners
        this.removeEventListeners();
        
        // Hide editor UI
        this.hideEditorUI();
    }
    
    /**
     * Initialize core editor components
     */
    async initializeEditor() {
        // Initialize background manager for scrolling preview
        this.backgroundManager = new BackgroundManager(this.game);
        
        // Initialize enemy factory for entity creation
        this.enemyFactory = new EnemyFactory(this.game);
        
        // Get canvas reference
        this.canvas = document.getElementById('background-layer');
        this.canvasContext = this.canvas.getContext('2d');
        
        console.log('Editor components initialized');
    }
    
    /**
     * Setup the editor UI layout
     */
    setupEditorUI() {
        // Create main editor container
        const editorContainer = document.createElement('div');
        editorContainer.id = 'editor-container';
        editorContainer.className = 'editor-container';
        
        // Create three-panel layout
        editorContainer.innerHTML = `
            <div class="editor-layout">
                <!-- Top Action Bar -->
                <div class="editor-action-bar">
                    <div class="action-bar-left">
                        <div class="editor-logo">Raptor Forge</div>
                        <input type="text" class="level-name-input" placeholder="Untitled Level" />
                    </div>
                    <div class="action-bar-center">
                        <button class="btn-primary" id="test-wave-btn">
                            <span class="btn-icon">▶</span>
                            Test Wave
                        </button>
                        <button class="btn-secondary" id="save-level-btn">
                            <span class="btn-icon">💾</span>
                            Save
                        </button>
                        <button class="btn-secondary" id="export-json-btn">
                            <span class="btn-icon">📄</span>
                            Export JSON
                        </button>
                    </div>
                    <div class="action-bar-right">
                        <button class="btn-icon-only" id="settings-btn">⚙️</button>
                        <button class="btn-icon-only" id="help-btn">❓</button>
                        <button class="btn-icon-only" id="back-to-menu-btn">✕</button>
                    </div>
                </div>
                
                <!-- Main Content Area -->
                <div class="editor-content">
                    <!-- Left Sidebar - Entity Palette -->
                    <div class="editor-sidebar-left" id="entity-palette">
                        <div class="palette-header">
                            <h3>Entity Palette</h3>
                            <button class="palette-toggle" id="palette-toggle">◀</button>
                        </div>
                        <div class="palette-content">
                            <div class="palette-section">
                                <h4>Enemies</h4>
                                <div class="palette-grid" id="enemy-palette">
                                    <!-- Enemy tools will be populated here -->
                                </div>
                            </div>
                            <div class="palette-section">
                                <h4>Environment</h4>
                                <div class="palette-grid" id="environment-palette">
                                    <!-- Environment tools will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Center Canvas Area -->
                    <div class="editor-canvas-area">
                        <div class="canvas-controls">
                            <div class="zoom-controls">
                                <button id="zoom-out-btn">−</button>
                                <span id="zoom-level">100%</span>
                                <button id="zoom-in-btn">+</button>
                            </div>
                            <div class="grid-controls">
                                <label>
                                    <input type="checkbox" id="show-grid" checked> Grid
                                </label>
                            </div>
                        </div>
                        <div class="canvas-wrapper" id="canvas-wrapper">
                            <!-- Game canvas will be positioned here -->
                        </div>
                    </div>
                    
                    <!-- Right Sidebar - Properties Inspector -->
                    <div class="editor-sidebar-right" id="properties-panel">
                        <div class="properties-header">
                            <h3>Properties</h3>
                            <button class="properties-toggle" id="properties-toggle">▶</button>
                        </div>
                        <div class="properties-content">
                            <div class="property-section" id="entity-properties">
                                <p class="no-selection">Select an entity to edit properties</p>
                            </div>
                            <div class="property-section">
                                <h4>Wave Settings</h4>
                                <div class="property-group">
                                    <label>Wave Delay (ms):</label>
                                    <input type="number" id="wave-delay" value="0" min="0" step="100">
                                </div>
                            </div>
                            <div class="property-section">
                                <h4>JSON Output</h4>
                                <textarea id="json-output" readonly></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(editorContainer);
        
        // Position game canvas in editor
        this.positionGameCanvas();
        
        // Populate entity palettes
        this.populateEntityPalettes();
        
        // Update JSON output
        this.updateJSONOutput();
        
        console.log('Editor UI setup complete');
    }
    
    /**
     * Position the game canvas within the editor layout
     */
    positionGameCanvas() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const gameContainer = document.getElementById('game-container');
        
        if (canvasWrapper && gameContainer) {
            // Move game container into canvas wrapper
            canvasWrapper.appendChild(gameContainer);
            
            // Ensure canvas layers are properly sized
            const canvasLayers = gameContainer.querySelectorAll('.game-layer');
            canvasLayers.forEach(canvas => {
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
            });
        }
    }
    
    /**
     * Populate the entity palettes with available tools
     */
    populateEntityPalettes() {
        this.populateEnemyPalette();
        this.populateEnvironmentPalette();
    }
    
    /**
     * Populate the enemy palette
     */
    populateEnemyPalette() {
        const enemyPalette = document.getElementById('enemy-palette');
        if (!enemyPalette) return;
        
        enemyPalette.innerHTML = '';
        
        // Map enemy types to their sprite assets
        const enemySpriteMap = {
            'fighter': 'enemyFighter',
            'turret': 'enemyTurret', 
            'bomber': 'enemyBomber',
            'striker': 'enemyStriker',
            'cyclone': 'enemyCyclone',
            'gnat': 'enemyGnat',
            'reaper': 'enemyReaper',
            'dart': 'enemyDart',
            'goliath': 'enemyGoliath',
            'cutter': 'enemyCutter',
            'mine': 'enemyMine',
            'boss1': 'bossLevel1'
        };
        
        this.enemyTypes.forEach(enemyType => {
            const toolElement = document.createElement('div');
            toolElement.className = 'palette-tool';
            toolElement.dataset.entityType = 'enemy';
            toolElement.dataset.entitySubtype = enemyType;
            
            // Create tool icon using actual sprite
            const icon = document.createElement('div');
            icon.className = 'tool-icon sprite-icon';
            
            const spriteAsset = enemySpriteMap[enemyType];
            if (spriteAsset && this.game.assets.getImage(spriteAsset)) {
                const img = document.createElement('img');
                img.src = this.game.assets.getImage(spriteAsset).src;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.imageRendering = 'pixelated'; // Preserve pixel art
                icon.appendChild(img);
            } else {
                // Fallback to letter if sprite not available
                icon.textContent = enemyType.charAt(0).toUpperCase();
                icon.style.background = 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)';
            }
            
            const label = document.createElement('div');
            label.className = 'tool-label';
            label.textContent = enemyType;
            
            toolElement.appendChild(icon);
            toolElement.appendChild(label);
            
            // Add click handler
            toolElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Selecting enemy tool: ${enemyType}`);
                this.selectTool(enemyType, 'enemy');
            });
            
            enemyPalette.appendChild(toolElement);
        });
    }
    
    /**
     * Populate the environment palette
     */
    populateEnvironmentPalette() {
        const environmentPalette = document.getElementById('environment-palette');
        if (!environmentPalette) return;
        
        environmentPalette.innerHTML = '';
        
        // Map environment types to their sprite assets
        const envSpriteMap = {
            'FUEL_TANK': 'fuelTank',
            'RADAR_DISH': 'radarDish',
            'BUNKER': 'bunker'
        };
        
        this.environmentTypes.forEach(envType => {
            const toolElement = document.createElement('div');
            toolElement.className = 'palette-tool';
            toolElement.dataset.entityType = 'environment';
            toolElement.dataset.entitySubtype = envType;
            
            // Create tool icon using actual sprite
            const icon = document.createElement('div');
            icon.className = 'tool-icon sprite-icon';
            
            const spriteAsset = envSpriteMap[envType];
            if (spriteAsset && this.game.assets.getImage(spriteAsset)) {
                const img = document.createElement('img');
                img.src = this.game.assets.getImage(spriteAsset).src;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.imageRendering = 'pixelated'; // Preserve pixel art
                icon.appendChild(img);
            } else {
                // Fallback to letter if sprite not available
                icon.textContent = envType.charAt(0);
                icon.style.background = 'linear-gradient(135deg, #00d4ff 0%, #4ecdc4 100%)';
            }
            
            const label = document.createElement('div');
            label.className = 'tool-label';
            label.textContent = envType.replace('_', ' ');
            
            toolElement.appendChild(icon);
            toolElement.appendChild(label);
            
            // Add click handler
            toolElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Selecting environment tool: ${envType}`);
                this.selectTool(envType, 'environment');
            });
            
            environmentPalette.appendChild(toolElement);
        });
    }
    
    /**
     * Select a tool from the palette
     */
    selectTool(toolType, category) {
        // Clear previous selection
        document.querySelectorAll('.palette-tool.selected').forEach(tool => {
            tool.classList.remove('selected');
        });
        
        // Select new tool
        const toolElement = document.querySelector(`[data-entity-subtype="${toolType}"]`);
        if (toolElement) {
            toolElement.classList.add('selected');
        }
        
        this.selectedTool = { type: toolType, category: category };
        console.log('Selected tool:', this.selectedTool);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Canvas events for placement and selection
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
            this.canvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
        }
        
        // Button events
        const testWaveBtn = document.getElementById('test-wave-btn');
        if (testWaveBtn) {
            testWaveBtn.addEventListener('click', () => this.testWave());
        }
        
        const backToMenuBtn = document.getElementById('back-to-menu-btn');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => this.backToMenu());
        }
        
        const saveBtn = document.getElementById('save-level-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveLevel());
        }
        
        const exportBtn = document.getElementById('export-json-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportJSON());
        }
        
        // Zoom controls
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());
        
        console.log('Event listeners setup complete');
    }
    
    /**
     * Remove event listeners
     */
    removeEventListeners() {
        // Canvas events will be removed when canvas is repositioned
        // Button events will be removed when UI is destroyed
    }
    
    /**
     * Handle canvas click for entity placement and selection
     */
    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.zoom;
        const y = (event.clientY - rect.top) / this.zoom + this.cameraY;
        
        // Snap to grid
        const gridX = Math.floor(x / this.gridSize) * this.gridSize;
        const gridY = Math.floor(y / this.gridSize) * this.gridSize;
        
        if (this.selectedTool) {
            // Place new entity
            this.placeEntity(gridX, gridY);
        } else {
            // Select existing entity
            this.selectEntityAt(gridX, gridY);
        }
        
        console.log(`Canvas clicked at (${gridX}, ${gridY}), tool: ${this.selectedTool ? this.selectedTool.type : 'none'}`);
    }
    
    /**
     * Handle canvas mouse down for dragging
     */
    handleCanvasMouseDown(event) {
        // Implementation for drag start
    }
    
    /**
     * Handle canvas mouse move for dragging
     */
    handleCanvasMouseMove(event) {
        // Implementation for drag move
    }
    
    /**
     * Handle canvas mouse up for drag end
     */
    handleCanvasMouseUp(event) {
        // Implementation for drag end
    }
    
    /**
     * Place an entity at the specified coordinates
     */
    placeEntity(x, y) {
        if (!this.selectedTool) return;
        
        const entityData = {
            type: this.selectedTool.type,
            spawn_x: x,
            spawn_y: y,
            overrides: {}
        };
        
        if (this.selectedTool.category === 'enemy') {
            this.currentWave.enemies.push(entityData);
        } else if (this.selectedTool.category === 'environment') {
            this.currentWave.environment.push(entityData);
        }
        
        console.log('Placed entity:', entityData);
        this.updateJSONOutput();
        this.renderCanvas();
    }
    
    /**
     * Select an entity at the specified coordinates
     */
    selectEntityAt(x, y) {
        // Find entity at coordinates
        const tolerance = this.gridSize / 2;
        
        // Check enemies
        for (let enemy of this.currentWave.enemies) {
            if (Math.abs(enemy.spawn_x - x) < tolerance && Math.abs(enemy.spawn_y - y) < tolerance) {
                this.selectEntity(enemy, 'enemy');
                return;
            }
        }
        
        // Check environment
        for (let env of this.currentWave.environment) {
            if (Math.abs(env.spawn_x - x) < tolerance && Math.abs(env.spawn_y - y) < tolerance) {
                this.selectEntity(env, 'environment');
                return;
            }
        }
        
        // No entity found, clear selection
        this.clearEntitySelection();
    }
    
    /**
     * Select an entity for property editing
     */
    selectEntity(entity, category) {
        this.selectedEntity = { entity, category };
        this.showEntityProperties(entity, category);
        this.renderCanvas(); // Re-render to show selection highlight
    }
    
    /**
     * Clear entity selection
     */
    clearEntitySelection() {
        this.selectedEntity = null;
        this.hideEntityProperties();
        this.renderCanvas();
    }
    
    /**
     * Show entity properties in the inspector
     */
    showEntityProperties(entity, category) {
        const propertiesPanel = document.getElementById('entity-properties');
        if (!propertiesPanel) return;
        
        propertiesPanel.innerHTML = `
            <h4>${category.charAt(0).toUpperCase() + category.slice(1)}: ${entity.type}</h4>
            <div class="property-group">
                <label>X Position:</label>
                <input type="number" id="prop-x" value="${entity.spawn_x}" step="${this.gridSize}">
            </div>
            <div class="property-group">
                <label>Y Position:</label>
                <input type="number" id="prop-y" value="${entity.spawn_y}" step="${this.gridSize}">
            </div>
            <div class="property-group">
                <label>Health Override:</label>
                <input type="number" id="prop-health" value="${entity.overrides.health || ''}" placeholder="Default">
            </div>
            <div class="property-group">
                <label>Speed Override:</label>
                <input type="number" id="prop-speed" value="${entity.overrides.speed || ''}" placeholder="Default" step="0.1">
            </div>
            <div class="property-actions">
                <button class="btn-danger" id="delete-entity-btn">Delete Entity</button>
            </div>
        `;
        
        // Add property change listeners
        this.setupPropertyListeners();
    }
    
    /**
     * Hide entity properties
     */
    hideEntityProperties() {
        const propertiesPanel = document.getElementById('entity-properties');
        if (propertiesPanel) {
            propertiesPanel.innerHTML = '<p class="no-selection">Select an entity to edit properties</p>';
        }
    }
    
    /**
     * Setup property change listeners
     */
    setupPropertyListeners() {
        const propX = document.getElementById('prop-x');
        const propY = document.getElementById('prop-y');
        const propHealth = document.getElementById('prop-health');
        const propSpeed = document.getElementById('prop-speed');
        const deleteBtn = document.getElementById('delete-entity-btn');
        
        if (propX) propX.addEventListener('change', () => this.updateEntityProperty('spawn_x', parseInt(propX.value)));
        if (propY) propY.addEventListener('change', () => this.updateEntityProperty('spawn_y', parseInt(propY.value)));
        if (propHealth) propHealth.addEventListener('change', () => this.updateEntityOverride('health', parseFloat(propHealth.value) || null));
        if (propSpeed) propSpeed.addEventListener('change', () => this.updateEntityOverride('speed', parseFloat(propSpeed.value) || null));
        if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteSelectedEntity());
    }
    
    /**
     * Update entity property
     */
    updateEntityProperty(property, value) {
        if (this.selectedEntity) {
            this.selectedEntity.entity[property] = value;
            this.updateJSONOutput();
            this.renderCanvas();
        }
    }
    
    /**
     * Update entity override
     */
    updateEntityOverride(property, value) {
        if (this.selectedEntity) {
            if (value === null || value === '') {
                delete this.selectedEntity.entity.overrides[property];
            } else {
                this.selectedEntity.entity.overrides[property] = value;
            }
            this.updateJSONOutput();
        }
    }
    
    /**
     * Delete the selected entity
     */
    deleteSelectedEntity() {
        if (!this.selectedEntity) return;
        
        const { entity, category } = this.selectedEntity;
        
        if (category === 'enemy') {
            const index = this.currentWave.enemies.indexOf(entity);
            if (index > -1) this.currentWave.enemies.splice(index, 1);
        } else if (category === 'environment') {
            const index = this.currentWave.environment.indexOf(entity);
            if (index > -1) this.currentWave.environment.splice(index, 1);
        }
        
        this.clearEntitySelection();
        this.updateJSONOutput();
    }
    
    /**
     * Update the JSON output display
     */
    updateJSONOutput() {
        const jsonOutput = document.getElementById('json-output');
        if (jsonOutput) {
            jsonOutput.value = JSON.stringify(this.currentWave, null, 2);
        }
    }
    
    /**
     * Render the canvas with placed entities
     */
    renderCanvas() {
        if (!this.canvasContext) return;
        
        // Clear canvas
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render background
        if (this.backgroundManager) {
            this.backgroundManager.render(this.canvasContext, this.cameraY);
        }
        
        // Render grid
        this.renderGrid();
        
        // Render placed entities
        this.renderPlacedEntities();
    }
    
    /**
     * Render grid overlay
     */
    renderGrid() {
        const showGrid = document.getElementById('show-grid');
        if (!showGrid || !showGrid.checked) return;
        
        this.canvasContext.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        this.canvasContext.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += this.gridSize * this.zoom) {
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(x, 0);
            this.canvasContext.lineTo(x, this.canvas.height);
            this.canvasContext.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += this.gridSize * this.zoom) {
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(0, y);
            this.canvasContext.lineTo(this.canvas.width, y);
            this.canvasContext.stroke();
        }
    }
    
    /**
     * Render placed entities
     */
    renderPlacedEntities() {
        // Render enemies
        this.currentWave.enemies.forEach(enemy => {
            this.renderEntityPlaceholder(enemy.spawn_x, enemy.spawn_y, enemy.type, 'enemy');
        });
        
        // Render environment
        this.currentWave.environment.forEach(env => {
            this.renderEntityPlaceholder(env.spawn_x, env.spawn_y, env.type, 'environment');
        });
    }
    
    /**
     * Render entity placeholder
     */
    renderEntityPlaceholder(x, y, type, category) {
        const screenX = x * this.zoom;
        const screenY = (y - this.cameraY) * this.zoom;
        
        // Skip if off-screen
        if (screenY < -this.gridSize || screenY > this.canvas.height + this.gridSize) return;
        
        const size = this.gridSize * this.zoom;
        
        // Try to render actual sprite if available
        let spriteRendered = false;
        
        if (category === 'enemy') {
            const spriteMap = {
                'fighter': 'enemyFighter',
                'turret': 'enemyTurret', 
                'bomber': 'enemyBomber',
                'striker': 'enemyStriker',
                'cyclone': 'enemyCyclone',
                'gnat': 'enemyGnat',
                'reaper': 'enemyReaper',
                'dart': 'enemyDart',
                'goliath': 'enemyGoliath',
                'cutter': 'enemyCutter',
                'mine': 'enemyMine',
                'boss1': 'bossLevel1'
            };
            
            const spriteAsset = spriteMap[type];
            if (spriteAsset && this.game.assets.getImage(spriteAsset)) {
                const sprite = this.game.assets.getImage(spriteAsset);
                this.canvasContext.drawImage(sprite, screenX, screenY, size, size);
                spriteRendered = true;
            }
        } else if (category === 'environment') {
            const spriteMap = {
                'FUEL_TANK': 'fuelTank',
                'RADAR_DISH': 'radarDish',
                'BUNKER': 'bunker'
            };
            
            const spriteAsset = spriteMap[type];
            if (spriteAsset && this.game.assets.getImage(spriteAsset)) {
                const sprite = this.game.assets.getImage(spriteAsset);
                this.canvasContext.drawImage(sprite, screenX, screenY, size, size);
                spriteRendered = true;
            }
        }
        
        // Fallback to colored rectangle if sprite not available
        if (!spriteRendered) {
            this.canvasContext.fillStyle = category === 'enemy' ? 'rgba(255, 107, 53, 0.8)' : 'rgba(0, 212, 255, 0.8)';
            this.canvasContext.fillRect(screenX, screenY, size, size);
            
            // Draw type label
            this.canvasContext.fillStyle = '#ffffff';
            this.canvasContext.font = '10px Arial';
            this.canvasContext.textAlign = 'center';
            this.canvasContext.fillText(type.substring(0, 4), screenX + size / 2, screenY + size / 2);
        }
        
        // Draw border
        this.canvasContext.strokeStyle = category === 'enemy' ? '#ff6b35' : '#00d4ff';
        this.canvasContext.lineWidth = 2;
        this.canvasContext.strokeRect(screenX, screenY, size, size);
        
        // Highlight if selected
        if (this.selectedEntity && this.selectedEntity.entity.spawn_x === x && this.selectedEntity.entity.spawn_y === y) {
            this.canvasContext.strokeStyle = '#4ecdc4';
            this.canvasContext.lineWidth = 3;
            this.canvasContext.strokeRect(screenX - 2, screenY - 2, size + 4, size + 4);
        }
    }
    
    /**
     * Zoom in
     */
    zoomIn() {
        this.zoom = Math.min(this.zoom * 1.2, 3.0);
        this.updateZoomDisplay();
        this.renderCanvas();
    }
    
    /**
     * Zoom out
     */
    zoomOut() {
        this.zoom = Math.max(this.zoom / 1.2, 0.5);
        this.updateZoomDisplay();
        this.renderCanvas();
    }
    
    /**
     * Update zoom level display
     */
    updateZoomDisplay() {
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
        }
    }
    
    /**
     * Test the current wave
     */
    testWave() {
        console.log('Testing wave:', this.currentWave);
        // TODO: Implement transition to game state with current wave data
        alert('Test Wave functionality will be implemented in Milestone 5');
    }
    
    /**
     * Save the current level
     */
    saveLevel() {
        console.log('Saving level:', this.currentWave);
        // TODO: Implement level saving
        alert('Level saved! (placeholder)');
    }
    
    /**
     * Export JSON data
     */
    exportJSON() {
        const jsonData = JSON.stringify(this.currentWave, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'raptor_level.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Return to main menu
     */
    backToMenu() {
        this.game.stateManager.changeState('menu');
    }
    
    /**
     * Hide all game screens
     */
    hideAllScreens() {
        const screens = ['loading-screen', 'menu-screen', 'game-over-screen', 'hangar-screen', 'character-select-screen', 'shop-screen'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) screen.style.display = 'none';
        });
    }
    
    /**
     * Hide editor UI
     */
    hideEditorUI() {
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            editorContainer.remove();
        }
        
        // Move game container back to its original position
        const gameContainer = document.getElementById('game-container');
        const body = document.body;
        if (gameContainer && body) {
            body.appendChild(gameContainer);
        }
    }
    
    /**
     * Update method called by game loop
     */
    update(deltaTime) {
        // Update background scrolling
        if (this.backgroundManager) {
            this.backgroundManager.update(deltaTime);
        }
        
        // Re-render canvas if needed
        this.renderCanvas();
    }
    
    /**
     * Render method called by game loop
     */
    render(context) {
        // Main rendering is handled by renderCanvas()
        // This method is called by the game loop but we handle rendering separately
    }
}

export { EditorState };

