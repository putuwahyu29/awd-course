import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const svgPath = path.resolve('public/favicon.svg');
const outputDir = path.resolve('public/icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const svgBuffer = fs.readFileSync(svgPath);

const standardSizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

async function generateIcons() {
  console.log('Generating standard PWA icons...');
  for (const size of standardSizes) {
    const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}x${size}.png`;
    const targetFile = path.join(outputDir, filename);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(targetFile);

    console.log(`✓ Generated: ${filename}`);
  }

  // Also create icon-180x180.png duplicate for convenience
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'icon-180x180.png'));

  console.log('Generating maskable icons with safe margin...');
  const maskableSizes = [192, 512];

  for (const size of maskableSizes) {
    const safeContentSize = Math.round(size * 0.8);
    const innerPadding = Math.round((size - safeContentSize) / 2);

    const innerIconBuffer = await sharp(svgBuffer)
      .resize(safeContentSize, safeContentSize)
      .png()
      .toBuffer();

    // Composite centered on #0b0f19 background
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 11, g: 15, b: 25, alpha: 1 },
      },
    })
      .composite([
        {
          input: innerIconBuffer,
          top: innerPadding,
          left: innerPadding,
        },
      ])
      .png()
      .toFile(path.join(outputDir, `icon-maskable-${size}x${size}.png`));

    console.log(`✓ Generated: icon-maskable-${size}x${size}.png`);
  }

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
