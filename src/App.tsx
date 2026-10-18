import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Database,
  FileSearch,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UsersRound,
  Wallet,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'
import {
  connectRiskToEvidence,
  searchContractClauses,
  type EvidenceItem,
} from './api'

const projects = [
  {
    id: 'CP-2048',
    name: 'East River Flood Barrier',
    agency: 'New York City DOT',
    contractor: 'Granite Construction',
    budget: '$184.6M',
    progress: 62,
    delayRisk: 78,
    costRisk: 64,
    status: 'Action needed',
    color: 'coral',
    initials: 'ER',
    milestone: 'Foundation completion',
    due: 'Oct 18, 2026',
  },
  {
    id: 'CP-1932',
    name: 'I-405 Sound Wall Expansion',
    agency: 'Washington State DOT',
    contractor: 'Kiewit Infrastructure',
    budget: '$92.3M',
    progress: 44,
    delayRisk: 56,
    costRisk: 38,
    status: 'Watch closely',
    color: 'gold',
    initials: 'I4',
    milestone: 'North corridor paving',
    due: 'Nov 02, 2026',
  },
  {
    id: 'CP-1876',
    name: 'Civic Center Modernization',
    agency: 'City of San Francisco',
    contractor: 'Turner Construction',
    budget: '$67.8M',
    progress: 81,
    delayRisk: 22,
    costRisk: 19,
    status: 'On track',
    color: 'green',
    initials: 'CC',
    milestone: 'Systems commissioning',
    due: 'Oct 29, 2026',
  },
  {
    id: 'CP-1764',
    name: 'South County Water Main',
    agency: 'King County Public Works',
    contractor: 'Michels Corporation',
    budget: '$38.1M',
    progress: 36,
    delayRisk: 34,
    costRisk: 47,
    status: 'Watch closely',
    color: 'gold',
    initials: 'SW',
    milestone: 'Pressure testing',
    due: 'Dec 11, 2026',
  },
]

interface ProjectRiskFactor {
  rank: string
  title: string
  detail: string
  impact: string
}

const projectRiskFactors: Record<string, ProjectRiskFactor[]> = {
  'CP-2048': [
    { rank: '01', title: 'Permit approval lag', detail: 'Environmental review is 23 days behind baseline', impact: '+31%' },
    { rank: '02', title: 'Subcontractor capacity', detail: 'Two specialist marine piling crews below planned staffing', impact: '+24%' },
    { rank: '03', title: 'Weather exposure', detail: 'Seasonal rainfall and high tidal surges impact foundation window', impact: '+16%' },
  ],
  'CP-1932': [
    { rank: '01', title: 'Material cost variance', detail: 'Steel and acoustic panel prices deviated 12% over bid baseline index', impact: '+28%' },
    { rank: '02', title: 'Corridor night windows', detail: 'Assembly restricted to 21:00-05:00 hours with non-refundable delay fines', impact: '+18%' },
  ],
  'CP-1876': [
    { rank: '01', title: 'Systems commissioning testing', detail: 'Continuous 72-hour operational testing required prior to occupancy sign-off', impact: '+15%' },
    { rank: '02', title: 'LEED acoustic compliance', detail: 'Interior decibel ratings require acoustic validation inspection', impact: '+11%' },
  ],
  'CP-1764': [
    { rank: '01', title: 'Hydrostatic pressure testing', detail: 'Continuous 4-hour 150 psi pressure endurance tolerance validation', impact: '+26%' },
    { rank: '02', title: 'Budget burn rate ahead of plan', detail: 'Monthly expenditure exceeded 115% baseline milestone trigger', impact: '+21%' },
  ],
}

const forecast = [
  { month: 'Jan', baseline: 26, projected: 25 },
  { month: 'Feb', baseline: 32, projected: 31 },
  { month: 'Mar', baseline: 39, projected: 36 },
  { month: 'Apr', baseline: 46, projected: 44 },
  { month: 'May', baseline: 54, projected: 61 },
  { month: 'Jun', baseline: 61, projected: 76 },
  { month: 'Jul', baseline: 69, projected: 88 },
]

const uploadedContracts = [
  { id: 'DOC-ERFB-001', name: 'East River Barrier - General Contract Agreement.pdf', project: 'CP-2048', projectName: 'East River Flood Barrier', date: 'Sep 28, 2026', size: '4.2 MB', clauses: 42, status: 'Indexed in pgvector' },
  { id: 'DOC-ERFB-002', name: 'East River Barrier - Subcontractor Staffing Plan.pdf', project: 'CP-2048', projectName: 'East River Flood Barrier', date: 'Sep 30, 2026', size: '1.8 MB', clauses: 19, status: 'Indexed in pgvector' },
  { id: 'DOC-I405-001', name: 'I-405 Sound Wall - Material Procurement Specifications.pdf', project: 'CP-1932', projectName: 'I-405 Sound Wall Expansion', date: 'Oct 02, 2026', size: '3.1 MB', clauses: 31, status: 'Indexed in pgvector' },
  { id: 'DOC-CCM-001', name: 'Civic Center - Building Systems Technical Standards.pdf', project: 'CP-1876', projectName: 'Civic Center Modernization', date: 'Sep 15, 2026', size: '5.6 MB', clauses: 78, status: 'Indexed in pgvector' },
  { id: 'DOC-SCWM-001', name: 'South County Water Main - Pipeline Engineering Specs.pdf', project: 'CP-1764', projectName: 'South County Water Main', date: 'Aug 20, 2026', size: '2.9 MB', clauses: 45, status: 'Indexed in pgvector' },
]

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Projects', icon: BriefcaseBusiness, count: '12' },
  { label: 'Risk signals', icon: Activity, count: '6' },
  { label: 'Documents', icon: FileSearch },
  { label: 'Contractors', icon: UsersRound },
  { label: 'Budget & spend', icon: Wallet },
]

type Project = (typeof projects)[number]

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedFactorIndex, setSelectedFactorIndex] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [approved, setApproved] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [timeframe, setTimeframe] = useState('6 months')

  // ML Evidence state
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([])
  const [evidenceIsLive, setEvidenceIsLive] = useState(false)
  const [loadingEvidence, setLoadingEvidence] = useState(false)

  // Document Intelligence page state
  const [docTab, setDocTab] = useState<'search' | 'upload'>('search')
  const [clauseSearchQuery, setClauseSearchQuery] = useState('')
  const [clauseProjectFilter, setClauseProjectFilter] = useState<string>('ALL')
  const [searchedClauses, setSearchedClauses] = useState<EvidenceItem[]>([])
  const [searchingClauses, setSearchingClauses] = useState(false)
  const [uploadNotice, setUploadNotice] = useState<string | null>(null)

  const visibleProjects = useMemo(
    () => projects.filter((project) =>
      `${project.name} ${project.agency} ${project.contractor}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
    [search],
  )

  // Retrieve evidence when project or selected factor changes
  useEffect(() => {
    if (!selectedProject) return

    const factors = projectRiskFactors[selectedProject.id] || projectRiskFactors['CP-2048']
    const activeFactor = factors[selectedFactorIndex] || factors[0]

    let isMounted = true
    setLoadingEvidence(true)

    connectRiskToEvidence({
      project_id: selectedProject.id,
      risk_type: activeFactor.title,
      risk_description: activeFactor.detail,
      risk_score: selectedProject.delayRisk,
      factor_title: activeFactor.title,
    }).then(({ evidence, isLive }) => {
      if (isMounted) {
        setEvidenceItems(evidence)
        setEvidenceIsLive(isLive)
        setLoadingEvidence(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [selectedProject, selectedFactorIndex])

  // Search clauses in Documents page
  useEffect(() => {
    let isMounted = true
    setSearchingClauses(true)

    const projId = clauseProjectFilter === 'ALL' ? undefined : clauseProjectFilter
    searchContractClauses(clauseSearchQuery, projId).then(({ evidence }) => {
      if (isMounted) {
        setSearchedClauses(evidence)
        setSearchingClauses(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [clauseSearchQuery, clauseProjectFilter, activePage])

  const handleSimulatedUpload = () => {
    setUploadNotice('Parsing contract into clauses and generating 1536-dim vector embeddings in pgvector...')
    setTimeout(() => {
      setUploadNotice('Success! Contract indexed. 28 clauses stored and ready for ML risk evidence retrieval.')
      setTimeout(() => setUploadNotice(null), 5000)
    }, 1800)
  }

  const factorsForSelected = selectedProject
    ? projectRiskFactors[selectedProject.id] || projectRiskFactors['CP-2048']
    : []

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Activity size={20} strokeWidth={2.5} /></div>
          <div className="brand-name">contract<span>pulse</span><sup>AI</sup></div>
        </div>

        <button className="workspace-switcher" type="button">
          <span className="workspace-avatar">NY</span>
          <span className="workspace-copy"><strong>Northstar Group</strong><small>Public infrastructure</small></span>
          <ChevronDown size={15} />
        </button>

        <div className="nav-heading">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, count }) => (
            <button
              className={`nav-item ${activePage === label ? 'nav-active' : ''}`}
              key={label}
              onClick={() => { setActivePage(label); setMobileNavOpen(false) }}
              type="button"
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {count && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-health"><span className="health-dot" /><span>All systems operational</span></div>
          <button className="nav-item help-link" type="button" onClick={() => setActivePage('Help center')}>
            <CircleHelp size={17} strokeWidth={1.8} /><span>Help center</span>
          </button>
          <div className="user-profile">
            <div className="user-avatar">JM</div>
            <div className="user-copy"><strong>Jordan Mitchell</strong><small>Program director</small></div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" type="button" aria-label="Open navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}><Menu size={19} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <label className={`search-box ${searchOpen ? 'search-open' : ''}`} onClick={() => setSearchOpen(true)}>
              <Search size={16} />
              <input aria-label="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }} placeholder="Search anything..." />
              <kbd>⌘ K</kbd>
            </label>
            <div className="notification-wrap">
              <button className="icon-button notification-button" type="button" aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell size={18} />
                <span className="notification-dot" />
              </button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="popover-heading"><strong>Notifications</strong><span>3 new</span></div>
                  <div className="notification-item">
                    <span className="notice-icon notice-red"><Activity size={15} /></span>
                    <p><strong>Delay risk increased</strong><small>East River Flood Barrier · 18 min ago</small></p>
                  </div>
                  <div className="notification-item">
                    <span className="notice-icon notice-gold"><FileText size={15} /></span>
                    <p><strong>New document analyzed</strong><small>Weekly field report · 1 hr ago</small></p>
                  </div>
                  <div className="notification-item">
                    <span className="notice-icon notice-green"><Check size={15} /></span>
                    <p><strong>Recommendation approved</strong><small>I-405 Sound Wall · Yesterday</small></p>
                  </div>
                </div>
              )}
            </div>
            <div className="topbar-avatar">JM</div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="page-intro">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" />FRIDAY, OCTOBER 02, 2026 <span className="eyebrow-divider">·</span> WEEK 40</div>
              <h1>
                {activePage === 'Overview' && 'Good morning, Jordan'}
                {activePage === 'Projects' && 'Project Performance Portfolio'}
                {activePage === 'Risk signals' && 'ML Risk Signals & Predictions'}
                {activePage === 'Documents' && 'Document Intelligence & Evidence Retrieval'}
                {activePage !== 'Overview' && activePage !== 'Projects' && activePage !== 'Risk signals' && activePage !== 'Documents' && activePage}
              </h1>
              <p className="intro-subtitle">
                {activePage === 'Documents'
                  ? 'Ingest contracts, search pgvector embeddings, and connect ML predicted risks to legal evidence.'
                  : 'Here’s what’s moving across your infrastructure portfolio.'}
              </p>
            </div>
            <button className="date-button" type="button"><Clock3 size={15} /> Last 30 days <ChevronDown size={14} /></button>
          </section>

          {/* DOCUMENTS & EVIDENCE RETRIEVAL PAGE */}
          {activePage === 'Documents' && (
            <div className="doc-intel-container">
              <div className="tab-pills">
                <button
                  type="button"
                  className={`tab-pill ${docTab === 'search' ? 'tab-active' : ''}`}
                  onClick={() => setDocTab('search')}
                >
                  <Search size={12} style={{ marginRight: 5, verticalAlign: -1 }} />
                  Evidence & Clause Search
                </button>
                <button
                  type="button"
                  className={`tab-pill ${docTab === 'upload' ? 'tab-active' : ''}`}
                  onClick={() => setDocTab('upload')}
                >
                  <UploadCloud size={12} style={{ marginRight: 5, verticalAlign: -1 }} />
                  Uploaded Contracts ({uploadedContracts.length})
                </button>
              </div>

              {docTab === 'search' && (
                <>
                  <div className="doc-search-bar">
                    <Search size={16} color="#69786d" />
                    <input
                      className="doc-search-input"
                      placeholder="Semantic search contract evidence (e.g., 'environmental permit lag', 'staffing quota', 'pressure testing')..."
                      value={clauseSearchQuery}
                      onChange={(e) => setClauseSearchQuery(e.target.value)}
                    />
                    {clauseSearchQuery && (
                      <button
                        type="button"
                        className="text-link"
                        onClick={() => setClauseSearchQuery('')}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="doc-filter-chips">
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#88938a' }}>FILTER PROJECT:</span>
                    <button
                      type="button"
                      className={`chip-btn ${clauseProjectFilter === 'ALL' ? 'chip-active' : ''}`}
                      onClick={() => setClauseProjectFilter('ALL')}
                    >
                      All Projects
                    </button>
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`chip-btn ${clauseProjectFilter === p.id ? 'chip-active' : ''}`}
                        onClick={() => setClauseProjectFilter(p.id)}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div className="panel-heading" style={{ marginBottom: 10 }}>
                      <div className="section-kicker">RETRIEVED CONTRACT EVIDENCE CLAUSES</div>
                      <span className="heading-count">{searchedClauses.length}</span>
                    </div>

                    {searchingClauses ? (
                      <div className="empty-results"><RefreshCw size={16} className="spin" /> Searching pgvector vector store...</div>
                    ) : searchedClauses.length === 0 ? (
                      <div className="empty-results">No clauses matched your query. Try searching for "permit", "staffing", or "pricing".</div>
                    ) : (
                      searchedClauses.map((item, idx) => (
                        <div key={idx} className="clause-card">
                          <div className="clause-header">
                            <div>
                              <div className="clause-title">{item.section_title || 'Contract Clause'}</div>
                              <div className="clause-doc">
                                <FileText size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                                {item.document_name || item.document_id} {item.page_number ? `· Page ${item.page_number}` : ''}
                                {item.project_id && ` · Project ${item.project_id}`}
                              </div>
                            </div>
                            <span className="evidence-badge badge-match">
                              {Math.round(item.similarity_score * 100)}% Match
                            </span>
                          </div>
                          <p className="clause-text">“{item.clause_text}”</p>
                          {item.connection_rationale && (
                            <div className="evidence-rationale">
                              <strong>ML Risk Relevance: </strong>
                              {item.connection_rationale}
                            </div>
                          )}
                          <div className="clause-footer">
                            <span style={{ color: '#7f8a81' }}>
                              <Database size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                              Vector Indexed (1536-dim)
                            </span>
                            <button
                              type="button"
                              className="text-link"
                              onClick={() => {
                                const found = projects.find((p) => p.id === item.project_id)
                                if (found) setSelectedProject(found)
                              }}
                            >
                              Open Project Risk Brief <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {docTab === 'upload' && (
                <>
                  <div className="upload-dropzone" onClick={handleSimulatedUpload}>
                    <UploadCloud size={32} color="#357253" />
                    <strong>Drop new contract PDF or addenda here to ingest</strong>
                    <small>Supports PDF, DOCX up to 50MB. Text will be segmented into legal clauses and indexed into PostgreSQL pgvector.</small>
                    <button type="button" className="secondary-button" style={{ marginTop: 6 }}>
                      Select Document
                    </button>
                  </div>

                  {uploadNotice && (
                    <div className="insight-strip" style={{ marginTop: 10 }}>
                      <div className="insight-icon"><Sparkles size={17} /></div>
                      <p><strong>RAG Pipeline: </strong>{uploadNotice}</p>
                    </div>
                  )}

                  <div className="panel" style={{ marginTop: 16 }}>
                    <div className="panel-heading" style={{ padding: '14px 18px' }}>
                      <div>
                        <div className="section-kicker">INDEXED REPOSITORY</div>
                        <h2>Uploaded Contract Documents</h2>
                      </div>
                    </div>
                    <div className="table-scroll">
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>DOCUMENT</th>
                            <th>PROJECT</th>
                            <th>DATE</th>
                            <th>EXTRACTED CLAUSES</th>
                            <th>VECTOR STATUS</th>
                            <th aria-label="Actions" />
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedContracts.map((doc) => (
                            <tr key={doc.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <FileText size={16} color="#457555" />
                                  <div>
                                    <strong>{doc.name}</strong>
                                    <small style={{ display: 'block', color: '#8d958e' }}>{doc.size} · {doc.id}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{doc.projectName}</td>
                              <td>{doc.date}</td>
                              <td><strong>{doc.clauses} clauses</strong></td>
                              <td>
                                <span className="evidence-badge badge-live">
                                  <Database size={10} /> {doc.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="text-link"
                                  onClick={() => {
                                    setDocTab('search')
                                    setClauseProjectFilter(doc.project)
                                  }}
                                >
                                  View Clauses <ArrowRight size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* OVERVIEW & RISK SIGNALS VIEW */}
          {activePage !== 'Documents' && (
            <>
              <section className="metrics-grid" aria-label="Portfolio summary">
                <article className="metric-card"><div className="metric-top"><span>ACTIVE PROJECTS</span><span className="metric-icon metric-icon-green"><BriefcaseBusiness size={16} /></span></div><div className="metric-value">12 <span className="metric-change positive"><ArrowUpRight size={14} /> 2</span></div><div className="metric-foot"><span>Across 8 agencies</span><span className="metric-trend">vs. last quarter</span></div></article>
                <article className="metric-card"><div className="metric-top"><span>AT-RISK PROJECTS</span><span className="metric-icon metric-icon-red"><Activity size={16} /></span></div><div className="metric-value">03 <span className="metric-change negative"><ArrowUpRight size={14} /> 1</span></div><div className="metric-foot"><span>Require your attention</span><span className="metric-trend">of 12 active</span></div></article>
                <article className="metric-card"><div className="metric-top"><span>PORTFOLIO VALUE</span><span className="metric-icon metric-icon-blue"><Wallet size={16} /></span></div><div className="metric-value">$842.6<span className="metric-unit">M</span> <span className="metric-change positive"><ArrowUpRight size={14} /> 4.2%</span></div><div className="metric-foot"><span>Total committed budget</span><span className="metric-trend">year over year</span></div></article>
                <article className="metric-card"><div className="metric-top"><span>FORECAST ACCURACY</span><span className="metric-icon metric-icon-gold"><Sparkles size={16} /></span></div><div className="metric-value">91.4<span className="metric-unit">%</span> <span className="metric-change positive"><ArrowUpRight size={14} /> 2.8%</span></div><div className="metric-foot"><span>Model confidence</span><span className="metric-trend">last 90 days</span></div></article>
              </section>

              <section className="insight-strip">
                <div className="insight-icon"><Sparkles size={17} /></div>
                <p>
                  <strong>Portfolio insight</strong>
                  <span>3 projects show early signals of schedule slippage. Proactive action could protect <b>$12.4M</b> in committed value.</span>
                </p>
                <button type="button" onClick={() => setActivePage('Risk signals')}>Review signals <ArrowRight size={15} /></button>
              </section>

              <section className="middle-grid">
                <article className="panel forecast-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">PORTFOLIO HEALTH</div>
                      <h2>Schedule performance</h2>
                    </div>
                    <button className="select-button" type="button" onClick={() => setTimeframe(timeframe === '6 months' ? '12 months' : '6 months')}>
                      {timeframe}<ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="chart-summary"><strong>76<span>%</span></strong><span className="chart-summary-copy"><span className="chart-change"><ArrowDownRight size={14} /> 8.2%</span> projects tracking to plan</span></div>
                  <div className="chart-legend"><span><i className="legend-dot legend-actual" /> Forecasted progress</span><span><i className="legend-dot legend-baseline" /> Planned progress</span></div>
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#27765f" stopOpacity={0.17} />
                            <stop offset="100%" stopColor="#27765f" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#e9ece7" strokeDasharray="3 5" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8b918c', fontSize: 11 }} dy={9} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b918c', fontSize: 10 }} tickFormatter={(value: number) => `${value}%`} />
                        <Tooltip contentStyle={{ border: '1px solid #e6e9e3', borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="baseline" stroke="#bbc4bd" strokeWidth={1.5} strokeDasharray="5 5" fill="none" name="Planned progress" />
                        <Area type="monotone" dataKey="projected" stroke="#27765f" strokeWidth={2.5} fill="url(#progressFill)" name="Forecasted progress" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="panel signal-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">NEEDS YOUR ATTENTION</div>
                      <h2>Priority signals <span className="heading-count">03</span></h2>
                    </div>
                    <button className="text-link" type="button" onClick={() => setActivePage('Risk signals')}>View all <ArrowRight size={14} /></button>
                  </div>
                  <div className="signal-list">
                    <button className="signal-row" type="button" onClick={() => { setSelectedProject(projects[0]); setSelectedFactorIndex(0) }}>
                      <span className="signal-severity severity-high" />
                      <span className="signal-copy"><strong>Schedule slippage likely</strong><small>East River Flood Barrier <i>·</i> 2h ago</small></span>
                      <span className="signal-score">78<span>%</span></span>
                      <ArrowRight className="signal-arrow" size={15} />
                    </button>
                    <button className="signal-row" type="button" onClick={() => { setSelectedProject(projects[1]); setSelectedFactorIndex(0) }}>
                      <span className="signal-severity severity-medium" />
                      <span className="signal-copy"><strong>Material cost variance</strong><small>I-405 Sound Wall Expansion <i>·</i> 5h ago</small></span>
                      <span className="signal-score score-medium">56<span>%</span></span>
                      <ArrowRight className="signal-arrow" size={15} />
                    </button>
                    <button className="signal-row" type="button" onClick={() => { setSelectedProject(projects[3]); setSelectedFactorIndex(1) }}>
                      <span className="signal-severity severity-medium" />
                      <span className="signal-copy"><strong>Budget burn ahead of plan</strong><small>South County Water Main <i>·</i> Yesterday</small></span>
                      <span className="signal-score score-medium">47<span>%</span></span>
                      <ArrowRight className="signal-arrow" size={15} />
                    </button>
                  </div>
                  <div className="signal-footer"><ShieldCheck size={14} /><span>Signals reviewed by ML & verified against contract terms</span></div>
                </article>
              </section>

              <section className="panel projects-panel">
                <div className="panel-heading projects-heading">
                  <div>
                    <div className="section-kicker">PORTFOLIO MONITOR</div>
                    <h2>Project performance <span className="heading-count">12</span></h2>
                  </div>
                  <div className="project-actions">
                    <button className="filter-button" type="button" onClick={() => setSearch(search ? '' : 'East')}>
                      <Activity size={14} /> Filter
                    </button>
                    <button className="text-link" type="button" onClick={() => setActivePage('Projects')}>All projects <ArrowRight size={14} /></button>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="project-table">
                    <thead>
                      <tr>
                        <th>PROJECT</th>
                        <th>CONTRACTOR</th>
                        <th>BUDGET</th>
                        <th>PROGRESS</th>
                        <th>DELAY RISK</th>
                        <th>COST RISK</th>
                        <th>STATUS</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProjects.map((project) => (
                        <tr key={project.id} onClick={() => { setSelectedProject(project); setSelectedFactorIndex(0) }}>
                          <td>
                            <div className="project-name-cell">
                              <span className={`project-avatar project-${project.color}`}>{project.initials}</span>
                              <span><strong>{project.name}</strong><small>{project.id} <i>·</i> {project.agency}</small></span>
                            </div>
                          </td>
                          <td className="contractor-cell">{project.contractor}</td>
                          <td className="budget-cell">{project.budget}</td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
                              <small>{project.progress}%</small>
                            </div>
                          </td>
                          <td>
                            <div className="risk-cell">
                              <span className={`risk-number ${project.delayRisk >= 65 ? 'risk-high' : project.delayRisk >= 40 ? 'risk-mid' : 'risk-low'}`}>{project.delayRisk}%</span>
                              <div className="risk-track">
                                <span className={project.delayRisk >= 65 ? 'track-high' : project.delayRisk >= 40 ? 'track-mid' : 'track-low'} style={{ width: `${project.delayRisk}%` }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="risk-cell">
                              <span className={`risk-number ${project.costRisk >= 65 ? 'risk-high' : project.costRisk >= 40 ? 'risk-mid' : 'risk-low'}`}>{project.costRisk}%</span>
                              <div className="risk-track">
                                <span className={project.costRisk >= 65 ? 'track-high' : project.costRisk >= 40 ? 'track-mid' : 'track-low'} style={{ width: `${project.costRisk}%` }} />
                              </div>
                            </div>
                          </td>
                          <td><span className={`status-pill status-${project.color}`}><i />{project.status}</span></td>
                          <td>
                            <button className="row-more" type="button" aria-label={`Open ${project.name}`} onClick={(event) => { event.stopPropagation(); setSelectedProject(project); setSelectedFactorIndex(0) }}>
                              <MoreHorizontal size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {visibleProjects.length === 0 && <div className="empty-results">No projects match “{search}”.</div>}
                </div>
                <div className="table-footer">
                  <span>Showing <strong>{visibleProjects.length}</strong> of <strong>12</strong> projects</span>
                  <button type="button" onClick={() => setActivePage('Projects')}>View portfolio <ArrowRight size={14} /></button>
                </div>
              </section>
            </>
          )}

          <footer className="dashboard-footer">
            <span><span className="live-dot" /> Live portfolio data <i>·</i> Last synced 12 minutes ago</span>
            <span>ContractPulse AI <i>·</i> Decision support, with you in control</span>
          </footer>
        </div>
      </main>

      {/* PROJECT RISK BRIEF & CONTRACT EVIDENCE DRAWER */}
      {selectedProject && (
        <div className="drawer-backdrop" onClick={() => setSelectedProject(null)}>
          <aside className="project-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-top">
              <span className="drawer-label">PROJECT RISK BRIEF</span>
              <button className="icon-button" type="button" aria-label="Close details" onClick={() => setSelectedProject(null)}>
                <X size={19} />
              </button>
            </div>

            <div className="drawer-project">
              <span className={`project-avatar project-${selectedProject.color}`}>{selectedProject.initials}</span>
              <div>
                <span className="drawer-id">{selectedProject.id} <i>·</i> {selectedProject.agency}</span>
                <h2>{selectedProject.name}</h2>
              </div>
            </div>

            <div className="drawer-risk-summary">
              <div className="risk-dial">
                <strong>{selectedProject.delayRisk}<span>%</span></strong>
                <small>delay likelihood</small>
              </div>
              <div>
                <span className={`status-pill status-${selectedProject.color}`}><i />{selectedProject.status}</span>
                <p>Cost overrun risk <strong>{selectedProject.costRisk}%</strong></p>
                <p>Model confidence <strong>91%</strong></p>
                <small>ML Risk Signal updated recently</small>
              </div>
            </div>

            <div className="drawer-section">
              <div className="section-kicker">UPCOMING MILESTONE</div>
              <div className="factor-row">
                <span className="factor-rank"><Clock3 size={13} /></span>
                <span><strong>{selectedProject.milestone}</strong><small>Due {selectedProject.due}</small></span>
              </div>
            </div>

            <div className="drawer-section">
              <div className="section-kicker">WHY THIS PROJECT IS AT RISK (SELECT FACTOR TO LINK EVIDENCE)</div>
              {factorsForSelected.map((factor, idx) => (
                <div
                  key={idx}
                  className={`factor-row ${selectedFactorIndex === idx ? 'factor-selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedFactorIndex(idx)}
                >
                  <span className="factor-rank">{factor.rank}</span>
                  <span>
                    <strong>{factor.title}</strong>
                    <small>{factor.detail}</small>
                  </span>
                  <b className="factor-impact">{factor.impact}</b>
                </div>
              ))}
            </div>

            {/* DYNAMIC CONTRACT EVIDENCE CITATION (CONNECTED VIA RAG) */}
            <div className="evidence-card">
              <div className="evidence-icon"><FileText size={17} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div className="section-kicker" style={{ margin: 0 }}>SUPPORTING CONTRACT EVIDENCE</div>
                  <span className={`evidence-badge ${evidenceIsLive ? 'badge-live' : 'badge-demo'}`}>
                    <Database size={9} />
                    {evidenceIsLive ? 'Live pgvector' : 'Curated Evidence'}
                    {evidenceItems[0] && ` · ${Math.round(evidenceItems[0].similarity_score * 100)}% match`}
                  </span>
                </div>

                {loadingEvidence ? (
                  <p style={{ color: '#88938a', fontSize: 9 }}>Connecting risk to contract clauses...</p>
                ) : evidenceItems.length > 0 ? (
                  <>
                    <strong style={{ display: 'block', marginBottom: 2 }}>
                      {evidenceItems[0].section_title || 'Contractual Clause Citation'}
                    </strong>
                    <small style={{ color: '#8d958e', display: 'block', marginBottom: 6 }}>
                      {evidenceItems[0].document_name || evidenceItems[0].document_id} {evidenceItems[0].page_number ? `· Page ${evidenceItems[0].page_number}` : ''}
                    </small>
                    <p style={{ margin: '6px 0 8px', fontStyle: 'italic', fontSize: 9, lineHeight: 1.5 }}>
                      “{evidenceItems[0].clause_text}”
                    </p>
                    {evidenceItems[0].connection_rationale && (
                      <div className="evidence-rationale" style={{ marginTop: 6, marginBottom: 8 }}>
                        <strong>ML Connection: </strong>
                        {evidenceItems[0].connection_rationale}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActivePage('Documents')
                        setClauseSearchQuery(factorsForSelected[selectedFactorIndex]?.title || '')
                        setClauseProjectFilter(selectedProject.id)
                        setSelectedProject(null)
                      }}
                    >
                      View all clauses for this project <ArrowRight size={13} />
                    </button>
                  </>
                ) : (
                  <p>No contract clause evidence found for this specific risk factor.</p>
                )}
              </div>
            </div>

            <div className="recommendation-card">
              {dismissed ? (
                <div className="dismissed-card">
                  <div><X size={16} /><strong>Recommendation dismissed</strong></div>
                  <p>This recommendation was dismissed. The decision is recorded in the audit trail.</p>
                </div>
              ) : (
                <div className="recommendation-card">
                  <div className="recommendation-title"><Sparkles size={16} /><strong>Recommended next step</strong></div>
                  <p>Schedule an agency coordination meeting to resolve permit blockers before the {selectedProject.due} milestone.</p>
                  <span>Potential impact <b>Recover 2–3 weeks</b></span>
                </div>
              )}
            </div>

            <div className="drawer-actions">
              <button
                className={`approve-button ${approved ? 'approved-button' : ''}`}
                type="button"
                disabled={dismissed}
                onClick={() => { setApproved(true); setDismissed(false) }}
              >
                {dismissed ? <><X size={16} /> Recommendation dismissed</> : approved ? <><Check size={16} /> Recommendation approved</> : <><Check size={16} /> Approve recommendation</>}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => { setApproved(false); setDismissed(!dismissed) }}
              >
                {dismissed ? 'Undo' : 'Dismiss'}
              </button>
            </div>
            <p className="audit-note"><ShieldCheck size={13} /> {dismissed ? 'Dismissal recorded in the audit trail.' : 'Your decision is recorded in the audit trail.'}</p>
          </aside>
        </div>
      )}
    </div>
  )
}

export default App
