/**
 * Server entry point.
 * Only responsible for starting the HTTP server.
 * All app logic lives in app.js.
 */

const app = require('./app');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`\n  LedgersCFO Compliance Tracker`);
  console.log(`  API running at http://localhost:${PORT}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  [ERROR] Port ${PORT} is already in use.`);
    console.error(`  Fix: run  npx kill-port ${PORT}  then restart.\n`);
  } else {
    console.error('\n  [ERROR] Server failed to start:', err.message);
  }
  process.exit(1);
});
