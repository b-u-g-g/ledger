# LedgersCFO — Compliance Tracker

A lightweight internal tool to track compliance tasks across multiple clients. 


## Features

- View all clients and their compliance tasks in one place
- Add new tasks, update status (Pending → Completed)
- Overdue tasks auto-flagged with visual highlighting
- Filter tasks by status and category
- Search clients by name 
- **Compliance Matrix** — Combined Overview
- Download matrix as **PDF** or **Excel** 
- Share matrix via native share or copy link to clipboard
- Home screen with two entry points: Tasks and Matrix


## UI & Color Theme

The color palette is pulled directly from the LedgersCFO website — not chosen arbitrarily.


Why this works: the contrast between white cards and the cream background is soft — it doesn't strain the eyes on long sessions the way a cold grey or pure white background does. This is exactly the palette the LedgersCFO website uses — keeping the internal tool consistent with the brand without having to think about it.


## Why the Matrix Matters

Most compliance tools show you a list. Lists are fine until you have 4+ clients and 20+ tasks — then you're scanning rows looking for what's on fire.

The Compliance Matrix flips this. Clients on rows, service categories on columns. One glance tells you which client has an overdue cross-border filing or a pending payroll task. The color coding (red / amber / green) makes the health of the entire portfolio readable in under 5 seconds.

**Download and Share** was added because compliance work doesn't stay in one tab. An accountant preparing for a client call needs to pull up the snapshot in a meeting. A manager reviewing the week needs to send it over Slack. PDF gives you a clean printable version with color-coded cells. Excel gives you three sheets — the matrix, a summary with counts, and a flat task dump — so you can filter, sort, or drop it into your own reporting. Share uses the native device share sheet on mobile and copies the link on desktop.


## The Thinking Behind the Data

`data.json` is the seed database. The structure wasn't made up — it was built by reading what LedgersCFO actually does on their website and working backwards.

1. **Services drove the categories.** The site lists: Fractional CFO, Incorporation, Bookkeeping, Tax & Compliance, Payroll, Sales Tax, Cross-border Compliance, FP&A. Each became a task category. Nothing was invented.

2. **Clients reflect real archetypes.** A Delaware C-Corp with an Indian subsidiary (cross-border FDI obligations), a pure Indian Pvt Ltd receiving FDI (RBI/FEMA filings), a US-only Data & AI startup with R&D credits, and a multi-state e-commerce company with sales tax nexus issues. These are the four client types LedgersCFO actually serves.

3. **Tasks were verified, not guessed.** Due dates, form numbers, penalties, and filing portals (RBI FIRMS, Delaware Division of Corporations, BSA E-Filing, IRS EFTPS) were looked up. Form FC-GPR, FLA Return, Form 5471, Form 941, Form 6765, FBAR — all real filings with real deadlines.

4. **Overdue tasks were seeded intentionally.** Several tasks have past due dates (Form 941 Q4, FC-GPR, Sales Tax Nexus, Delaware Franchise Tax). This was deliberate — the "Overdue" detection logic needs real data to test against, not a toggle.


## Insights Behind Key Features

**Overdue auto-detection** — no manual flag. The app computes `is_overdue` on every request: `status === 'Pending' && due_date < today`. This means it's always current regardless of when the data was created.

**Category filters** — pulled dynamically from the backend, not hardcoded in the frontend. Add a new category to a task and it appears in the filter immediately.

**Client search with highlight** — the matched characters are wrapped in a `<mark>` tag as you type. Small detail, but it confirms to the user that the search is working on the right field.

**Matrix cells are interactive** — hover over any cell to see the exact task titles, due dates, and statuses for that client + category combination. The summary numbers at the top update in real time as tasks are completed.


## Future Scope

- **Email / Slack alerts** — trigger a notification when a task crosses its due date. Cron job on the backend, webhook to Slack or SendGrid for email.
- **Live Dashboard** — Realtime dashboard for managers
- **Deadline countdown** — show "3 days left" on task cards instead of just the raw date.
- **Client portal view** — a read-only link per client so they can see their own tasks without logging into the internal tool.
- **Audit log** — track who changed what and when. Especially important for compliance work where the paper trail matters.


## Stack

| Layer | Choice |
|---|---|
| Backend | Node.js + Express |
| Storage | JSON file (swap-ready for Postgres/SQLite via `db/jsonDb.js`) |
| Frontend | React + Vite |
| PDF export | jsPDF + jspdf-autotable |
| Excel export | SheetJS (xlsx) |
| Deployment | Render (backend Web Service + frontend Static Site) |


Built for LedgersCFO. Intentionally simple. Designed to be extended.
