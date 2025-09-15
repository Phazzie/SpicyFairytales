#!/usr/bin/env node

/**
 * API Integration Test Script
 * Tests Grok and ElevenLabs API integrations
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Spicy FairyTales API Integrations...\n');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

const env = loadEnv();
const grokKey = env.VITE_XAI_API_KEY;
const elevenLabsKey = env.VITE_ELEVENLABS_API_KEY;

console.log('🔑 API Keys Status:');
console.log(`   Grok: ${grokKey && grokKey !== 'your_grok_api_key_here' ? '✅ Configured' : '❌ Missing/Placeholder'}`);
console.log(`   ElevenLabs: ${elevenLabsKey && elevenLabsKey !== 'your_elevenlabs_api_key_here' ? '✅ Configured' : '❌ Missing/Placeholder'}\n`);

// Test Grok API
async function testGrokAPI() {
  console.log('🤖 Testing Grok API Integration...');

  if (!grokKey || grokKey === 'your_grok_api_key_here') {
    console.log('   ⚠️  Skipping Grok test - API key not configured\n');
    return false;
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokKey}`,
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: 'Write a short 2-sentence fairy tale about a brave mouse.'
        }],
        model: 'grok-beta',
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      console.log('   ✅ Grok API working!');
      console.log(`   📝 Response: "${content.substring(0, 100)}..."\n`);
      return true;
    } else {
      throw new Error('No content in response');
    }

  } catch (error) {
    console.log(`   ❌ Grok API test failed: ${error.message}\n`);
    return false;
  }
}

// Test ElevenLabs API
async function testElevenLabsAPI() {
  console.log('🎵 Testing ElevenLabs API Integration...');

  if (!elevenLabsKey || elevenLabsKey === 'your_elevenlabs_api_key_here') {
    console.log('   ⚠️  Skipping ElevenLabs test - API key not configured\n');
    return false;
  }

  try {
    // First, get available voices
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': elevenLabsKey,
      },
    });

    if (!voicesResponse.ok) {
      throw new Error(`HTTP ${voicesResponse.status}: ${voicesResponse.statusText}`);
    }

    const voicesData = await voicesResponse.json();
    const voices = voicesData.voices || [];

    if (voices.length === 0) {
      throw new Error('No voices available');
    }

    console.log(`   ✅ ElevenLabs API working! Found ${voices.length} voices`);
    console.log(`   🎤 Sample voices: ${voices.slice(0, 3).map(v => v.name).join(', ')}\n`);
    return true;

  } catch (error) {
    console.log(`   ❌ ElevenLabs API test failed: ${error.message}\n`);
    return false;
  }
}

// Test Angular build with real services
async function testAngularBuild() {
  console.log('🔨 Testing Angular Build with Real Services...');

  const { spawn } = require('child_process');

  return new Promise((resolve) => {
    const build = spawn('npm', ['run', 'build'], {
      cwd: __dirname,
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    build.stdout.on('data', (data) => {
      output += data.toString();
    });

    build.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    build.on('close', (code) => {
      if (code === 0) {
        console.log('   ✅ Angular build successful with real services!\n');
        resolve(true);
      } else {
        console.log('   ❌ Angular build failed:');
        console.log(`   ${errorOutput}\n`);
        resolve(false);
      }
    });
  });
}

// Run all tests
async function runTests() {
  const results = {
    grok: await testGrokAPI(),
    elevenlabs: await testElevenLabsAPI(),
    build: await testAngularBuild()
  };

  console.log('📊 Test Results Summary:');
  console.log(`   Grok API: ${results.grok ? '✅ PASS' : '❌ FAIL/SKIP'}`);
  console.log(`   ElevenLabs API: ${results.elevenlabs ? '✅ PASS' : '❌ FAIL/SKIP'}`);
  console.log(`   Angular Build: ${results.build ? '✅ PASS' : '❌ FAIL'}`);

  const allPass = Object.values(results).every(result => result);
  console.log(`\n🏆 Overall: ${allPass ? '✅ ALL TESTS PASS' : '⚠️  SOME TESTS FAILED'}`);

  if (!results.grok || !results.elevenlabs) {
    console.log('\n💡 Tip: Set VITE_USE_MOCKS=true in .env to use mock services for development');
  }

  console.log('\n🎯 Ready to run the application: npm start\n');
}

runTests().catch(console.error);