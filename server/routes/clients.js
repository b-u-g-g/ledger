/**
 * Client routes.
 * Mounts under /api/clients in app.js.
 */

const { Router } = require('express');
const { getAllClients, getClientById } = require('../controllers/clientController');
const { getTasksByClient } = require('../controllers/taskController');
const { validateTaskFilters } = require('../middleware/validate');

const router = Router();

router.get('/', getAllClients);
router.get('/:id', getClientById);
router.get('/:id/tasks', validateTaskFilters, getTasksByClient);

module.exports = router;
