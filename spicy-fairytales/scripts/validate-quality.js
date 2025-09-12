
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
let violations = 0;

function runCommand(command, description) {
    try {
        console.log(`🔍 Checking ${description}...`);
        const result = execSync(command, { cwd: projectRoot, encoding: 'utf8' });
        return result.trim();
    } catch (error) {
        return '';
    }
}

function checkViolations(pattern, description, severity = 'error') {
    const result = runCommand(`grep -r "${pattern}" src/app/**/*.ts --include="*.ts" || true`, description);

    if (result) {
        const lines = result.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
            console.error(`❌ ${description} violations found:`);
            lines.forEach(line => console.error(`  ${line}`));
            violations += lines.length;
            return lines.length;
        }
    }

    console.log(`✅ ${description}: No violations found`);
    return 0;
}

async function run() {
    console.log('🚀 Starting Code Quality Validation...\n');

    // Check for explicit 'any' types
    checkViolations(': any', 'Explicit any types');

    // Check for console statements
    checkViolations('console\.', 'Console statements');

    // Check for TODO/FIXME comments
    checkViolations('TODO|FIXME|XXX|HACK', 'TODO/FIXME comments');

    // Check for long functions (simple heuristic)
    const longFunctions = runCommand(`grep -n "function\|=>" src/app/**/*.ts | wc -l`, 'Function count');
    console.log(`📊 Total functions found: ${longFunctions}`);

    // Check for large files
    const largeFiles = runCommand(`find src/app -name "*.ts" -exec wc -l {} + | sort -nr | head -5`, 'Largest files');
    console.log('📁 Largest TypeScript files:');
    console.log(largeFiles);

    console.log(`\n📈 Quality Validation Summary:`);
    console.log(`   - Explicit 'any' types: ${checkViolations(': any', 'any types', 'count')}`);
    console.log(`   - Console statements: ${checkViolations('console\.', 'console statements', 'count')}`);
    console.log(`   - TODO/FIXME comments: ${checkViolations('TODO|FIXME|XXX|HACK', 'todo comments', 'count')}`);

    if (violations > 0) {
        console.error(`\n❌ Found ${violations} quality violations.`);
        process.exit(1);
    } else {
        console.log('\n✅ Code quality checks passed!');
        process.exit(0);
    }
}

run().catch(error => {
    console.error('Error during quality validation:', error);
    process.exit(1);
});
