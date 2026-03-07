/**
 * Tilemap class
 * Renders a deterministic geometry layer for Level 1 so landmarks sit on authored terrain.
 */
export class Tilemap {
    constructor(game, tilemapData, scrollSpeed) {
        this.game = game;
        this.tilemapData = tilemapData;
        this.scrollSpeed = scrollSpeed;
        this.environmentObjects = [];
        this.y = 0;
        this.activeSectionId = 'coastal_outskirts';
    }

    registerObject(object) {
        this.environmentObjects.push(object);
    }

    setActiveSection(sectionId) {
        this.activeSectionId = sectionId || this.activeSectionId;
    }

    update(deltaTime) {
        const scrollAmount = this.scrollSpeed * (deltaTime / 1000);
        this.y += scrollAmount;
    }

    getSectionPalette() {
        switch (this.activeSectionId) {
            case 'coastal_outskirts':
                return { base: 'rgba(58, 76, 68, 0.18)', alt: 'rgba(180, 164, 120, 0.12)', line: 'rgba(214, 198, 140, 0.14)' };
            case 'industrial_shoreline':
                return { base: 'rgba(74, 74, 72, 0.2)', alt: 'rgba(108, 90, 64, 0.14)', line: 'rgba(166, 148, 102, 0.14)' };
            case 'bridge_corridor':
                return { base: 'rgba(78, 84, 94, 0.24)', alt: 'rgba(34, 48, 62, 0.18)', line: 'rgba(208, 202, 170, 0.16)' };
            case 'refinery_inlet':
                return { base: 'rgba(86, 84, 68, 0.18)', alt: 'rgba(180, 132, 72, 0.14)', line: 'rgba(122, 176, 164, 0.16)' };
            case 'hardened_complex':
                return { base: 'rgba(72, 82, 72, 0.2)', alt: 'rgba(118, 132, 102, 0.12)', line: 'rgba(204, 192, 128, 0.14)' };
            default:
                return { base: 'rgba(70, 80, 86, 0.18)', alt: 'rgba(112, 120, 128, 0.12)', line: 'rgba(214, 214, 214, 0.12)' };
        }
    }

    render(context, x = 0, y = 0, width = this.game.width, height = this.game.height) {
        if (!context || !Array.isArray(this.tilemapData) || !this.tilemapData.length) {
            return;
        }

        const rows = this.tilemapData.length;
        const cols = this.tilemapData[0].length;
        const cellW = width / cols;
        const cellH = height / rows;
        const rowOffset = this.y % cellH;
        const palette = this.getSectionPalette();

        context.save();
        context.beginPath();
        context.rect(x, y, width, height);
        context.clip();

        this.drawSectionFoundation(context, x, y, width, height, cellW, cellH);

        for (let repeat = -1; repeat <= 1; repeat++) {
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const tile = this.tilemapData[row][col];
                    if (tile === 0) {
                        continue;
                    }

                    const drawX = x + (col * cellW);
                    const drawY = y + (row * cellH) + rowOffset + (repeat * rows * cellH);
                    if (drawY > y + height || drawY + cellH < y) {
                        continue;
                    }

                    context.fillStyle = tile === 1 ? palette.base : palette.alt;
                    context.fillRect(drawX, drawY, cellW, cellH);
                    context.strokeStyle = palette.line;
                    context.lineWidth = 1;
                    context.strokeRect(drawX + 0.5, drawY + 0.5, cellW - 1, cellH - 1);
                }
            }
        }

        this.drawSectionDetail(context, x, y, width, height, rowOffset, cellW, cellH, palette);
        context.restore();
    }

    drawSectionFoundation(ctx, x, y, width, height, cellW, cellH) {
        switch (this.activeSectionId) {
            case 'coastal_outskirts':
                ctx.fillStyle = 'rgba(18, 60, 84, 0.18)';
                ctx.fillRect(x + width * 0.68, y, width * 0.32, height);
                ctx.fillStyle = 'rgba(112, 108, 78, 0.18)';
                ctx.fillRect(x + width * 0.08, y, width * 0.24, height);
                break;
            case 'industrial_shoreline':
                ctx.fillStyle = 'rgba(58, 58, 56, 0.22)';
                ctx.fillRect(x + width * 0.06, y, width * 0.88, height);
                break;
            case 'bridge_corridor':
                ctx.fillStyle = 'rgba(18, 58, 84, 0.2)';
                ctx.fillRect(x, y, width, height);
                ctx.fillStyle = 'rgba(84, 88, 94, 0.3)';
                ctx.fillRect(x + width * 0.19, y, width * 0.62, height);
                break;
            case 'refinery_inlet':
                ctx.fillStyle = 'rgba(18, 52, 60, 0.18)';
                ctx.fillRect(x, y, width, height);
                ctx.fillStyle = 'rgba(86, 80, 58, 0.16)';
                ctx.fillRect(x + width * 0.12, y, width * 0.76, height);
                break;
            case 'hardened_complex':
                ctx.fillStyle = 'rgba(34, 52, 34, 0.18)';
                ctx.fillRect(x, y, width, height);
                ctx.fillStyle = 'rgba(92, 102, 84, 0.16)';
                ctx.fillRect(x + width * 0.16, y, width * 0.68, height);
                break;
            default:
                break;
        }
    }

    drawSectionDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette) {
        switch (this.activeSectionId) {
            case 'coastal_outskirts':
                this.drawCoastalDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette);
                break;
            case 'industrial_shoreline':
                this.drawIndustrialDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette);
                break;
            case 'bridge_corridor':
                this.drawBridgeDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette);
                break;
            case 'refinery_inlet':
                this.drawRefineryDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette);
                break;
            case 'hardened_complex':
                this.drawMilitaryDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette);
                break;
            default:
                break;
        }
    }

    drawCoastalDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette) {
        ctx.fillStyle = 'rgba(96, 88, 70, 0.22)';
        for (let row = -1; row < 6; row++) {
            const py = y + rowOffset + (row * cellH * 3);
            ctx.fillRect(x + cellW * 3, py + cellH, cellW * 4, cellH * 1.2);
            ctx.fillRect(x + cellW * 17, py + cellH * 1.4, cellW * 3, cellH);
        }
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 2;
        for (let row = -1; row < 6; row++) {
            const py = y + rowOffset + (row * cellH * 3);
            ctx.beginPath();
            ctx.moveTo(x + cellW * 7, py + cellH * 1.6);
            ctx.lineTo(x + cellW * 10, py + cellH * 2.4);
            ctx.stroke();
        }
    }

    drawIndustrialDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette) {
        ctx.fillStyle = 'rgba(92, 86, 80, 0.24)';
        for (let row = -1; row < 5; row++) {
            const py = y + rowOffset + (row * cellH * 3.2);
            ctx.fillRect(x + cellW * 2, py + cellH * 0.8, cellW * 5, cellH * 1.2);
            ctx.fillRect(x + cellW * 11, py + cellH * 1.2, cellW * 6, cellH * 1.1);
        }
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 2;
        for (let row = -1; row < 6; row++) {
            const py = y + rowOffset + (row * cellH * 2.8);
            ctx.strokeRect(x + cellW * 2.2, py + cellH, cellW * 4.6, cellH * 1.1);
            ctx.strokeRect(x + cellW * 11.2, py + cellH * 1.2, cellW * 5.6, cellH * 1.0);
        }
    }

    drawBridgeDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette) {
        ctx.fillStyle = 'rgba(118, 118, 118, 0.26)';
        for (let row = -1; row < 6; row++) {
            const py = y + rowOffset + (row * cellH * 3.1);
            ctx.fillRect(x + cellW * 5, py + cellH * 1.2, cellW * 15, cellH * 0.8);
            ctx.fillRect(x + cellW * 6, py + cellH * 0.6, cellW * 2, cellH * 1.8);
            ctx.fillRect(x + cellW * 17, py + cellH * 0.6, cellW * 2, cellH * 1.8);
            ctx.fillRect(x + cellW * 11.5, py, cellW * 2, cellH * 2.4);
        }
        ctx.strokeStyle = 'rgba(214, 206, 168, 0.18)';
        ctx.lineWidth = 2;
        for (let row = -1; row < 6; row++) {
            const py = y + rowOffset + (row * cellH * 3.1);
            ctx.beginPath();
            ctx.moveTo(x + cellW * 7.8, py + cellH * 0.7);
            ctx.lineTo(x + cellW * 12.5, py + cellH * 0.1);
            ctx.lineTo(x + cellW * 17.2, py + cellH * 0.7);
            ctx.stroke();
        }
    }

    drawRefineryDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette) {
        ctx.fillStyle = 'rgba(182, 128, 60, 0.16)';
        for (let row = -1; row < 5; row++) {
            const py = y + rowOffset + (row * cellH * 3.4);
            for (let col of [4, 9, 14, 19]) {
                ctx.beginPath();
                ctx.arc(x + cellW * col, py + cellH * 1.5, cellW * 0.9, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillRect(x + cellW * 3.4, py + cellH * 2.2, cellW * 13.5, cellH * 0.4);
        }
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 2;
        for (let row = -1; row < 6; row++) {
            const py = y + rowOffset + (row * cellH * 2.6);
            ctx.beginPath();
            ctx.moveTo(x + cellW * 4, py + cellH * 0.8);
            ctx.lineTo(x + cellW * 7, py + cellH * 0.8);
            ctx.lineTo(x + cellW * 7, py + cellH * 1.8);
            ctx.lineTo(x + cellW * 15, py + cellH * 1.8);
            ctx.stroke();
        }
    }

    drawMilitaryDetail(ctx, x, y, width, height, rowOffset, cellW, cellH, palette) {
        ctx.fillStyle = 'rgba(98, 108, 90, 0.18)';
        for (let row = -1; row < 5; row++) {
            const py = y + rowOffset + (row * cellH * 3.1);
            ctx.fillRect(x + cellW * 4, py + cellH * 0.8, cellW * 5, cellH * 1.1);
            ctx.fillRect(x + cellW * 11, py + cellH * 0.6, cellW * 3, cellH * 1.5);
            ctx.fillRect(x + cellW * 16, py + cellH, cellW * 4, cellH * 1.0);
        }
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 2;
        for (let row = -1; row < 6; row++) {
            const py = y + rowOffset + (row * cellH * 2.6);
            ctx.strokeRect(x + cellW * 4.4, py + cellH * 0.9, cellW * 4.2, cellH * 0.9);
            ctx.strokeRect(x + cellW * 11.2, py + cellH * 0.8, cellW * 2.6, cellH * 1.2);
            ctx.beginPath();
            ctx.moveTo(x + cellW * 12.5, py + cellH * 0.8);
            ctx.lineTo(x + cellW * 12.5, py + cellH * 2.0);
            ctx.stroke();
        }
    }
}
