/**
 * Shared enumerations used across routes, controllers, and validation.
 * Extend these arrays when new values are needed — the validation middleware
 * picks them up automatically.
 */

const STATUSES = ['Pending', 'Completed'];

const PRIORITIES = ['High', 'Medium', 'Low'];

const CATEGORIES = [
  'Tax & Compliance',
  'Cross-border Compliance',
  'Payroll',
  'Sales Tax',
  'Fractional CFO',
  'FP&A',
  'Bookkeeping',
  'Incorporation',
];

module.exports = { STATUSES, PRIORITIES, CATEGORIES };
