const origExit = process.exit;
process.exit = function(code) {
  console.error('\n[DIAG] process.exit(' + code + ') called');
  console.error(new Error('stack').stack);
  // Don't actually exit, just log
  // origExit.call(this, code);
};

process.on('uncaughtException', (e) => {
  console.error('\n[DIAG] UNCAUGHT:', e.message);
  console.error(e.stack);
});

process.on('unhandledRejection', (r) => {
  console.error('\n[DIAG] REJECTION:', r);
});

console.log('[DIAG] Starting Next.js build...');
const { default: build } = require('next/dist/build');
console.log('[DIAG] Build function loaded, calling build()...');

build(process.cwd()).then(() => {
  console.log('\n[DIAG] BUILD SUCCESS');
  process.exit(0);
}).catch((e) => {
  console.error('\n[DIAG] BUILD FAILED:', e.message);
  console.error(e.stack);
  process.exit(1);
});
