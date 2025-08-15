#!/usr/bin/env node

/**
 * Script to download SSDMobileNetV1 model files for face-api.js
 * This will download the more accurate SSD MobileNet model files
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_BASE_URL =
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');

// SSDMobileNetV1 model files to download
const SSD_MODEL_FILES = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
];

// Face Landmark 68 model files (for better accuracy than tiny version)
const LANDMARK_MODEL_FILES = [
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
];

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${path.basename(filePath)}`);

    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download ${url}: ${response.statusCode}`),
          );
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${path.basename(filePath)}`);
          resolve();
        });

        file.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete the file on error
          reject(err);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

async function downloadModels() {
  try {
    // Ensure models directory exists
    if (!fs.existsSync(MODELS_DIR)) {
      fs.mkdirSync(MODELS_DIR, { recursive: true });
    }

    console.log('🚀 Starting SSDMobileNetV1 model download...\n');

    // Download SSDMobileNetV1 files
    console.log('📦 Downloading SSDMobileNetV1 model files...');
    for (const fileName of SSD_MODEL_FILES) {
      const url = `${MODEL_BASE_URL}/${fileName}`;
      const filePath = path.join(MODELS_DIR, fileName);

      // Skip if file already exists
      if (fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping existing file: ${fileName}`);
        continue;
      }

      await downloadFile(url, filePath);
    }

    // Download Face Landmark 68 files (if not already present)
    console.log('\n📦 Checking Face Landmark 68 model files...');
    for (const fileName of LANDMARK_MODEL_FILES) {
      const url = `${MODEL_BASE_URL}/${fileName}`;
      const filePath = path.join(MODELS_DIR, fileName);

      // Skip if file already exists
      if (fs.existsSync(filePath)) {
        console.log(`✓ Already exists: ${fileName}`);
        continue;
      }

      await downloadFile(url, filePath);
    }

    console.log('\n✅ All model files downloaded successfully!');
    console.log('\n📋 Model files in your project:');

    // List all model files
    const modelFiles = fs.readdirSync(MODELS_DIR).sort();
    modelFiles.forEach((file) => {
      const filePath = path.join(MODELS_DIR, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`   ${file} (${sizeKB} KB)`);
    });

    console.log(
      '\n🎉 Your face detection system is now upgraded to use SSDMobileNetV1!',
    );
    console.log(
      '   This provides much better accuracy for face detection and verification.',
    );
  } catch (error) {
    console.error('❌ Error downloading models:', error.message);
    process.exit(1);
  }
}

// Run the download
downloadModels();
