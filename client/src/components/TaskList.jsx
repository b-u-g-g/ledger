import { useState } from 'react'
import FilterBar from './FilterBar'
import TaskCard from './TaskCard'
import AddTaskForm from './AddTaskForm'

export default function TaskList({
  client,
  tasks,
  allTasks,
  categories,
  filters,
  onFilterChange,
  onTasksChange,
  loading,
}) {
  const [showForm, setShowForm] = useState(false)

  // Stats computed from all tasks (not filtered) so numbers stay accurate
  const taskCounts = {
    overdue: allTasks.filter((t) => t.is_overdue).length,
    pending: allTasks.filter((t) => t.status === 'Pending' && !t.is_overdue).length,
    completed: allTasks.filter((t) => t.status === 'Completed').length,
  }

  const handleStatusChange = (updatedTask) => {
    onTasksChange((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    )
  }

  const handleTaskAdded = (newTask) => {
    onTasksChange((prev) => [newTask, ...prev])
  }

  return (
    <div className="task-panel">
      <div className="task-panel__header">
        <div>
          <h2 className="task-panel__client-name">{client.company_name}</h2>
          <span className="task-panel__entity-type">{client.entity_type} · {client.country}</span>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? '✕ Cancel' : '+ Add Task'}
        </button>
      </div>

      {showForm && (
        <AddTaskForm
          clientId={client.id}
          categories={categories}
          onTaskAdded={handleTaskAdded}
          onClose={() => setShowForm(false)}
        />
      )}

      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        categories={categories}
        taskCounts={taskCounts}
      />

      {loading ? (
        <div className="state-message">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="state-message">
          {filters.status || filters.category
            ? 'No tasks match the current filters.'
            : 'No tasks yet for this client.'}
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
