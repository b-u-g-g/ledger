/**
 * Request validation middleware.
 * Each exported function returns an Express middleware that validates
 * req.body or req.params and calls next() or passes a structured error.
 */

const { STATUSES, PRIORITIES, CATEGORIES } = require('../constants/enums');

/** Validate body for POST /api/tasks */
function validateCreateTask(req, res, next) {
  const { client_id, title, category, due_date, status, priority } = req.body;

  const missing = [];
  if (!client_id) missing.push('client_id');
  if (!title || !String(title).trim()) missing.push('title');
  if (!category) missing.push('category');
  if (!due_date) missing.push('due_date');

  if (missing.length) {
    return res.status(400).json({
      error: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return res.status(400).json({ error: 'due_date must be in YYYY-MM-DD format.' });
  }

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`,
    });
  }

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${STATUSES.join(', ')}`,
    });
  }

  if (priority && !PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: `Invalid priority. Must be one of: ${PRIORITIES.join(', ')}`,
    });
  }

  next();
}

/** Validate body for PATCH /api/tasks/:id */
function validateUpdateTask(req, res, next) {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Request body must include a status field.' });
  }

  if (!STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${STATUSES.join(', ')}`,
    });
  }

  next();
}

/** Validate query params for GET /api/clients/:id/tasks */
function validateTaskFilters(req, res, next) {
  const { status, category } = req.query;

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status filter. Must be one of: ${STATUSES.join(', ')}`,
    });
  }

  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `Invalid category filter. Must be one of: ${CATEGORIES.join(', ')}`,
    });
  }

  next();
}

module.exports = { validateCreateTask, validateUpdateTask, validateTaskFilters };
