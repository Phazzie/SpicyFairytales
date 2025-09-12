#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables and dependencies are configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Spicy FairyTales Environment...\n');

// Check for .env file
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('📝 Copy .env.example to .env and configure your API keys\n');
  process.exit(1);
}

console.log('✅ .env file found');

// Check for required API keys in .env
const envContent = fs.readFileSync(envPath, 'utf8');
const requiredKeys = [
  'VITE_GROK_API_KEY',
  'VITE_ELEVENLABS_API_KEY'
];

let missingKeys = [];
for (const key of requiredKeys) {
  if (!envContent.includes(`${key}=`) || envContent.includes(`${key}=your_`)) {
    missingKeys.push(key);
  }
}

if (missingKeys.length > 0) {
  console.log('❌ Missing or placeholder API keys:');
  missingKeys.forEach(key => console.log(`   - ${key}`));
  console.log('\n🔑 Get your API keys:');
  console.log('   - Grok: https://console.x.ai/');
  console.log('   - ElevenLabs: https://elevenlabs.io/');
  console.log('\n💡 For development, you can set VITE_USE_MOCKS=true to use mock services\n');
  process.exit(1);
}

console.log('✅ All required API keys configured');

// Check for package.json
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.log('❌ package.json not found');
  process.exit(1);
}

console.log('✅ package.json found');

// Check for node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ node_modules not found - run "npm install"');
  process.exit(1);
}

console.log('✅ Dependencies installed');

// Check for Angular CLI
try {
  require.resolve('@angular/cli');
  console.log('✅ Angular CLI available');
} catch {
  console.log('❌ Angular CLI not found - run "npm install -g @angular/cli"');
  process.exit(1);
}

// Check for Chrome (for testing)
const { execSync } = require('child_process');
try {
  execSync('which google-chrome-stable || which chromium-browser || which chrome', { stdio: 'pipe' });
  console.log('✅ Chrome/Chromium available for testing');
} catch {
  console.log('⚠️  Chrome not found - testing may fail');
  console.log('   Install Chrome or set CHROME_BIN environment variable');
}

console.log('\n🎉 Environment validation complete!');
console.log('🚀 Ready to run: npm start\n');