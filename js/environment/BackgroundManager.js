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

    drawCoastalOverlay(ctx, width, height, drift) {
        ctx.fillStyle = 'rgba(44, 110, 148, 0.16)';
        ctx.fillRect(width * 0.72, 0, width * 0.28, height);
        ctx.fillStyle = 'rgba(197, 182, 121, 0.10)';
        for (let y = -drift; y < height; y += 170) {
            ctx.beginPath();
            ctx.moveTo(width * 0.64, y);
            ctx.lineTo(width * 0.75, y + 28);
            ctx.lineTo(width * 0.69, y + 92);
            ctx.lineTo(width * 0.57, y + 66);
            ctx.closePath();
            ctx.fill();
        }
        ctx.strokeStyle = 'rgba(230, 220, 160, 0.14)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(width * 0.63, 0);
        ctx.lineTo(width * 0.58, height);
        ctx.stroke();
    }

    drawIndustrialOverlay(ctx, width, height, drift) {
        ctx.fillStyle = 'rgba(30, 34, 40, 0.24)';
        for (let y = -drift; y < height; y += 120) {
            ctx.fillRect(width * 0.12, y, width * 0.3, 54);
            ctx.fillRect(width * 0.48, y + 28, width * 0.22, 66);
            ctx.fillRect(width * 0.76, y + 10, width * 0.12, 44);
        }
        ctx.strokeStyle = 'rgba(120, 130, 140, 0.18)';
        ctx.lineWidth = 3;
        for (let y = -drift; y < height; y += 100) {
            ctx.beginPath();
            ctx.moveTo(width * 0.1, y + 70);
            ctx.lineTo(width * 0.9, y + 70);
            ctx.stroke();
        }
    }

    drawBridgeOverlay(ctx, width, height, drift) {
        ctx.fillStyle = 'rgba(37, 95, 130, 0.20)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(82, 82, 82, 0.28)';
        for (let y = -drift; y < height; y += 180) {
            ctx.fillRect(width * 0.15, y + 54, width * 0.7, 24);
            ctx.fillRect(width * 0.22, y + 28, 22, 90);
            ctx.fillRect(width * 0.78, y + 28, 22, 90);
            ctx.fillRect(width * 0.48, y + 18, 28, 110);
        }
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.20)';
        ctx.lineWidth = 2;
        for (let y = -drift; y < height; y += 180) {
            ctx.beginPath();
            ctx.moveTo(width * 0.18, y + 66);
            ctx.lineTo(width * 0.82, y + 66);
            ctx.stroke();
        }
    }

    drawRefineryOverlay(ctx, width, height, drift) {
        ctx.fillStyle = 'rgba(24, 77, 116, 0.20)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(170, 123, 54, 0.14)';
        for (let y = -drift; y < height; y += 150) {
            for (let x = width * 0.12; x < width * 0.88; x += 130) {
                ctx.beginPath();
                ctx.arc(x, y + 80, 28, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.strokeStyle = 'rgba(184, 150, 92, 0.20)';
        ctx.lineWidth = 6;
        for (let y = -drift; y < height; y += 150) {
            ctx.beginPath();
            ctx.moveTo(width * 0.12, y + 80);
            ctx.lineTo(width * 0.88, y + 80);
            ctx.stroke();
        }
    }

    drawMilitaryOverlay(ctx, width, height, drift) {
        ctx.fillStyle = 'rgba(20, 46, 32, 0.20)';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(125, 150, 120, 0.18)';
        ctx.lineWidth = 3;
        for (let y = -drift; y < height; y += 140) {
            ctx.strokeRect(width * 0.16, y + 24, width * 0.2, 70);
            ctx.strokeRect(width * 0.44, y + 18, width * 0.14, 100);
            ctx.strokeRect(width * 0.68, y + 32, width * 0.18, 60);
        }
        ctx.fillStyle = 'rgba(170, 170, 170, 0.10)';
        ctx.fillRect(width * 0.47, 0, width * 0.06, height);
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
