/**
 * Manages the scrolling background and sector-specific terrain overlays.
 */
export class BackgroundManager {
    constructor(game, backgroundImage, scrollSpeed, terrainSections = []) {
        this.game = game;
        this.image = backgroundImage;
        this.scrollSpeed = scrollSpeed;
        this.terrainSections = terrainSections;
        this.activeSectionId = terrainSections[0]?.id || null;
        this.totalScroll = 0;

        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = this.game.width;
        this.bufferCanvas.height = this.game.height;
        this.bufferCtx = this.bufferCanvas.getContext('2d');

        this.y1 = 0;
        this.y2 = -this.image.height;
    }

    setTerrainSections(terrainSections = []) {
        this.terrainSections = terrainSections;
        if (!this.activeSectionId && terrainSections[0]) {
            this.activeSectionId = terrainSections[0].id;
        }
    }

    setActiveSection(sectionId) {
        this.activeSectionId = sectionId;
    }

    getActiveSection() {
        return this.terrainSections.find((section) => section.id === this.activeSectionId) || null;
    }

    update(deltaTime) {
        const scrollAmount = this.scrollSpeed * (deltaTime / 1000);
        this.totalScroll += scrollAmount;
        this.y1 += scrollAmount;
        this.y2 += scrollAmount;

        if (this.y1 >= this.game.height) {
            this.y1 = this.y2 - this.image.height;
        }
        if (this.y2 >= this.game.height) {
            this.y2 = this.y1 - this.image.height;
        }
    }

    render(mainContext, x = 0, y = 0, width = this.game.width, height = this.game.height) {
        this.bufferCtx.clearRect(0, 0, this.game.width, this.game.height);
        this.bufferCtx.drawImage(this.image, 0, this.y1, this.game.width, this.image.height);
        this.bufferCtx.drawImage(this.image, 0, this.y2, this.game.width, this.image.height);
        this.renderTerrainOverlay(this.bufferCtx);
        this.renderAtmosphereOverlay(this.bufferCtx);
        mainContext.drawImage(this.bufferCanvas, x, y, width, height);
    }

    renderTerrainOverlay(ctx) {
        const section = this.getActiveSection();
        if (!section) {
            return;
        }

        const width = this.game.width;
        const height = this.game.height;
        const drift = this.totalScroll % 240;

        ctx.save();

        switch (section.theme) {
            case 'coastal':
                this.drawCoastalOverlay(ctx, width, height, drift);
                break;
            case 'industrial':
                this.drawIndustrialOverlay(ctx, width, height, drift);
                break;
            case 'bridge':
                this.drawBridgeOverlay(ctx, width, height, drift);
                break;
            case 'refinery':
                this.drawRefineryOverlay(ctx, width, height, drift);
                break;
            case 'military':
                this.drawMilitaryOverlay(ctx, width, height, drift);
                break;
            default:
                break;
        }

        ctx.restore();
    }

    renderAtmosphereOverlay(ctx) {
        const width = this.game.width;
        const height = this.game.height;
        const section = this.getActiveSection();
        const palette = this.getSectionPalette(section?.theme);
        const shimmer = 0.08 + (Math.sin(this.totalScroll / 120) + 1) * 0.015;

        ctx.save();

        const topGradient = ctx.createLinearGradient(0, 0, 0, height);
        topGradient.addColorStop(0, palette.skyTint);
        topGradient.addColorStop(0.45, 'rgba(0,0,0,0)');
        topGradient.addColorStop(1, palette.floorTint);
        ctx.fillStyle = topGradient;
        ctx.fillRect(0, 0, width, height);

        const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.18, width / 2, height / 2, height * 0.78);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.28)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = `rgba(255, 255, 255, ${shimmer})`;
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 6) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(width, y + 0.5);
            ctx.stroke();
        }

        ctx.restore();
    }

    getSectionPalette(theme) {
        switch (theme) {
            case 'coastal':
                return {
                    skyTint: 'rgba(74, 134, 170, 0.16)',
                    floorTint: 'rgba(10, 38, 56, 0.16)'
                };
            case 'industrial':
                return {
                    skyTint: 'rgba(92, 88, 76, 0.14)',
                    floorTint: 'rgba(28, 24, 22, 0.2)'
                };
            case 'bridge':
                return {
                    skyTint: 'rgba(48, 92, 124, 0.14)',
                    floorTint: 'rgba(16, 28, 42, 0.18)'
                };
            case 'refinery':
                return {
                    skyTint: 'rgba(86, 110, 98, 0.13)',
                    floorTint: 'rgba(34, 54, 40, 0.18)'
                };
            case 'military':
                return {
                    skyTint: 'rgba(74, 94, 74, 0.12)',
                    floorTint: 'rgba(18, 26, 18, 0.22)'
                };
            default:
                return {
                    skyTint: 'rgba(40, 58, 78, 0.12)',
                    floorTint: 'rgba(6, 12, 18, 0.18)'
                };
        }
    }

    drawCoastalOverlay(ctx, width, height, drift) {
        const waterGradient = ctx.createLinearGradient(width * 0.62, 0, width, 0);
        waterGradient.addColorStop(0, 'rgba(26, 86, 124, 0.08)');
        waterGradient.addColorStop(1, 'rgba(42, 124, 170, 0.22)');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(width * 0.64, 0, width * 0.36, height);

        ctx.fillStyle = 'rgba(206, 192, 132, 0.12)';
        for (let y = -drift; y < height + 120; y += 170) {
            ctx.beginPath();
            ctx.moveTo(width * 0.58, y + 12);
            ctx.lineTo(width * 0.75, y + 28);
            ctx.lineTo(width * 0.72, y + 104);
            ctx.lineTo(width * 0.54, y + 82);
            ctx.closePath();
            ctx.fill();
        }

        ctx.strokeStyle = 'rgba(230, 220, 160, 0.18)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(width * 0.61, 0);
        ctx.lineTo(width * 0.56, height);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(215, 244, 255, 0.13)';
        ctx.lineWidth = 2;
        for (let y = (-drift * 1.6) % 220; y < height + 80; y += 54) {
            ctx.beginPath();
            ctx.moveTo(width * 0.72, y);
            ctx.quadraticCurveTo(width * 0.82, y + 12, width * 0.94, y + 2);
            ctx.stroke();
        }
    }

    drawIndustrialOverlay(ctx, width, height, drift) {
        const haze = ctx.createLinearGradient(0, 0, width, 0);
        haze.addColorStop(0, 'rgba(36, 28, 24, 0.08)');
        haze.addColorStop(0.5, 'rgba(64, 52, 44, 0.2)');
        haze.addColorStop(1, 'rgba(36, 28, 24, 0.08)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(34, 38, 44, 0.26)';
        for (let y = -drift; y < height + 120; y += 124) {
            ctx.fillRect(width * 0.08, y, width * 0.26, 62);
            ctx.fillRect(width * 0.42, y + 24, width * 0.2, 70);
            ctx.fillRect(width * 0.72, y + 10, width * 0.16, 54);
        }

        ctx.strokeStyle = 'rgba(130, 138, 148, 0.2)';
        ctx.lineWidth = 3;
        for (let y = -drift; y < height + 80; y += 100) {
            ctx.beginPath();
            ctx.moveTo(width * 0.06, y + 72);
            ctx.lineTo(width * 0.94, y + 72);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(128, 118, 90, 0.16)';
        for (let x = width * 0.16; x < width * 0.9; x += 180) {
            ctx.fillRect(x, ((-drift * 0.65) % height), 14, height);
        }
    }

    drawBridgeOverlay(ctx, width, height, drift) {
        ctx.fillStyle = 'rgba(24, 78, 114, 0.18)';
        ctx.fillRect(0, 0, width, height);

        const bridgeLeft = width * 0.17;
        const bridgeWidth = width * 0.66;
        ctx.fillStyle = 'rgba(88, 88, 92, 0.3)';
        ctx.fillRect(bridgeLeft, 0, bridgeWidth, height);

        ctx.fillStyle = 'rgba(30, 44, 58, 0.22)';
        ctx.fillRect(bridgeLeft + 28, 0, bridgeWidth - 56, height);

        ctx.strokeStyle = 'rgba(218, 218, 205, 0.24)';
        ctx.lineWidth = 3;
        for (let y = (-drift * 1.4) % 140; y < height + 60; y += 60) {
            ctx.beginPath();
            ctx.moveTo(width * 0.49, y);
            ctx.lineTo(width * 0.51, y + 26);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(118, 118, 118, 0.28)';
        for (let y = -drift; y < height + 180; y += 180) {
            ctx.fillRect(width * 0.2, y + 46, width * 0.6, 22);
            ctx.fillRect(width * 0.23, y + 20, 24, 102);
            ctx.fillRect(width * 0.76, y + 20, 24, 102);
            ctx.fillRect(width * 0.485, y + 8, 28, 118);
        }

        ctx.fillStyle = 'rgba(12, 40, 58, 0.18)';
        ctx.fillRect(0, 0, bridgeLeft - 8, height);
        ctx.fillRect(bridgeLeft + bridgeWidth + 8, 0, width, height);
    }

    drawRefineryOverlay(ctx, width, height, drift) {
        const waterGradient = ctx.createLinearGradient(0, 0, width, height);
        waterGradient.addColorStop(0, 'rgba(34, 84, 92, 0.16)');
        waterGradient.addColorStop(1, 'rgba(20, 44, 50, 0.16)');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(196, 154, 96, 0.22)';
        ctx.lineWidth = 6;
        for (let y = -drift; y < height + 140; y += 150) {
            ctx.beginPath();
            ctx.moveTo(width * 0.12, y + 78);
            ctx.lineTo(width * 0.88, y + 78);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(182, 128, 60, 0.18)';
        for (let y = -drift; y < height + 150; y += 150) {
            for (let x = width * 0.14; x < width * 0.9; x += 130) {
                ctx.beginPath();
                ctx.arc(x, y + 76, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(x - 10, y + 24, 20, 30);
            }
        }

        ctx.fillStyle = 'rgba(255, 164, 74, 0.08)';
        for (let y = ((-drift * 1.8) % 240); y < height + 80; y += 120) {
            ctx.fillRect(width * 0.08, y, width * 0.84, 10);
        }
    }

    drawMilitaryOverlay(ctx, width, height, drift) {
        const baseGradient = ctx.createLinearGradient(0, 0, 0, height);
        baseGradient.addColorStop(0, 'rgba(34, 58, 34, 0.08)');
        baseGradient.addColorStop(1, 'rgba(12, 24, 12, 0.18)');
        ctx.fillStyle = baseGradient;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(132, 156, 116, 0.18)';
        ctx.lineWidth = 3;
        for (let y = -drift; y < height + 140; y += 140) {
            ctx.strokeRect(width * 0.12, y + 18, width * 0.22, 76);
            ctx.strokeRect(width * 0.42, y + 14, width * 0.16, 106);
            ctx.strokeRect(width * 0.7, y + 24, width * 0.18, 68);
        }

        ctx.fillStyle = 'rgba(182, 182, 170, 0.08)';
        ctx.fillRect(width * 0.47, 0, width * 0.06, height);
        ctx.strokeStyle = 'rgba(255, 208, 92, 0.16)';
        ctx.lineWidth = 2;
        for (let y = (-drift * 1.2) % 120; y < height + 60; y += 42) {
            ctx.beginPath();
            ctx.moveTo(width * 0.49, y);
            ctx.lineTo(width * 0.51, y + 18);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(88, 108, 88, 0.08)';
        for (let x = width * 0.08; x < width * 0.92; x += 90) {
            ctx.fillRect(x, ((-drift * 0.45) % height), 6, height);
        }
    }

    reset() {
        this.y1 = 0;
        this.y2 = -this.image.height;
        this.totalScroll = 0;
    }

    resize() {
        this.bufferCanvas.width = this.game.width;
        this.bufferCanvas.height = this.game.height;
    }
}
