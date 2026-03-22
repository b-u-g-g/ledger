import { useState } from 'react'
import { updateTaskStatus } from '../api'

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const PRIORITY_CLASS = {
  High: 'badge--priority-high',
  Medium: 'badge--priority-medium',
  Low: 'badge--priority-low',
}

const CATEGORY_ICONS = {
  'Tax & Compliance': '🏛️',
  'Cross-border Compliance': '🌐',
  'Payroll': '💼',
  'Sales Tax': '🧾',
  'Fractional CFO': '📊',
  'FP&A': '📈',
  'Bookkeeping': '📒',
  'Incorporation': '🏢',
}

export default function TaskCard({ task, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  const isOverdue = task.is_overdue
  const isCompleted = task.status === 'Completed'
  const nextStatus = isCompleted ? 'Pending' : 'Completed'

  const handleToggle = async () => {
    setUpdating(true)
    try {
      const updated = await updateTaskStatus(task.id, nextStatus)
      onStatusChange(updated)
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const shortDesc = task.description?.length > 120
    ? task.description.slice(0, 120) + '…'
    : task.description

  return (
    <div className={`task-card ${isOverdue ? 'task-card--overdue' : ''} ${isCompleted ? 'task-card--completed' : ''}`}>
      <div className="task-card__header">
        <div className="task-card__title-row">
          <span className="task-card__icon">{CATEGORY_ICONS[task.category] || '📋'}</span>
          <span className="task-card__title">{task.title}</span>
          {isOverdue && <span className="badge badge--overdue">Overdue</span>}
        </div>

        <div className="task-card__meta">
          <span className="task-card__category">{task.category}</span>
          <span className="task-card__separator">·</span>
          <span className={`task-card__due ${isOverdue ? 'task-card__due--late' : ''}`}>
            Due {formatDate(task.due_date)}
          </span>
          <span className="task-card__separator">·</span>
          <span className={`badge ${PRIORITY_CLASS[task.priority]}`}>{task.priority}</span>
          <span className="task-card__separator">·</span>
          <span className={`badge ${isCompleted ? 'badge--completed' : 'badge--pending'}`}>
            {task.status}
          </span>
        </div>
      </div>

      {task.description && (
        <div className="task-card__desc">
          <p>{expanded ? task.description : shortDesc}</p>
          {task.description.length > 120 && (
            <button className="btn btn--link" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {task.penalty_if_late && (
        <div className="task-card__penalty">
          ⚠️ Penalty: {task.penalty_if_late}
        </div>
      )}

      <div className="task-card__footer">
        {task.filing_form && (
          <span className="task-card__form-tag">Form: {task.filing_form}</span>
        )}
        <button
          className={`btn btn--sm ${isCompleted ? 'btn--ghost' : 'btn--primary'}`}
          onClick={handleToggle}
          disabled={updating}
        >
          {updating ? 'Saving…' : isCompleted ? 'Mark as Pending' : 'Mark as Complete'}
        </button>
      </div>
    </div>
  )
}
