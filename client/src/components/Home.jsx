const CARDS = [
  {
    id: 'tasks',
    
    label: 'Compliance Tasks',
    
    description:
      'Manage all client compliance deadlines in one place. Add tasks, update statuses, and instantly spot overdue filings.',
    accent: '#1a1a1a',
    accentLight: '#f5f0eb',
    accentBorder: '#d6cfc7',
  },
  {
    id: 'matrix',
    label: 'Compliance Matrix',
    description:
      "A bird\u2019s-eye view of compliance health across every client and service category \u2014 overdue, pending, and completed at a glance.",
    accent: '#c0392b',
    accentLight: '#fdf5f4',
    accentBorder: '#f0c4c0',
  },
]

export default function Home({ onNavigate }) {
  return (
    <div className="home">
      <div className="home__hero">
        <p className="home__eyebrow">LedgersCFO · Internal Tools</p>
        <h1 className="home__headline">Compliance Tracker</h1>
        <p className="home__sub">
          One dashboard to manage filings, deadlines, and compliance health
          across all your clients.
        </p>
      </div>

      <div className="home__cards">
        {CARDS.map((card) => (
          <button
            key={card.id}
            className="home-card"
            style={{ '--accent': card.accent, '--accent-light': card.accentLight, '--accent-border': card.accentBorder }}
            onClick={() => onNavigate(card.id)}
          >
            <div className="home-card__top">
              <span className="home-card__icon">{card.icon}</span>
              <span className="home-card__arrow">→</span>
            </div>

            <div className="home-card__body">
              <p className="home-card__tagline">{card.tagline}</p>
              <h2 className="home-card__title">{card.label}</h2>
              <p className="home-card__desc">{card.description}</p>
            </div>

            <div className="home-card__cta">
              Open {card.label} <span>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
