const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const splashSizes = [
  // iPhone SE (1st gen), iPhone 5, 5s, 5c
  { name: 'splash-640x1136', width: 640, height: 1136 },
  // iPhone 6, 6s, 7, 8
  { name: 'splash-750x1334', width: 750, height: 1334 },
  // iPhone 6 Plus, 6s Plus, 7 Plus, 8 Plus
  { name: 'splash-1242x2208', width: 1242, height: 2208 },
  // iPhone X, XS, 11 Pro
  { name: 'splash-1125x2436', width: 1125, height: 2436 },
  // iPad Mini, iPad Air
  { name: 'splash-1536x2048', width: 1536, height: 2048 },
  // iPad Pro 10.5"
  { name: 'splash-1668x2224', width: 1668, height: 2224 },
  // iPad Pro 12.9"
  { name: 'splash-2048x2732', width: 2048, height: 2732 },
  // iPhone XR, 11
  { name: 'splash-828x1792', width: 828, height: 1792 },
  // iPhone XS Max, 11 Pro Max
  { name: 'splash-1242x2688', width: 1242, height: 2688 },
];

const publicDir = path.join(__dirname, '../public');
const sourceFile = path.join(publicDir, 'splash-source.png'); // Buat gambar source minimal 2048x2732

async function generateSplashScreens() {
  console.log('🚀 Generating splash screens...\n');

  try {
    // Cek folder public
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log('✅ Created public directory');
    }

    // Cek file source
    if (!fs.existsSync(sourceFile)) {
      console.log('⚠️  File splash-source.png tidak ditemukan!');
      console.log('\n📝 Cara membuat:');
      console.log('1. Buat gambar dengan ukuran minimal 2048x2732 pixels');
      console.log('2. Simpan sebagai public/splash-source.png');
      console.log('3. Jalankan ulang script ini\n');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const size of splashSizes) {
      try {
        const outputFile = path.join(publicDir, `${size.name}.png`);
        
        await sharp(sourceFile)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center',
            background: { r: 37, g: 99, b: 235, alpha: 1 } // Warna biru #2563eb
          })
          .png({
            quality: 90,
            compressionLevel: 9
          })
          .toFile(outputFile);
        
        console.log(`✅ Generated: ${size.name}.png (${size.width}x${size.height})`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed: ${size.name}.png - ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Success: ${successCount} files`);
    console.log(`   ❌ Failed: ${errorCount} files`);
    console.log('\n🎉 Splash screens generation complete!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run
generateSplashScreens();