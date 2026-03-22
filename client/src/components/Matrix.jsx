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
  'Tax & Compliance':        'Tax',
  'Payroll':                 'Payroll',
  'Sales Tax':               'Sales Tax',
  'Cross-border Compliance': 'Cross-border',
  'Fractional CFO':          'Frac. CFO',
  'FP&A':                    'FP&A',
  'Bookkeeping':             'Bookkeeping',
  'Incorporation':           'Incorporation',
}

const CATEGORY_ICON = {
  'Tax & Compliance':        '🏛️',
  'Payroll':                 '💼',
  'Sales Tax':               '🧾',
  'Cross-border Compliance': '🌐',
  'Fractional CFO':          '📊',
  'FP&A':                    '📈',
  'Bookkeeping':             '📒',
  'Incorporation':           '🏢',
}

function CellContent({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return <span className="matrix-cell__empty">—</span>
  }

  const overdue   = tasks.filter((t) => t.is_overdue).length
  const completed = tasks.filter((t) => t.status === 'Completed').length
  const pending   = tasks.filter((t) => t.status === 'Pending' && !t.is_overdue).length

  let cls = 'matrix-cell__pill'
  if (overdue)                      cls += ' matrix-cell__pill--overdue'
  else if (completed === tasks.length) cls += ' matrix-cell__pill--done'
  else                              cls += ' matrix-cell__pill--pending'

  return (
    <div className={cls}>
      {overdue   > 0 && <span title="Overdue">🔴 {overdue}</span>}
      {pending   > 0 && <span title="Pending">🟡 {pending}</span>}
      {completed > 0 && <span title="Completed">✅ {completed}</span>}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function cellText(tasks) {
  if (!tasks || !tasks.length) return '—'
  const overdue   = tasks.filter((t) => t.is_overdue).length
  const completed = tasks.filter((t) => t.status === 'Completed').length
  const pending   = tasks.filter((t) => t.status === 'Pending' && !t.is_overdue).length
  return [
    overdue   ? `${overdue} Overdue`   : '',
    pending   ? `${pending} Pending`   : '',
    completed ? `${completed} Done`    : '',
  ].filter(Boolean).join(' / ')
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function todayLong() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Matrix() {
  const [clients, setClients]   = useState([])
  const [taskMap, setTaskMap]   = useState({})
  const [loading, setLoading]   = useState(true)
  const [tooltip, setTooltip]   = useState(null)
  const [exporting, setExporting] = useState(null)  // 'pdf' | 'excel' | null
  const [shareMsg, setShareMsg]   = useState('')     // toast text

  useEffect(() => {
    async function load() {
      const allClients = await getClients()
      setClients(allClients)
      const entries = await Promise.all(
        allClients.map(async (c) => [c.id, await getTasksByClient(c.id)])
      )
      setTaskMap(Object.fromEntries(entries))
      setLoading(false)
    }
    load()
  }, [])

  const allTasks       = Object.values(taskMap).flat()
  const totalOverdue   = allTasks.filter((t) => t.is_overdue).length
  const totalPending   = allTasks.filter((t) => t.status === 'Pending' && !t.is_overdue).length
  const totalCompleted = allTasks.filter((t) => t.status === 'Completed').length

  // ── PDF export ─────────────────────────────────────────────────────────────

  const downloadPDF = async () => {
    setExporting('pdf')
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      // Title
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text('Compliance Matrix', 14, 16)
      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(100)
      doc.text(`LedgersCFO  ·  Generated ${todayLong()}`, 14, 23)
      doc.setTextColor(0)

      // Summary strip
      doc.setFontSize(8)
      doc.text(`Total: ${allTasks.length}   Overdue: ${totalOverdue}   Pending: ${totalPending}   Completed: ${totalCompleted}`, 14, 29)

      autoTable(doc, {
        startY: 33,
        head: [['Client', 'Entity', ...CATEGORIES.map((c) => CATEGORY_SHORT[c])]],
        body: clients.map((client) => [
          client.dba || client.company_name,
          client.entity_type,
          ...CATEGORIES.map((cat) =>
            cellText((taskMap[client.id] || []).filter((t) => t.category === cat))
          ),
        ]),
        styles:     { fontSize: 7.5, cellPadding: 2.5, overflow: 'linebreak' },
        headStyles: { fillColor: [26, 26, 26], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 28 },
          1: { cellWidth: 26, textColor: [100, 100, 100] },
        },
        didParseCell: (data) => {
          if (data.section !== 'body' || data.column.index < 2) return
          const txt = data.cell.text.join('')
          if (txt.includes('Overdue')) {
            data.cell.styles.fillColor   = [253, 237, 235]
            data.cell.styles.textColor   = [192, 57, 43]
            data.cell.styles.fontStyle   = 'bold'
          } else if (!txt.includes('Pending') && txt.includes('Done')) {
            data.cell.styles.fillColor = [240, 250, 245]
            data.cell.styles.textColor = [45, 106, 79]
          } else if (txt.includes('Pending')) {
            data.cell.styles.fillColor = [255, 251, 235]
          }
        },
      })

      doc.save(`compliance-matrix-${todayStr()}.pdf`)
    } finally {
      setExporting(null)
    }
  }

  // ── Excel export ───────────────────────────────────────────────────────────

  const downloadExcel = async () => {
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')

      // Sheet 1 — Matrix
      const header = ['Client', 'Entity Type', ...CATEGORIES]
      const rows = clients.map((client) => {
        const row = [client.dba || client.company_name, client.entity_type]
        CATEGORIES.forEach((cat) =>
          row.push(cellText((taskMap[client.id] || []).filter((t) => t.category === cat)))
        )
        return row
      })

      const wsMatrix = XLSX.utils.aoa_to_sheet([header, ...rows])
      wsMatrix['!cols'] = [
        { wch: 22 }, { wch: 28 },
        ...CATEGORIES.map(() => ({ wch: 16 })),
      ]

      // Sheet 2 — Summary
      const wsSummary = XLSX.utils.aoa_to_sheet([
        ['LedgersCFO — Compliance Matrix Snapshot'],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ['Metric',       'Count'],
        ['Total Tasks',  allTasks.length],
        ['Overdue',      totalOverdue],
        ['Pending',      totalPending],
        ['Completed',    totalCompleted],
        ['Clients',      clients.length],
      ])
      wsSummary['!cols'] = [{ wch: 24 }, { wch: 10 }]

      // Sheet 3 — All tasks flat
      const taskHeader = ['Client', 'Category', 'Title', 'Due Date', 'Status', 'Priority', 'Overdue']
      const taskRows = clients.flatMap((client) =>
        (taskMap[client.id] || []).map((t) => [
          client.dba || client.company_name,
          t.category,
          t.title,
          t.due_date,
          t.status,
          t.priority,
          t.is_overdue ? 'Yes' : 'No',
        ])
      )
      const wsTasks = XLSX.utils.aoa_to_sheet([taskHeader, ...taskRows])
      wsTasks['!cols'] = [
        { wch: 20 }, { wch: 22 }, { wch: 46 },
        { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 8 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, wsMatrix,  'Compliance Matrix')
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')
      XLSX.utils.book_append_sheet(wb, wsTasks,   'All Tasks')

      XLSX.writeFile(wb, `compliance-matrix-${todayStr()}.xlsx`)
    } finally {
      setExporting(null)
    }
  }

  // ── Share ──────────────────────────────────────────────────────────────────

  const handleShare = async () => {
    const url  = window.location.href
    const text = `LedgersCFO Compliance Matrix — ${todayLong()}\n\nOverdue: ${totalOverdue} | Pending: ${totalPending} | Completed: ${totalCompleted}\n\n${url}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Compliance Matrix — LedgersCFO', text, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareMsg('Link copied!')
        setTimeout(() => setShareMsg(''), 2000)
      }
    } catch (_) {}
  }

  // ── Tooltip helper ─────────────────────────────────────────────────────────

  const handleCellEnter = (e, clientId, category) => {
    const tasks = (taskMap[clientId] || []).filter((t) => t.category === category)
    if (!tasks.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ clientId, category, tasks, x: rect.left, y: rect.bottom + 6 })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="matrix-page" onClick={() => setTooltip(null)}>

      {/* ── Action bar ── */}
      <div className="matrix-actions">
        <button
          className="matrix-btn matrix-btn--pdf"
          onClick={downloadPDF}
          disabled={loading || exporting !== null}
          title="Download PDF snapshot"
        >
          {exporting === 'pdf' ? (
            <span className="matrix-btn__spinner" />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          )}
          {exporting === 'pdf' ? 'Generating…' : 'Download PDF'}
        </button>

        <button
          className="matrix-btn matrix-btn--excel"
          onClick={downloadExcel}
          disabled={loading || exporting !== null}
          title="Download Excel spreadsheet"
        >
          {exporting === 'excel' ? (
            <span className="matrix-btn__spinner" />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          )}
          {exporting === 'excel' ? 'Generating…' : 'Download Excel'}
        </button>

        <button
          className="matrix-btn matrix-btn--share"
          onClick={handleShare}
          disabled={loading}
          title="Share this view"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          {shareMsg || 'Share'}
        </button>
      </div>

      {/* ── Summary bar ── */}
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
                    <div className="matrix-table__client-name">{client.dba || client.company_name}</div>
                    <div className="matrix-table__client-type">{client.entity_type}</div>
                  </td>
                  {CATEGORIES.map((cat) => {
                    const tasks     = (taskMap[client.id] || []).filter((t) => t.category === cat)
                    const hasOverdue = tasks.some((t) => t.is_overdue)
                    const allDone    = tasks.length > 0 && tasks.every((t) => t.status === 'Completed')
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

      {/* ── Hover tooltip ── */}
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

      {/* ── Legend ── */}
      <div className="matrix-legend">
        <span className="legend-item"><span className="legend-dot legend-dot--overdue" /> Overdue</span>
        <span className="legend-item"><span className="legend-dot legend-dot--pending" /> Pending</span>
        <span className="legend-item"><span className="legend-dot legend-dot--done" /> All complete</span>
        <span className="legend-item"><span className="legend-dot legend-dot--empty" /> No tasks</span>
      </div>
    </div>
  )
}
