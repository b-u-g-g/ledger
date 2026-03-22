/**
 * Client controller.
 * Contains all business logic for client-related endpoints.
 * No Express res/req details leak into the DB layer; no DB details leak upward.
 */

const db = require('../db/jsonDb');

/** GET /api/clients */
function getAllClients(req, res) {
  const { clients } = db.read();
  res.json(clients);
}

/** GET /api/clients/:id */
function getClientById(req, res) {
  const { clients } = db.read();
  const client = clients.find((c) => c.id === req.params.id);

  if (!client) {
    return res.status(404).json({ error: `Client '${req.params.id}' not found.` });
  }

  res.json(client);
}

module.exports = { getAllClients, getClientById };
