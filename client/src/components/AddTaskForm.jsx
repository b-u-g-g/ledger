import { useState } from 'react'
import { createTask } from '../api'

const PRIORITIES = ['High', 'Medium', 'Low']

const INITIAL_STATE = {
  title: '',
  description: '',
  category: '',
  due_date: '',
  priority: 'Medium',
  status: 'Pending',
}

export default function AddTaskForm({ clientId, categories, onTaskAdded, onClose }) {
  const [form, setForm] = useState(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const newTask = await createTask({ ...form, client_id: clientId })
      onTaskAdded(newTask)
      setForm(INITIAL_STATE)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-panel">
      <div className="form-panel__header">
        <h3 className="form-panel__title">Add New Task</h3>
        <button className="btn btn--ghost btn--icon" onClick={onClose} title="Close">✕</button>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      <form className="task-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-label">
            Title <span className="form-required">*</span>
            <input
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Delaware Franchise Tax Filing"
              required
            />
          </label>
        </div>

        <div className="form-row form-row--2col">
          <label className="form-label">
            Category <span className="form-required">*</span>
            <select
              className="form-input"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Due Date <span className="form-required">*</span>
            <input
              className="form-input"
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-row form-row--2col">
          <label className="form-label">
            Priority
            <select className="form-input" name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          <label className="form-label">
            Status
            <select className="form-input" name="status" value={form.status} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label className="form-label">
            Description
            <textarea
              className="form-input form-input--textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Details about this filing, deadlines, notes…"
              rows={3}
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  )
}
