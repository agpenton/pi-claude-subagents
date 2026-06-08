const fs = require('fs');
const path = require('path');

const srcDir = './src';
const distDir = './dist';

// Create dist directory
fs.mkdirSync(distDir, { recursive: true });

// Helper to get all JS/TS files recursively, flattening structure
const getAllFilesFlat = (dir, prefix = '') => {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    if (item === 'node_modules' || item === '__tests__' || item === 'dist') return;
    
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
       const subFiles = getAllFilesFlat(fullPath, `${prefix}${item}/`);
       files.push(...subFiles);
     } else if (item.endsWith('.js') || item.endsWith('.ts')) {
       // Flatten: keep only filename, not full path
       files.push({ src: fullPath, name: item });
     }
   });
  
  return files;
};

// Copy files
const files = getAllFilesFlat(srcDir);
files.forEach(file => {
  const content = fs.readFileSync(file.src, 'utf8');
  const baseName = file.name.endsWith('.ts') 
     ? file.name.replace('.ts', '.js') 
     : file.name;
  
  fs.writeFileSync(path.join(distDir, baseName), content);
  console.log(`Copied: ${file.name} -> ${baseName}`);
});

// Create package.json in dist
const pkgJson = {
  "name": "@agpenton/pi-claude-subagents",
  "version": "0.1.6",  
  "description": "A Pi.dev extension that brings Claude Code-style autonomous sub-agents to pi.",
  "author": "agpenton",
  "license": "MIT",
  "main": "index.js",
  "files": ["index.js"]
};

fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pkgJson, null, 2));
console.log('\nBuild complete!');
