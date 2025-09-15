#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables and dependencies are configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Spicy FairyTales Environment...\n');

// Check for .env file (only required for local development)
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');
const isProduction = process.env.NODE_ENV === 'production';
const useMocks = process.env.VITE_USE_MOCKS === 'true';

if (!isProduction && !fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('📝 Copy .env.example to .env and configure your API keys\n');
  process.exit(1);
}

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
}

// Check for API keys (skip if using mocks)
if (!useMocks) {
  const requiredKeys = [
    'VITE_GROK_API_KEY',
    'VITE_ELEVENLABS_API_KEY'
  ];

  let missingKeys = [];
  
  for (const key of requiredKeys) {
    const value = process.env[key] || (fs.existsSync(envPath) ? 
      fs.readFileSync(envPath, 'utf8').match(new RegExp(`${key}=(.+)`))?.[1] : null);
    
    if (!value || value.startsWith('your_')) {
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
    if (!isProduction) {
      process.exit(1);
    }
  } else {
    console.log('✅ All required API keys configured');
  }
} else {
  console.log('🎭 Using mock services for development');
}

// Check for package.json
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.log('❌ package.json not found');
  process.exit(1);
}

console.log('✅ package.json found');

// Check for node_modules (skip in CI/production)
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath) && !process.env.CI) {
  console.log('❌ node_modules not found - run "npm install"');
  process.exit(1);
}

if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ Dependencies installed');
}

// Check for Angular CLI
try {
  require.resolve('@angular/cli');
  console.log('✅ Angular CLI available');
} catch {
  console.log('❌ Angular CLI not found - run "npm install"');
  if (!process.env.CI) {
    process.exit(1);
  }
}

// Check for Chrome (for testing) - only in non-production
if (!isProduction) {
  const { execSync } = require('child_process');
  try {
    execSync('which google-chrome-stable || which chromium-browser || which chrome', { stdio: 'pipe' });
    console.log('✅ Chrome/Chromium available for testing');
  } catch {
    console.log('⚠️  Chrome not found - testing may fail');
    console.log('   Install Chrome or set CHROME_BIN environment variable');
  }
}

console.log('\n🎉 Environment validation complete!');

if (useMocks) {
  console.log('🎭 Running in mock mode - no API costs');
} else {
  console.log('🔗 Connected to real APIs');
}

console.log('🚀 Ready to run: npm start\n');