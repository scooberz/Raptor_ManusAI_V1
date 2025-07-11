// generate-placeholders.js

const fs = require('fs');
const { createCanvas } = require('canvas');

/**
 * Creates a placeholder image and saves it to a specified path.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @param {string} text - The text to display on the image.
 * @param {string} outputPath - The path to save the image file.
 */
function generatePlaceholderImage(width, height, text, outputPath) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#4d1c20'; // A menacing dark red
    ctx.fillRect(0, 0, width, height);

    // Add border
    ctx.strokeStyle = '#8f3d44';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);

    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
}

// --- Images to generate for the BOSS ---
const newImages = [
    { name: 'player_ship_base.png', width: 64, height: 64, dir: 'assets/images/player' },
    { name: 'player_ship_left.png', width: 64, height: 64, dir: 'assets/images/player' },
    { name: 'player_ship_right.png', width: 64, height: 64, dir: 'assets/images/player' },
    // Environment objects for destructible environments
    { name: 'FUEL_TANK.png', width: 48, height: 48, dir: 'assets/images/environment' },
    { name: 'BUNKER.png', width: 80, height: 60, dir: 'assets/images/environment' },
    { name: 'RADAR_DISH.png', width: 64, height: 64, dir: 'assets/images/environment' },
    // Missile weapon
    { name: 'MISSILE.png', width: 12, height: 24, dir: 'assets/images/projectiles' },
    // New projectile sprites
    { name: 'ENEMY_BULLET.png', width: 8, height: 8, dir: 'assets/images/projectiles' },
    { name: 'ENEMY_MISSILE.png', width: 12, height: 24, dir: 'assets/images/projectiles' },
    { name: 'SMOKE_PUFF.png', width: 16, height: 16, dir: 'assets/images/effects' },
    // You can add any other missing files here too
];
// --- Generate the new placeholder images ---
newImages.forEach(img => {
    // Ensure the directory exists
    if (!fs.existsSync(img.dir)) {
        fs.mkdirSync(img.dir, { recursive: true });
    }

    const outputPath = `${img.dir}/${img.name}`;
    if (!fs.existsSync(outputPath)) {
        generatePlaceholderImage(
            img.width,
            img.height,
            img.name.replace('.png', ''),
            outputPath
        );
        console.log(`Generated placeholder: ${outputPath}`);
    }
});

console.log('New placeholder generation complete!');
