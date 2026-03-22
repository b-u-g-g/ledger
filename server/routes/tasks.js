/**
 * Task routes.
 * Mounts under /api/tasks in app.js.
 */

const { Router } = require('express');
const { createTask, updateTaskStatus, getCategories } = require('../controllers/taskController');
const { validateCreateTask, validateUpdateTask } = require('../middleware/validate');

const router = Router();

router.get('/categories', getCategories);
router.post('/', validateCreateTask, createTask);
router.patch('/:id', validateUpdateTask, updateTaskStatus);

module.exports = router;
