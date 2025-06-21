// Utility script to generate placeholder images for missing assets
const fs = require('fs');
const { createCanvas } = require('canvas');

// Create placeholder images for missing assets
function generatePlaceholderImage(width, height, text, outputPath) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, width, height);

    // Add border
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2;
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

// Generate missing player ship images
const playerShipImages = [
    { name: 'player_ship_base.png', width: 64, height: 64 },
    { name: 'player_ship_left.png', width: 64, height: 64 },
    { name: 'player_ship_right.png', width: 64, height: 64 },
    { name: 'player_ship_thrust.png', width: 64, height: 64 }
];

// Ensure player directory exists
const playerDir = 'assets/images/player';
if (!fs.existsSync(playerDir)) {
    fs.mkdirSync(playerDir, { recursive: true });
}

// Generate placeholder images
playerShipImages.forEach(img => {
    const outputPath = `${playerDir}/${img.name}`;
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

console.log('Placeholder generation complete!');

export { generatePlaceholders }; 