/**
 * Express application setup.
 * Wires together middleware and routes — no server.listen() here.
 * Keeping app and server separate makes the app testable in isolation.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const clientRoutes = require('./routes/clients');
const taskRoutes = require('./routes/tasks');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);

// ─── Static Frontend (populated after `npm run build`) ───────────────────────
// client/ is at the repo root, one level up from server/
const CLIENT_BUILD = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_BUILD)) {
  app.use(express.static(CLIENT_BUILD));
  // SPA fallback — let React Router handle all non-API paths
  app.get('*', (req, res) => res.sendFile(path.join(CLIENT_BUILD, 'index.html')));
} else {
  // Dev-mode root: show available endpoints
  app.get('/', (req, res) => {
    res.json({
      message: 'LedgersCFO Compliance Tracker API is running.',
      version: '1.0.0',
      endpoints: {
        'GET  /api/clients':          'List all clients',
        'GET  /api/clients/:id':      'Get a single client',
        'GET  /api/clients/:id/tasks':'Get tasks for a client  (?status= &category=)',
        'POST /api/tasks':            'Create a new task',
        'PATCH /api/tasks/:id':       'Update task status',
        'GET  /api/tasks/categories': 'List valid categories',
      },
    });
  });
}

// ─── 404 for unknown API routes ───────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route '${req.method} ${req.originalUrl}' not found.` });
});

// ─── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;
