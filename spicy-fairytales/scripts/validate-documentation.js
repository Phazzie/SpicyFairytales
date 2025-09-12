
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src', 'app');
const requiredHeader = '## Architecture Context';
let violations = 0;

function validateFile(filePath) {
    if (!filePath.endsWith('.ts')) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes(requiredHeader)) {
        console.error(`❌ VIOLATION: File [${path.relative(projectRoot, filePath)}] is missing the required top-level documentation comment.`);
        violations++;
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else {
            validateFile(fullPath);
        }
    }
}

console.log('🔍 Running documentation validation...');
traverse(srcDir);

if (violations === 0) {
    console.log('✅ All source files have the required documentation headers.');
    process.exit(0);
} else {
    console.error(`\nFound ${violations} documentation violations.`);
    process.exit(1);
}
