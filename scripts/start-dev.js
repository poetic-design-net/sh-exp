const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

async function startEmulators() {
  log('\n🚀 Starting Firebase emulators...', colors.bright + colors.blue);
  
  const emulators = spawn('npx', ['firebase-tools', 'emulators:start'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Wait for emulators to start
  await new Promise((resolve) => {
    setTimeout(resolve, 5000); // Give emulators 5 seconds to start
  });
  
  return emulators;
}

async function runExport() {
  log('\n📤 Exporting production data...', colors.bright + colors.yellow);
  
  return new Promise((resolve, reject) => {
    const exportScript = spawn('node', ['scripts/export-firestore-data.js'], {
      stdio: 'inherit',
      shell: true
    });
    
    exportScript.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Export failed'));
      }
    });
  });
}

async function seedEmulator() {
  log('\n🌱 Seeding emulator with production data...', colors.bright + colors.green);
  
  return new Promise((resolve, reject) => {
    const seedScript = spawn('node', ['scripts/seed-emulator.js'], {
      stdio: 'inherit',
      shell: true
    });
    
    seedScript.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Seeding failed'));
      }
    });
  });
}

async function main() {
  try {
    log('\n🔧 Starting development environment with Firebase emulators...', colors.bright);
    
    // Export production data first
    console.log('\n📤 Exporting production data...');
    await runExport();
    
    // Start emulators
    const emulators = await startEmulators();
    
    // Wait for emulators to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    // Seed emulator with the exported data
    console.log('\n🌱 Seeding emulator with production data...');
    await seedEmulator();

    // Setup auth emulator with test user
    console.log('\n🔐 Setting up auth emulator...');
    const setupAuth = spawn('node', ['scripts/setup-auth-emulator.js'], {
      stdio: 'inherit',
      shell: true
    });

    await new Promise((resolve, reject) => {
      setupAuth.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('Auth setup failed'));
        }
      });
    });
    
    log('\n✨ Development environment is ready!', colors.bright + colors.green);
    log('📝 Notes:', colors.bright);
    log('- Firestore Emulator is running on localhost:8080');
    log('- Auth Emulator is running on localhost:9099');
    log('- Storage Emulator is running on localhost:9199');
    log('- Emulator UI is available at localhost:4000');
    log('\nPress Ctrl+C to stop the emulators\n');
    
    // Handle cleanup when the script is terminated
    process.on('SIGINT', () => {
      log('\n🛑 Shutting down emulators...', colors.bright + colors.red);
      emulators.kill();
      process.exit(0);
    });
    
  } catch (error) {
    log('\n❌ Error: ' + error.message, colors.bright + colors.red);
    process.exit(1);
  }
}

main();
