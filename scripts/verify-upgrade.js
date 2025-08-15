#!/usr/bin/env node

/**
 * Verification script to ensure SSDMobileNet upgrade was successful
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');
const SRC_DIR = path.join(__dirname, '..', 'src');

// Required SSDMobileNet files
const REQUIRED_SSD_FILES = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
];

// Required source files with SSDMobileNet integration
const REQUIRED_INTEGRATIONS = [
  {
    file: 'src/lib/faceApi.ts',
    checks: [
      'ssdMobilenetv1.loadFromUri',
      'SsdMobilenetv1Options',
      'ssdMobilenetLoaded',
      'getFaceDetector',
    ],
  },
  {
    file: 'src/utils/faceDetectionValidation.ts',
    checks: ['FaceApiService', 'validateSingleFace', 'confidence'],
  },
];

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFileContains(filePath, searchTerms) {
  if (!checkFileExists(filePath)) {
    return { exists: false, contains: {} };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const results = {};

  searchTerms.forEach((term) => {
    results[term] = content.includes(term);
  });

  return { exists: true, contains: results };
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024); // KB
  } catch {
    return 0;
  }
}

console.log('🔍 Verifying SSDMobileNet Face Detection Upgrade...\n');

// Check model files
console.log('📦 Checking SSDMobileNet Model Files:');
let allModelsPresent = true;

REQUIRED_SSD_FILES.forEach((fileName) => {
  const filePath = path.join(MODELS_DIR, fileName);
  const exists = checkFileExists(filePath);
  const size = exists ? getFileSize(filePath) : 0;

  console.log(
    `   ${exists ? '✅' : '❌'} ${fileName} ${exists ? `(${size} KB)` : '(missing)'}`,
  );

  if (!exists) {
    allModelsPresent = false;
  }
});

// Check source code integrations
console.log('\n🔧 Checking Source Code Integration:');
let allIntegrationsPresent = true;

REQUIRED_INTEGRATIONS.forEach(({ file, checks }) => {
  const filePath = path.join(__dirname, '..', file);
  const result = checkFileContains(filePath, checks);

  console.log(`   📄 ${file}:`);

  if (!result.exists) {
    console.log(`      ❌ File not found`);
    allIntegrationsPresent = false;
    return;
  }

  checks.forEach((check) => {
    const present = result.contains[check];
    console.log(`      ${present ? '✅' : '❌'} ${check}`);
    if (!present) {
      allIntegrationsPresent = false;
    }
  });
});

// Check package.json scripts
console.log('\n📋 Checking Package Scripts:');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageResult = checkFileContains(packageJsonPath, [
  'download-face-models',
  'test-face-detection',
]);

if (packageResult.exists) {
  console.log(
    `   ${packageResult.contains['download-face-models'] ? '✅' : '❌'} download-face-models script`,
  );
  console.log(
    `   ${packageResult.contains['test-face-detection'] ? '✅' : '❌'} test-face-detection script`,
  );
} else {
  console.log('   ❌ package.json not found');
  allIntegrationsPresent = false;
}

// Summary
console.log('\n📊 Verification Summary:');
console.log(
  `   Models: ${allModelsPresent ? '✅ All present' : '❌ Missing files'}`,
);
console.log(
  `   Integration: ${allIntegrationsPresent ? '✅ Complete' : '❌ Incomplete'}`,
);

// Model size summary
if (allModelsPresent) {
  const totalSize = REQUIRED_SSD_FILES.reduce((sum, fileName) => {
    const filePath = path.join(MODELS_DIR, fileName);
    return sum + getFileSize(filePath);
  }, 0);

  console.log(
    `   Total SSDMobileNet size: ${Math.round((totalSize / 1024) * 10) / 10} MB`,
  );
}

// Final status
const upgradeSuccessful = allModelsPresent && allIntegrationsPresent;

console.log(
  `\n${upgradeSuccessful ? '🎉' : '❌'} Upgrade Status: ${upgradeSuccessful ? 'SUCCESSFUL' : 'INCOMPLETE'}`,
);

if (upgradeSuccessful) {
  console.log(
    '\n✨ Your face detection system has been successfully upgraded to SSDMobileNet!',
  );
  console.log('   • Higher accuracy face detection');
  console.log('   • Better performance in various lighting conditions');
  console.log('   • Improved security with stricter validation');
  console.log('   • Automatic fallback to TinyFaceDetector if needed');
  console.log('\n🚀 Next steps:');
  console.log('   1. Test the upgrade with: npm run dev:web');
  console.log('   2. Try the join course flow with photo upload');
  console.log('   3. Open scripts/test-face-detection.html to test directly');
  console.log(
    '   4. Check browser console for "SSDMobileNetV1 loaded successfully"',
  );
} else {
  console.log(
    '\n⚠️  Some components are missing. Please check the errors above.',
  );
  console.log('   Run: npm run download-face-models');
  console.log('   Then verify the integration again.');
}

process.exit(upgradeSuccessful ? 0 : 1);
