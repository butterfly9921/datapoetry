const origExit = process.exit;
process.exit = function(code) {
  console.error('\n[DIAG] process.exit(' + code + ') called');
  console.error((new Error('stack')).stack);
  origExit.call(process, code);
};

process.on('exit', (code) => {
  console.error('\n[DIAG] === EXIT event, code:', code, '===');
});

process.on('beforeExit', (code) => {
  console.error('\n[DIAG] === BEFORE EXIT, code:', code, '===');
});

process.on('uncaughtException', (e) => {
  console.error('\n[DIAG] UNCAUGHT:', e.message);
  console.error(e.stack);
  process.exit(1);
});

process.on('unhandledRejection', (r) => {
  console.error('\n[DIAG] REJECTION:', r);
});

process.on('warning', (w) => {
  if (w.name === 'ExperimentalWarning') return;
  console.error('\n[DIAG] WARNING:', w.name, w.message);
});

console.log('[DIAG] Starting Next.js build...');
const build = require('next/dist/build').default;
console.log('[DIAG] Build function loaded, calling build()...');

build(process.cwd()).then(() => {
  console.log('\n[DIAG] BUILD SUCCESS');
  process.exit(0);
}).catch((e) => {
  console.error('\n[DIAG] BUILD FAILED:', e.message);
  console.error(e.stack);
  process.exit(1);
});
