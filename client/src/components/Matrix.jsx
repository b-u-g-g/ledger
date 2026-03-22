import { useState, useEffect } from 'react'
import { getClients, getTasksByClient } from '../api'

const CATEGORIES = [
  'Tax & Compliance',
  'Payroll',
  'Sales Tax',
  'Cross-border Compliance',
  'Fractional CFO',
  'FP&A',
  'Bookkeeping',
  'Incorporation',
]

const CATEGORY_SHORT = {
  'Tax & Compliance':       'Tax',
  'Payroll':                'Payroll',
  'Sales Tax':              'Sales Tax',
  'Cross-border Compliance':'Cross-border',
  'Fractional CFO':         'Frac. CFO',
  'FP&A':                   'FP&A',
  'Bookkeeping':            'Bookkeeping',
  'Incorporation':          'Incorporation',
}

const CATEGORY_ICON = {
  'Tax & Compliance':       '🏛️',
  'Payroll':                '💼',
  'Sales Tax':              '🧾',
  'Cross-border Compliance':'🌐',
  'Fractional CFO':         '📊',
  'FP&A':                   '📈',
  'Bookkeeping':            '📒',
  'Incorporation':          '🏢',
}

function CellContent({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return <span className="matrix-cell__empty">—</span>
  }

  const overdue    = tasks.filter((t) => t.is_overdue).length
  const completed  = tasks.filter((t) => t.status === 'Completed').length
  const pending    = tasks.filter((t) => t.status === 'Pending' && !t.is_overdue).length

  let cls = 'matrix-cell__pill'
  if (overdue)   cls += ' matrix-cell__pill--overdue'
  else if (completed === tasks.length) cls += ' matrix-cell__pill--done'
  else            cls += ' matrix-cell__pill--pending'

  return (
    <div className={cls}>
      {overdue   > 0 && <span title="Overdue">🔴 {overdue}</span>}
      {pending   > 0 && <span title="Pending">🟡 {pending}</span>}
      {completed > 0 && <span title="Completed">✅ {completed}</span>}
    </div>
  )
}

export default function Matrix() {
  const [clients, setClients]   = useState([])
  const [taskMap, setTaskMap]   = useState({})   // { clientId: [tasks] }
  const [loading, setLoading]   = useState(true)
  const [tooltip, setTooltip]   = useState(null) // { clientId, category, tasks, x, y }

  useEffect(() => {
    async function load() {
      const allClients = await getClients()
      setClients(allClients)

      const entries = await Promise.all(
        allClients.map(async (c) => {
          const tasks = await getTasksByClient(c.id)
          return [c.id, tasks]
        })
      )
      setTaskMap(Object.fromEntries(entries))
      setLoading(false)
    }
    load()
  }, [])

  // Summary counts across all clients
  const allTasks   = Object.values(taskMap).flat()
  const totalOverdue   = allTasks.filter((t) => t.is_overdue).length
  const totalPending   = allTasks.filter((t) => t.status === 'Pending' && !t.is_overdue).length
  const totalCompleted = allTasks.filter((t) => t.status === 'Completed').length

  const handleCellEnter = (e, clientId, category) => {
    const tasks = (taskMap[clientId] || []).filter((t) => t.category === category)
    if (!tasks.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ clientId, category, tasks, x: rect.left, y: rect.bottom + 6 })
  }

  return (
    <div className="matrix-page" onClick={() => setTooltip(null)}>
      {/* Summary bar */}
      <div className="matrix-summary">
        <div className="matrix-summary__card matrix-summary__card--overdue">
          <span className="matrix-summary__num">{totalOverdue}</span>
          <span className="matrix-summary__lbl">Overdue</span>
        </div>
        <div className="matrix-summary__card matrix-summary__card--pending">
          <span className="matrix-summary__num">{totalPending}</span>
          <span className="matrix-summary__lbl">Pending</span>
        </div>
        <div className="matrix-summary__card matrix-summary__card--done">
          <span className="matrix-summary__num">{totalCompleted}</span>
          <span className="matrix-summary__lbl">Completed</span>
        </div>
        <div className="matrix-summary__card">
          <span className="matrix-summary__num">{allTasks.length}</span>
          <span className="matrix-summary__lbl">Total Tasks</span>
        </div>
      </div>

      {loading ? (
        <div className="state-message">Loading matrix…</div>
      ) : (
        <div className="matrix-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th className="matrix-table__corner">Client</th>
                {CATEGORIES.map((cat) => (
                  <th key={cat} className="matrix-table__col-head">
                    <span className="matrix-table__cat-icon">{CATEGORY_ICON[cat]}</span>
                    <span className="matrix-table__cat-label">{CATEGORY_SHORT[cat]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="matrix-table__row">
                  <td className="matrix-table__row-head">
                    <div className="matrix-table__client-name">
                      {client.dba || client.company_name}
                    </div>
                    <div className="matrix-table__client-type">{client.entity_type}</div>
                  </td>
                  {CATEGORIES.map((cat) => {
                    const tasks = (taskMap[client.id] || []).filter((t) => t.category === cat)
                    const hasOverdue = tasks.some((t) => t.is_overdue)
                    const allDone = tasks.length > 0 && tasks.every((t) => t.status === 'Completed')
                    let cellMod = ''
                    if (tasks.length === 0) cellMod = 'matrix-cell--empty'
                    else if (hasOverdue)    cellMod = 'matrix-cell--overdue'
                    else if (allDone)       cellMod = 'matrix-cell--done'
                    else                    cellMod = 'matrix-cell--pending'

                    return (
                      <td
                        key={cat}
                        className={`matrix-cell ${cellMod}`}
                        onMouseEnter={(e) => handleCellEnter(e, client.id, cat)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <CellContent tasks={tasks} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hover tooltip */}
      {tooltip && tooltip.tasks.length > 0 && (
        <div
          className="matrix-tooltip"
          style={{ top: tooltip.y, left: tooltip.x }}
          onMouseEnter={() => setTooltip(tooltip)}
          onMouseLeave={() => setTooltip(null)}
        >
          <p className="matrix-tooltip__head">{tooltip.category}</p>
          {tooltip.tasks.map((t) => (
            <div key={t.id} className="matrix-tooltip__row">
              <span className={`matrix-tooltip__dot ${t.is_overdue ? 'dot--overdue' : t.status === 'Completed' ? 'dot--done' : 'dot--pending'}`} />
              <span className="matrix-tooltip__title">{t.title}</span>
              <span className="matrix-tooltip__date">{t.due_date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="matrix-legend">
        <span className="legend-item"><span className="legend-dot legend-dot--overdue" /> Overdue</span>
        <span className="legend-item"><span className="legend-dot legend-dot--pending" /> Pending</span>
        <span className="legend-item"><span className="legend-dot legend-dot--done" /> All complete</span>
        <span className="legend-item"><span className="legend-dot legend-dot--empty" /> No tasks</span>
      </div>
    </div>
  )
}
