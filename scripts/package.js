import fs from 'fs';
import archiver from 'archiver';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');
const outputPath = path.join(distPath, 'extension.zip');

if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found. Please run "npm run build" first.');
  process.exit(1);
}

const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ Extension packaged successfully!`);
  console.log(`📦 Size: ${sizeInMB} MB (${archive.pointer()} bytes)`);
  console.log(`📍 Location: ${outputPath}`);
});

archive.on('error', (err) => {
  console.error('❌ Error creating package:', err);
  process.exit(1);
});

archive.pipe(output);

const filesToExclude = ['extension.zip'];
const filesToPackage = fs.readdirSync(distPath).filter((file) => !filesToExclude.includes(file));

filesToPackage.forEach((file) => {
  const filePath = path.join(distPath, file);
  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) {
    archive.directory(filePath, file);
  } else {
    archive.file(filePath, { name: file });
  }
});

archive.finalize();

