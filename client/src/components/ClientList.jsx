import { useState } from 'react'

const ENTITY_COLORS = {
  'Delaware C-Corp': '#2563eb',
  'Indian Private Limited Company': '#7c3aed',
}

const COUNTRY_FLAG = {
  USA: '🇺🇸',
  India: '🇮🇳',
}

function highlight(text, query) {
  if (!query) return text
  const index = text.toLowerCase().indexOf(query.toLowerCase())
  if (index === -1) return text
  return (
    <>
      {text.slice(0, index)}
      <mark className="search-highlight">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  )
}

export default function ClientList({ clients, selectedId, onSelect }) {
  const [query, setQuery] = useState('')

  const filtered = clients.filter((c) => {
    const name = (c.dba || c.company_name).toLowerCase()
    return name.includes(query.toLowerCase())
  })

  if (!clients.length) {
    return <div className="sidebar__empty">Loading clients…</div>
  }

  return (
    <div className="client-list">
      <h2 className="sidebar__heading">Clients</h2>

      <div className="client-search">
        <span className="client-search__icon">🔍</span>
        <input
          className="client-search__input"
          type="text"
          placeholder="Search clients…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="client-search__clear" onClick={() => setQuery('')} title="Clear">✕</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="sidebar__empty">No clients match "{query}"</div>
      ) : (
        filtered.map((client) => {
          const isSelected = client.id === selectedId
          const color = ENTITY_COLORS[client.entity_type] || '#64748b'
          const displayName = client.dba || client.company_name

          return (
            <button
              key={client.id}
              className={`client-card ${isSelected ? 'client-card--active' : ''}`}
              onClick={() => onSelect(client)}
              title={client.description}
            >
              <div className="client-card__flag">
                {COUNTRY_FLAG[client.country] || '🌐'}
              </div>
              <div className="client-card__body">
                <span className="client-card__name">
                  {highlight(displayName, query)}
                </span>
                <span
                  className="client-card__type"
                  style={{ color: isSelected ? '#fff' : color }}
                >
                  {client.entity_type}
                </span>
              </div>
            </button>
          )
        })
      )}
    </div>
  )
}
