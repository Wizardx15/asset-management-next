const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  16, 32, 57, 60, 72, 76, 96, 114, 120, 144, 152, 180, 192, 256, 384, 512
];

const publicDir = path.join(__dirname, '../public');

// Pastikan folder public ada
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons dari favicon.ico atau buat baru
async function generateIcons() {
  try {
    // Cek apakah ada file source (logo.svg atau logo.png)
    const sourceFile = path.join(publicDir, 'logo.png');
    
    if (!fs.existsSync(sourceFile)) {
      console.log('⚠️  File logo.png tidak ditemukan. Buat dulu di public/logo.png');
      console.log('Atau download default icon: https://favicon.io/favicon-generator/');
      return;
    }

    for (const size of sizes) {
      const outputFile = path.join(publicDir, 
        size <= 180 ? `apple-icon-${size}x${size}.png` : `icon-${size}x${size}.png`
      );
      
      await sharp(sourceFile)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      
      console.log(`✅ Generated ${size}x${size} icon`);
    }

    // Generate favicon.ico (16x16, 32x32, 48x48)
    const faviconSizes = [16, 32, 48];
    const faviconBuffers = [];
    
    for (const size of faviconSizes) {
      const buffer = await sharp(sourceFile)
        .resize(size, size)
        .png()
        .toBuffer();
      faviconBuffers.push({ buffer, size });
    }
    
    // Gabungkan ke .ico (butuh package tambahan: `npm install --save-dev to-ico`)
    // Atau generate manual di https://favicon.io
    
    console.log('✅ Favicon siap');
    
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();