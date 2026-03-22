/**
 * Task controller.
 * Contains all business logic for task-related endpoints.
 */

const db = require('../db/jsonDb');
const { CATEGORIES } = require('../constants/enums');

/**
 * Compute whether a task is overdue at query time.
 * Never stored in data.json — always derived fresh so it stays accurate.
 */
function withOverdue(task) {
  const today = new Date().toISOString().split('T')[0];
  return {
    ...task,
    is_overdue: task.status === 'Pending' && task.due_date < today,
  };
}

/** GET /api/clients/:id/tasks  (with optional ?status= and ?category= filters) */
function getTasksByClient(req, res) {
  const data = db.read();
  const client = data.clients.find((c) => c.id === req.params.id);

  if (!client) {
    return res.status(404).json({ error: `Client '${req.params.id}' not found.` });
  }

  let tasks = data.tasks.filter((t) => t.client_id === req.params.id);

  const { status, category } = req.query;
  if (status) tasks = tasks.filter((t) => t.status === status);
  if (category) tasks = tasks.filter((t) => t.category === category);

  res.json(tasks.map(withOverdue));
}

/** POST /api/tasks */
function createTask(req, res) {
  const { client_id, title, description, category, due_date, status, priority } = req.body;

  const data = db.read();
  const client = data.clients.find((c) => c.id === client_id);

  if (!client) {
    return res.status(404).json({ error: `Client '${client_id}' not found.` });
  }

  const newTask = {
    id: db.generateId('task'),
    client_id,
    title: title.trim(),
    description: description?.trim() || '',
    category,
    due_date,
    status: status || 'Pending',
    priority: priority || 'Medium',
    filing_form: null,
    penalty_if_late: null,
    notes: null,
  };

  data.tasks.push(newTask);
  db.write(data);

  res.status(201).json(withOverdue(newTask));
}

/** PATCH /api/tasks/:id */
function updateTaskStatus(req, res) {
  const data = db.read();
  const taskIndex = data.tasks.findIndex((t) => t.id === req.params.id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task '${req.params.id}' not found.` });
  }

  data.tasks[taskIndex].status = req.body.status;
  db.write(data);

  res.json(withOverdue(data.tasks[taskIndex]));
}

/** GET /api/categories */
function getCategories(req, res) {
  res.json(CATEGORIES);
}

module.exports = { getTasksByClient, createTask, updateTaskStatus, getCategories };
