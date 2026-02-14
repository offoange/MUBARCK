const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceImage = path.join(__dirname, 'public', 'icon.png');
const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

async function resizeIcons() {
  for (const [folder, size] of Object.entries(sizes)) {
    const outputPath = path.join(resDir, folder, 'ic_launcher.png');
    const foregroundPath = path.join(resDir, folder, 'ic_launcher_foreground.png');
    const roundPath = path.join(resDir, folder, 'ic_launcher_round.png');

    await sharp(sourceImage)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    await sharp(sourceImage)
      .resize(size, size)
      .png()
      .toFile(foregroundPath);

    await sharp(sourceImage)
      .resize(size, size)
      .png()
      .toFile(roundPath);

    console.log(`Created ${size}x${size} icons in ${folder}`);
  }
  console.log('Done!');
}

resizeIcons().catch(console.error);
