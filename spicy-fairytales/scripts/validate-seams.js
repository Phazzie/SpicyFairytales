
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const componentsDir = path.join(projectRoot, 'src', 'app', 'features');
const contractsPath = path.join(projectRoot, 'src', 'app', 'shared', 'contracts.ts');

let violations = 0;

function findViolations(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findViolations(fullPath);
        } else if (fullPath.endsWith('.component.ts')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const sourceFile = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true);

            ts.forEachChild(sourceFile, node => {
                if (ts.isImportDeclaration(node)) {
                    const moduleSpecifier = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, '');
                    const resolvedPath = path.resolve(path.dirname(fullPath), moduleSpecifier) + '.ts';

                    if (resolvedPath !== contractsPath && moduleSpecifier.includes('service')) {
                        console.error(`❌ VIOLATION: Component [${path.basename(fullPath)}] directly imports a service: ${moduleSpecifier}`);
                        violations++;
                    }
                }
            });
        }
    }
}

console.log('🔍 Running seam validation...');
findViolations(componentsDir);

if (violations === 0) {
    console.log('✅ All components respect the architecture seams.');
    process.exit(0);
} else {
    console.error(`\nFound ${violations} seam violations. Components should only import from contracts.ts.`);
    process.exit(1);
}
