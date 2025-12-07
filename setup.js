// setup.js - Run this to create your project structure on Windows
const fs = require('fs');
const path = require('path');

// 1. Define the folders we need
const folders = [
  'app',
  'app/api',
  'app/api/analyze',
  'app/components',
  'public'
];

// 2. Define the files we need
const files = [
  'app/globals.css',
  'app/layout.js',
  'app/page.js',
  'app/api/analyze/route.js',
  'tailwind.config.js',
  'next.config.mjs',
  '.env.local',
  '.gitignore'
];

// 3. Create Folders
console.log('📂 Creating folders...');
folders.forEach(folder => {
  const dirPath = path.join(__dirname, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   ✅ Created: ${folder}`);
  }
});

// 4. Create Empty Files
console.log('📄 Creating files...');
files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, ''); // Create empty file
    console.log(`   ✅ Created: ${file}`);
  }
});

console.log('\n🎉 SUCCESS! Project structure ready.');
console.log('👉 Now Copy/Paste the code into these files.');