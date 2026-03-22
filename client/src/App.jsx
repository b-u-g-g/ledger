import { useState, useEffect, useCallback } from 'react'
import ClientList from './components/ClientList'
import TaskList from './components/TaskList'
import Home from './components/Home'
import Matrix from './components/Matrix'
import { getClients, getTasksByClient, getCategories } from './api'

export default function App() {
  // ── Navigation ────────────────────────────────────────────────────────────
  const [page, setPage] = useState('home') // 'home' | 'tasks' | 'matrix'

  // ── Existing tasks state — untouched ─────────────────────────────────────
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ status: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch(() => setError('Could not connect to the server. Is the backend running?'))
    getCategories().then(setCategories)
  }, [])

  const loadTasks = useCallback((clientId) => {
    setLoading(true)
    setError(null)
    getTasksByClient(clientId)
      .then(setTasks)
      .catch(() => setError('Failed to load tasks.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectClient = (client) => {
    setSelectedClient(client)
    setFilters({ status: '', category: '' })
    loadTasks(client.id)
  }

  const filteredTasks = tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false
    if (filters.category && t.category !== filters.category) return false
    return true
  })

  // ── Page titles ───────────────────────────────────────────────────────────
  const PAGE_TITLE = {
    home:   'Compliance Tracker',
    tasks:  'Compliance Tasks',
    matrix: 'Compliance Matrix',
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        {page !== 'home' && (
          <button className="top-bar__back" onClick={() => setPage('home')} title="Back to Home">
            ← Home
          </button>
        )}
        <span className="top-bar__logo">LedgersCFO</span>
        <span className="top-bar__title">{PAGE_TITLE[page]}</span>
      </header>

      {error && <div className="banner banner--error">{error}</div>}

      {/* ── Home ── */}
      {page === 'home' && <Home onNavigate={setPage} />}

      {/* ── Tasks — existing layout, zero logic changes ── */}
      {page === 'tasks' && (
        <div className="layout">
          <aside className="sidebar">
            <ClientList
              clients={clients}
              selectedId={selectedClient?.id}
              onSelect={handleSelectClient}
            />
          </aside>
          <main className="main-panel">
            {!selectedClient ? (
              <div className="empty-state">
                <div className="empty-state__icon">📋</div>
                <p className="empty-state__text">Select a client to view their compliance tasks</p>
              </div>
            ) : (
              <TaskList
                client={selectedClient}
                tasks={filteredTasks}
                allTasks={tasks}
                categories={categories}
                filters={filters}
                onFilterChange={setFilters}
                onTasksChange={setTasks}
                loading={loading}
              />
            )}
          </main>
        </div>
      )}

      {/* ── Matrix ── */}
      {page === 'matrix' && (
        <div className="main-panel" style={{ overflow: 'auto' }}>
          <Matrix />
        </div>
      )}
    </div>
  )
}
