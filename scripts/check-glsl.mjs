import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const targetDir = path.join(rootDir, 'src', 'components', 'scene');

let totalErrors = 0;
let totalCheckedShaders = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match template strings using backtick
  const parts = content.split('`');
  if (parts.length < 2) return;

  let currentLine = 1;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const linesInPart = part.split('\n').length - 1;

    // Odd indexed parts are the contents of template literals: `...`
    if (i % 2 === 1) {
      // Check if this looks like GLSL code
      const isGLSL =
        part.includes('void main()') ||
        part.includes('gl_Position') ||
        part.includes('gl_FragColor') ||
        part.includes('precision highp float') ||
        part.includes('attribute vec') ||
        part.includes('varying vec');

      if (isGLSL) {
        totalCheckedShaders++;
        const errs = validateBraces(part, filePath, currentLine);
        if (errs.length > 0) {
          totalErrors += errs.length;
          for (const err of errs) {
            console.error(`❌ [GLSL Error] ${path.relative(rootDir, filePath)}:${err.line} - ${err.message}`);
          }
        }
      }
    }

    currentLine += linesInPart;
  }
}

function validateBraces(code, filePath, baseLine) {
  const errors = [];
  const lines = code.split('\n');
  const stack = [];

  let inBlockComment = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineNum = baseLine + lineIdx;

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      const nextChar = line[charIdx + 1];

      // Handle comments
      if (inBlockComment) {
        if (char === '*' && nextChar === '/') {
          inBlockComment = false;
          charIdx++;
        }
        continue;
      }

      if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        charIdx++;
        continue;
      }

      if (char === '/' && nextChar === '/') {
        // Line comment, skip rest of line
        break;
      }

      // Ignore string literals inside shaders if any
      if (char === '"' || char === "'") {
        continue;
      }

      // Match braces, brackets, parentheses
      if (char === '{' || char === '(' || char === '[') {
        stack.push({ char, line: lineNum, col: charIdx + 1 });
      } else if (char === '}' || char === ')' || char === ']') {
        if (stack.length === 0) {
          errors.push({
            line: lineNum,
            message: `Unexpected closing '${char}' without opening match.`,
          });
        } else {
          const top = stack.pop();
          const expected = top.char === '{' ? '}' : top.char === '(' ? ')' : ']';
          if (char !== expected) {
            errors.push({
              line: lineNum,
              message: `Mismatched bracket: opened '${top.char}' at line ${top.line}, but closed with '${char}'.`,
            });
          }
        }
      }
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop();
    errors.push({
      line: unclosed.line,
      message: `Unclosed bracket '${unclosed.char}' opened at line ${unclosed.line}:${unclosed.col}.`,
    });
  }

  return errors;
}

console.log('🔍 Scanning GLSL shaders in src/components/scene...');
scanDir(targetDir);

if (totalErrors > 0) {
  console.error(`\n❌ Failed: Found ${totalErrors} GLSL syntax/bracket error(s) across ${totalCheckedShaders} shaders checked.`);
  process.exit(1);
} else {
  console.log(`\n✅ Success: All ${totalCheckedShaders} GLSL shaders passed bracket and syntax balance verification (0 errors).`);
}
