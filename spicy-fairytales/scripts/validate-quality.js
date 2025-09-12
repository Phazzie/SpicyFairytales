
const { ESLint } = require('eslint');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
let violations = 0;

async function run() {
    const eslint = new ESLint({
        overrideConfig: {
            parserOptions: {
                project: path.join(projectRoot, 'tsconfig.json'),
            },
            rules: {
                'no-explicit-any': 'error',
                'complexity': ['error', 10],
                'no-console': 'warn',
            },
        },
        useEslintrc: false,
    });

    const results = await eslint.lintFiles(['src/app/**/*.ts']);
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    if (resultText) {
        console.error('❌ Quality violations found:');
        console.error(resultText);
        violations = results.reduce((acc, r) => acc + r.errorCount, 0);
    }

    if (violations > 0) {
        console.error(`\nFound ${violations} critical quality violations.`);
        process.exit(1);
    } else {
        console.log('✅ Code quality checks passed.');
        process.exit(0);
    }
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
