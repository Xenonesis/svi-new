/* global process, console */
import fs from 'fs';
import path from 'path';
import heicConvert from 'heic-convert';

const publicDir = path.join(process.cwd(), 'public');
const dirs = [path.join(publicDir, 'Shivani Vatika'), path.join(publicDir, 'Shayam angan')];

async function convertHeicFiles() {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      console.log(`Directory does not exist: ${dir}`);
      continue;
    }

    console.log(`Scanning directory: ${dir}`);
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (path.extname(file).toLowerCase() === '.heic') {
        const inputPath = path.join(dir, file);
        const baseName = path.basename(file, path.extname(file));
        const outputPath = path.join(dir, `${baseName}.jpg`);

        console.log(`Converting: ${file} -> ${baseName}.jpg...`);
        try {
          const inputBuffer = fs.readFileSync(inputPath);
          const outputBuffer = await heicConvert({
            buffer: inputBuffer,
            format: 'JPEG',
            quality: 0.85,
          });

          fs.writeFileSync(outputPath, outputBuffer);
          console.log(`Successfully converted: ${outputPath}`);

          // Delete the original HEIC file
          fs.unlinkSync(inputPath);
          console.log(`Deleted original HEIC file: ${inputPath}`);
        } catch (err) {
          console.error(`Failed to convert ${file}:`, err);
        }
      }
    }
  }
  console.log('Finished converting HEIC files.');
}

convertHeicFiles();
