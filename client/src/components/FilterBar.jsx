const STATUSES = ['Pending', 'Completed']

export default function FilterBar({ filters, onFilterChange, categories, taskCounts }) {
  const handleChange = (key, value) => {
    onFilterChange((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="filter-bar">
      <div className="filter-bar__controls">
        <label className="filter-bar__label">
          Status
          <select
            className="filter-bar__select"
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="filter-bar__label">
          Category
          <select
            className="filter-bar__select"
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        {(filters.status || filters.category) && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => onFilterChange({ status: '', category: '' })}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="filter-bar__stats">
        <span className="stat stat--overdue">
          <span className="stat__dot" />
          {taskCounts.overdue} Overdue
        </span>
        <span className="stat stat--pending">
          <span className="stat__dot" />
          {taskCounts.pending} Pending
        </span>
        <span className="stat stat--completed">
          <span className="stat__dot" />
          {taskCounts.completed} Completed
        </span>
      </div>
    </div>
  )
}
