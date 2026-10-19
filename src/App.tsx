import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Activity,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileSearch,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
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
import { calculateProjectFeatures, type MilestoneStatus, type Project } from './projectFeatures'
import {
  createMilestone as createMilestoneApi,
  createProgressSnapshot,
  createProject as createProjectApi,
  deleteProject as deleteProjectApi,
  getProjects,
  updateMilestone as updateMilestoneApi,
} from './api'
import {
  BudgetPage,
  ContractorsPage,
  DocumentsPage,
  HelpPage,
  ProjectsPage,
  RiskSignalsPage,
} from './WorkspacePages'
import './App.css'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Projects', icon: BriefcaseBusiness, count: '4' },
  { label: 'Risk signals', icon: Activity, count: '3' },
  { label: 'Documents', icon: FileSearch },
  { label: 'Contractors', icon: UsersRound },
  { label: 'Budget & spend', icon: Wallet },
]

const currentDate = new Date().toISOString().slice(0, 10)

type ProjectDraft = Pick<Project,
  'name' | 'agency' | 'contractor' | 'budget' | 'progress' | 'plannedProgress' |
  'baselineFinishDate' | 'forecastFinishDate' | 'milestone'
> & {
  milestoneDueDate: string
}

type ProgressDraft = {
  date: string
  planned: number
  actual: number
}

type MilestoneDraft = {
  name: string
  plannedFinishDate: string
  forecastFinishDate: string
}

function ProgressUpdateDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (snapshot: ProgressDraft) => void
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onSubmit({
      date: String(data.get('date')),
      planned: Number(data.get('planned')),
      actual: Number(data.get('actual')),
    })
  }

  return <div className="dialog-backdrop" onClick={onClose}><section className="add-project-dialog" role="dialog" aria-modal="true" aria-labelledby="progress-dialog-title" onClick={(event) => event.stopPropagation()}>
    <div className="add-project-heading"><div><span className="section-kicker">DEMO WORKSPACE</span><h2 id="progress-dialog-title">Record progress update</h2></div><button className="icon-button" type="button" aria-label="Close progress update form" onClick={onClose}><X size={19} /></button></div>
    <p className="form-demo-note">Saves this progress snapshot to the Spring Boot demo API.</p>
    <form className="add-project-form" onSubmit={handleSubmit}>
      <label>As-of date<input name="date" type="date" max={currentDate} required /></label>
      <div className="form-two-columns"><label>Planned progress (%)<input name="planned" type="number" min="0" max="100" step="1" required /></label><label>Actual progress (%)<input name="actual" type="number" min="0" max="100" step="1" required /></label></div>
      <div className="form-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="approve-button" type="submit"><Plus size={15} /> Save update</button></div>
    </form>
  </section></div>
}

function AddMilestoneDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (milestone: MilestoneDraft) => void
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onSubmit({
      name: String(data.get('name')).trim(),
      plannedFinishDate: String(data.get('plannedFinishDate')),
      forecastFinishDate: String(data.get('forecastFinishDate')),
    })
  }

  return <div className="dialog-backdrop" onClick={onClose}><section className="add-project-dialog" role="dialog" aria-modal="true" aria-labelledby="milestone-dialog-title" onClick={(event) => event.stopPropagation()}>
    <div className="add-project-heading"><div><span className="section-kicker">DEMO WORKSPACE</span><h2 id="milestone-dialog-title">Add milestone</h2></div><button className="icon-button" type="button" aria-label="Close milestone form" onClick={onClose}><X size={19} /></button></div>
    <p className="form-demo-note">Milestone changes are saved to the Spring Boot demo API.</p>
    <form className="add-project-form" onSubmit={handleSubmit}>
      <label>Milestone name<input name="name" maxLength={100} required /></label>
      <label>Planned finish<input name="plannedFinishDate" type="date" required /></label>
      <label>Forecast finish (optional)<input name="forecastFinishDate" type="date" /></label>
      <div className="form-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="approve-button" type="submit"><Plus size={15} /> Add milestone</button></div>
    </form>
  </section></div>
}

function AddProjectDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (project: ProjectDraft) => void
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const budget = String(formData.get('budget'))
    onSubmit({
      name: String(formData.get('name')).trim(),
      agency: String(formData.get('agency')).trim(),
      contractor: String(formData.get('contractor')).trim(),
      budget: `₹${budget} Cr`,
      progress: Number(formData.get('progress')),
      plannedProgress: Number(formData.get('plannedProgress')),
      baselineFinishDate: String(formData.get('baselineFinishDate')),
      forecastFinishDate: String(formData.get('forecastFinishDate')),
      milestone: String(formData.get('milestone')).trim(),
      milestoneDueDate: String(formData.get('milestoneDue')),
    })
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section
        className="add-project-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-project-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="add-project-heading">
          <div><span className="section-kicker">SAMPLE WORKSPACE</span><h2 id="add-project-title">Add project</h2></div>
          <button className="icon-button" type="button" aria-label="Close add project form" onClick={onClose}><X size={19} /></button>
        </div>
        <p className="form-demo-note">This sample project is saved by the Spring Boot demo API.</p>
        <form className="add-project-form" onSubmit={handleSubmit}>
          <label>Project name<input name="name" required maxLength={100} /></label>
          <div className="form-two-columns">
            <label>Agency<input name="agency" required maxLength={100} /></label>
            <label>Contractor<input name="contractor" required maxLength={100} /></label>
          </div>
          <div className="form-two-columns">
            <label>Budget (₹ Cr)<input name="budget" type="number" min="0" step="0.01" required /></label>
            <label>Actual progress (%)<input name="progress" type="number" min="0" max="100" step="1" required /></label>
          </div>
          <div className="form-two-columns">
            <label>Planned progress (%)<input name="plannedProgress" type="number" min="0" max="100" step="1" required /></label>
            <label>Milestone name<input name="milestone" required maxLength={100} /></label>
          </div>
          <div className="form-two-columns">
            <label>Milestone due date<input name="milestoneDue" type="date" required /></label>
            <label>Baseline finish<input name="baselineFinishDate" type="date" required /></label>
          </div>
          <label>Forecast finish<input name="forecastFinishDate" type="date" required /></label>
          <div className="form-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="approve-button" type="submit"><Plus size={15} /> Add sample project</button></div>
        </form>
      </section>
    </div>
  )
}

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [activePage, setActivePage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [approved, setApproved] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [timeframe, setTimeframe] = useState('6 months')
  const [addProjectOpen, setAddProjectOpen] = useState(false)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false)

  useEffect(() => {
    let active = true
    getProjects()
      .then((data) => { if (active) setProjects(data) })
      .catch((error: unknown) => {
        if (active) setApiError(error instanceof Error ? error.message : 'Could not load projects')
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  function replaceProject(updated: Project) {
    setProjects((current) => current.map((project) => project.id === updated.id ? updated : project))
    setSelectedProject(updated)
  }

  async function addProject(draft: ProjectDraft) {
    setApiError(null)
    try {
      const created = await createProjectApi(draft)
      setProjects((current) => [created, ...current])
      setSearch('')
      setActivePage('Projects')
      setSelectedProject(created)
      setAddProjectOpen(false)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not create the project')
    }
  }

  async function updateProjectProgress(snapshot: ProgressDraft) {
    if (!selectedProject) return
    setApiError(null)
    try {
      const updated = await createProgressSnapshot(selectedProject.id, snapshot)
      replaceProject(updated)
      setProgressDialogOpen(false)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not save progress')
    }
  }

  async function addMilestone(draft: MilestoneDraft) {
    if (!selectedProject) return
    setApiError(null)
    try {
      const updated = await createMilestoneApi(selectedProject.id, {
        name: draft.name,
        plannedFinishDate: draft.plannedFinishDate,
        forecastFinishDate: draft.forecastFinishDate || null,
        actualFinishDate: null,
        status: 'Not started',
      })
      replaceProject(updated)
      setMilestoneDialogOpen(false)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not add milestone')
    }
  }

  async function updateMilestoneStatus(milestoneId: string, status: MilestoneStatus) {
    if (!selectedProject) return
    const milestone = selectedProject.milestones.find((item) => item.id === milestoneId)
    if (!milestone) return
    setApiError(null)
    try {
      const updated = await updateMilestoneApi(selectedProject.id, milestoneId, {
        ...milestone,
        status,
        actualFinishDate: status === 'Complete'
          ? milestone.actualFinishDate ?? currentDate
          : null,
      })
      replaceProject(updated)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not update milestone')
    }
  }

  async function deleteProject() {
    if (!selectedProject || !window.confirm(`Delete ${selectedProject.name}?`)) return
    setApiError(null)
    try {
      await deleteProjectApi(selectedProject.id)
      setProjects((current) => current.filter((project) => project.id !== selectedProject.id))
      setSelectedProject(null)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not delete project')
    }
  }

  const visibleProjects = useMemo(
    () => projects.filter((project) =>
      `${project.name} ${project.agency} ${project.contractor}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
    [projects, search],
  )

  const portfolioHistory = useMemo(() => {
    const totalsByDate = new Map<string, { planned: number; actual: number; count: number }>()
    for (const project of projects) {
      for (const snapshot of project.progressHistory) {
        const total = totalsByDate.get(snapshot.date) ?? { planned: 0, actual: 0, count: 0 }
        total.planned += snapshot.planned
        total.actual += snapshot.actual
        total.count += 1
        totalsByDate.set(snapshot.date, total)
      }
    }
    return [...totalsByDate.entries()]
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, total]) => ({
        date,
        planned: Math.round(total.planned / total.count),
        actual: Math.round(total.actual / total.count),
      }))
  }, [projects])
  const latestPortfolioSnapshot = portfolioHistory[portfolioHistory.length - 1]
  const attentionCount = projects.filter((project) => project.riskScoresAvailable && project.delayRisk >= 65).length
  const totalBudget = projects.reduce((sum, project) => sum + Number(project.budget.replace(/[₹\sCr,]/g, '')), 0)
  const projectById = new Map(projects.map((project) => [project.id, project]))

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

          <div className="nav-heading">PORTFOLIO</div>
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
              {count && <span className="nav-count">{label === 'Projects' ? projects.length : count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-health"><span className="health-dot" /><span>Synced 12 min ago</span></div>
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
            <label className={`search-box ${searchOpen ? 'search-open' : ''}`} onClick={() => setSearchOpen(true)}><Search size={16} /><input aria-label="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false) }} placeholder="Search anything..." /><kbd>⌘ K</kbd></label>
            <div className="notification-wrap">
              <button className="icon-button notification-button" type="button" aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={18} /><span className="notification-dot" /></button>
              {notificationsOpen && <div className="notification-popover"><div className="popover-heading"><strong>Notifications</strong><span>3 new</span></div><div className="notification-item"><span className="notice-icon notice-red"><Activity size={15} /></span><p><strong>Delay risk increased</strong><small>East River Flood Barrier · 18 min ago</small></p></div><div className="notification-item"><span className="notice-icon notice-gold"><FileText size={15} /></span><p><strong>New document analyzed</strong><small>Weekly field report · 1 hr ago</small></p></div><div className="notification-item"><span className="notice-icon notice-green"><Check size={15} /></span><p><strong>Recommendation approved</strong><small>I-405 Sound Wall · Yesterday</small></p></div></div>}
            </div>
            <div className="topbar-avatar">JM</div>
          </div>
        </header>

        <div className="dashboard-content">
          {apiError && <div className="api-alert" role="alert"><strong>Backend request failed.</strong> {apiError} <span>Check that Spring Boot is running on port 8080.</span></div>}
          {isLoading && <div className="api-alert">Loading projects from the Spring Boot demo API…</div>}
          <section className="page-intro">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" />SPRING BOOT API <span className="eyebrow-divider">·</span> H2 DEMO DATA</div>
              <h1>{activePage === 'Overview' ? 'Portfolio overview' : activePage}</h1>
              <p className="intro-subtitle">{activePage === 'Overview' ? `${projects.length} projects from the demo API · risk values are illustrative` : activePage === 'Projects' ? 'Review contract status, progress, and risk across the sample portfolio.' : activePage === 'Risk signals' ? 'Review project concerns and open the supporting project brief.' : activePage === 'Documents' ? 'Browse sample reports and updates attached to projects.' : activePage === 'Contractors' ? 'Compare delivery partners using the projects in this sample workspace.' : activePage === 'Budget & spend' ? 'Review sample contract commitments and cost-risk indicators.' : 'Quick guidance for using the ContractPulse demo.'}</p>
            </div>
            <button className="date-button" type="button"><Clock3 size={15} /> Last 30 days <ChevronDown size={14} /></button>
          </section>

          {activePage === 'Overview' ? <>
          <section className="metrics-grid" aria-label="Portfolio summary">
            <article className="metric-card"><div className="metric-top"><span>Projects</span><span className="metric-icon metric-icon-green"><BriefcaseBusiness size={16} /></span></div><div className="metric-value">{projects.length}</div><div className="metric-foot"><span>Loaded from Spring Boot</span><span className="metric-trend">H2 demo data</span></div></article>
            <article className="metric-card"><div className="metric-top"><span>High schedule risk</span><span className="metric-icon metric-icon-red"><Activity size={16} /></span></div><div className="metric-value">{attentionCount.toString().padStart(2, '0')}</div><div className="metric-foot"><span>Delay risk ≥ 65%</span><span className="metric-trend">sample scores</span></div></article>
            <article className="metric-card"><div className="metric-top"><span>Committed budget</span><span className="metric-icon metric-icon-blue"><Wallet size={16} /></span></div><div className="metric-value">₹{totalBudget.toFixed(2)}<span className="metric-unit">Cr</span></div><div className="metric-foot"><span>Visible projects</span><span className="metric-trend">INR crores</span></div></article>
            <article className="metric-card"><div className="metric-top"><span>Milestones</span><span className="metric-icon metric-icon-gold"><Clock3 size={16} /></span></div><div className="metric-value">{projects.reduce((sum, project) => sum + project.milestones.length, 0)}</div><div className="metric-foot"><span>Across this portfolio</span><span className="metric-trend">from API</span></div></article>
          </section>

          <section className="insight-strip"><div className="insight-icon"><Clock3 size={17} /></div><p><strong>Portfolio check</strong><span>Review current progress and upcoming milestones. Risk scores shown in this demo are illustrative only.</span></p>{projectById.get('CP-2048') && <button type="button" onClick={() => setSelectedProject(projectById.get('CP-2048') ?? null)}>Open project <ArrowRight size={15} /></button>}</section>

          <section className="middle-grid">
            <article className="panel forecast-panel">
              <div className="panel-heading"><div><div className="section-kicker">SCHEDULE CHECK</div><h2>Progress against baseline</h2></div><button className="select-button" type="button" onClick={() => setTimeframe(timeframe === '6 months' ? '12 months' : '6 months')}>{timeframe}<ChevronDown size={14} /></button></div>
              <div className="chart-summary"><strong>{latestPortfolioSnapshot?.actual ?? '—'}{latestPortfolioSnapshot && <span>%</span>}</strong><span className="chart-summary-copy">{latestPortfolioSnapshot ? `portfolio actual vs planned · ${latestPortfolioSnapshot.date}` : 'No progress snapshots returned'}</span></div>
              <div className="chart-legend"><span><i className="legend-dot legend-actual" /> Actual portfolio progress</span><span><i className="legend-dot legend-baseline" /> Planned portfolio progress</span></div>
              <div className="chart-wrap">{portfolioHistory.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={portfolioHistory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#27765f" stopOpacity={0.17} /><stop offset="100%" stopColor="#27765f" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#e9ece7" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8b918c', fontSize: 9 }} tickFormatter={(date: string) => date.slice(5)} dy={9} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#8b918c', fontSize: 10 }} tickFormatter={(value: number) => `${value}%`} /><Tooltip labelFormatter={(date) => `As of ${String(date)}`} contentStyle={{ border: '1px solid #e6e9e3', borderRadius: 8, fontSize: 12 }} /><Area type="monotone" dataKey="planned" stroke="#bbc4bd" strokeWidth={1.5} strokeDasharray="5 5" fill="none" name="Planned progress" /><Area type="monotone" dataKey="actual" stroke="#27765f" strokeWidth={2.5} fill="url(#progressFill)" name="Actual progress" /></AreaChart></ResponsiveContainer> : <div className="empty-results">No progress snapshots yet.</div>}</div>
            </article>

            <article className="panel signal-panel">
              <div className="panel-heading"><div><div className="section-kicker">NEEDS YOUR ATTENTION</div><h2>Priority signals <span className="heading-count">03</span></h2></div><button className="text-link" type="button" onClick={() => setActivePage('Risk signals')}>View all <ArrowRight size={14} /></button></div>
              <div className="signal-list">
                {[
                  { project: projectById.get('CP-2048'), title: 'Permit review is holding up foundation work' },
                  { project: projectById.get('CP-1932'), title: 'Material costs are trending above estimate' },
                  { project: projectById.get('CP-1764'), title: 'Spend is ahead of completed work' },
                ].filter((signal) => signal.project?.riskScoresAvailable).map(({ project, title }) => project && <button className="signal-row" key={project.id} type="button" onClick={() => setSelectedProject(project)}><span className={`signal-severity ${project.delayRisk >= 65 ? 'severity-high' : 'severity-medium'}`} /><span className="signal-copy"><strong>{title}</strong><small>{project.name} <i>·</i> {project.status}</small></span><span className={`signal-score ${project.delayRisk >= 65 ? '' : 'score-medium'}`}>{project.delayRisk}<span>%</span></span><ArrowRight className="signal-arrow" size={15} /></button>)}
              </div>
              <div className="signal-footer"><ShieldCheck size={14} /><span>Based on schedule, field reports and cost updates</span></div>
            </article>
          </section>

          <section className="panel projects-panel">
            <div className="panel-heading projects-heading"><div><div className="section-kicker">PORTFOLIO MONITOR</div><h2>Project performance <span className="heading-count">{projects.length}</span></h2></div><div className="project-actions"><button className="filter-button" type="button" onClick={() => setAddProjectOpen(true)}><Plus size={14} /> Add project</button><button className="filter-button" type="button" onClick={() => setSearch(search ? '' : 'East')}><Activity size={14} /> Filter</button><button className="text-link" type="button" onClick={() => setActivePage('Projects')}>All projects <ArrowRight size={14} /></button></div></div>
            <div className="table-scroll">
              <table className="project-table">
                <thead><tr><th>PROJECT</th><th>CONTRACTOR</th><th>BUDGET</th><th>PROGRESS</th><th>DELAY RISK</th><th>COST RISK</th><th>STATUS</th><th aria-label="Actions" /></tr></thead>
                <tbody>{visibleProjects.map((project) => <tr key={project.id} onClick={() => setSelectedProject(project)}>
                  <td><div className="project-name-cell"><span className={`project-avatar project-${project.color}`}>{project.initials}</span><span><strong>{project.name}</strong><small>{project.id} <i>·</i> {project.agency}</small></span></div></td>
                  <td className="contractor-cell">{project.contractor}</td>
                  <td className="budget-cell">{project.budget}</td>
                  <td><div className="progress-cell"><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div><small>{project.progress}%</small></div></td>
                  <td><div className="risk-cell"><span className={`risk-number ${project.riskScoresAvailable ? project.delayRisk >= 65 ? 'risk-high' : project.delayRisk >= 40 ? 'risk-mid' : 'risk-low' : ''}`}>{project.riskScoresAvailable ? `${project.delayRisk}%` : '—'}</span><div className="risk-track"><span className={project.delayRisk >= 65 ? 'track-high' : project.delayRisk >= 40 ? 'track-mid' : 'track-low'} style={{ width: `${project.riskScoresAvailable ? project.delayRisk : 0}%` }} /></div></div></td>
                  <td><div className="risk-cell"><span className={`risk-number ${project.riskScoresAvailable ? project.costRisk >= 65 ? 'risk-high' : project.costRisk >= 40 ? 'risk-mid' : 'risk-low' : ''}`}>{project.riskScoresAvailable ? `${project.costRisk}%` : '—'}</span><div className="risk-track"><span className={project.costRisk >= 65 ? 'track-high' : project.costRisk >= 40 ? 'track-mid' : 'track-low'} style={{ width: `${project.riskScoresAvailable ? project.costRisk : 0}%` }} /></div></div></td>
                  <td><span className={`status-pill status-${project.color}`}><i />{project.status}</span></td>
                  <td><button className="row-more" type="button" aria-label={`Open ${project.name}`} onClick={(event) => { event.stopPropagation(); setSelectedProject(project) }}><MoreHorizontal size={17} /></button></td>
                </tr>)}</tbody>
              </table>
              {visibleProjects.length === 0 && <div className="empty-results">No projects match “{search}”.</div>}
            </div>
            <div className="table-footer"><span>Showing <strong>{visibleProjects.length}</strong> of <strong>{projects.length}</strong> sample projects</span><button type="button" onClick={() => setActivePage('Projects')}>View portfolio <ArrowRight size={14} /></button></div>
          </section>

          <footer className="dashboard-footer"><span><span className="live-dot" /> Portfolio data synced 12 minutes ago</span><span>Demo workspace · Sample contract data</span></footer>
          </> : <>
            {activePage === 'Projects' && <ProjectsPage projects={visibleProjects} onSelectProject={setSelectedProject} onGoToProjects={() => setActivePage('Projects')} onAddProject={() => setAddProjectOpen(true)} />}
            {activePage === 'Risk signals' && <RiskSignalsPage projects={visibleProjects} onSelectProject={setSelectedProject} onGoToProjects={() => setActivePage('Projects')} />}
            {activePage === 'Documents' && <DocumentsPage projects={projects} onSelectProject={setSelectedProject} onGoToProjects={() => setActivePage('Projects')} />}
            {activePage === 'Contractors' && <ContractorsPage projects={visibleProjects} onSelectProject={setSelectedProject} onGoToProjects={() => setActivePage('Projects')} />}
            {activePage === 'Budget & spend' && <BudgetPage projects={visibleProjects} onSelectProject={setSelectedProject} onGoToProjects={() => setActivePage('Projects')} />}
            {activePage === 'Help center' && <HelpPage onGoToProjects={() => setActivePage('Projects')} />}
          </>}
        </div>
      </main>

      {selectedProject && <div className="drawer-backdrop" onClick={() => setSelectedProject(null)}>
        <aside className="project-drawer" onClick={(event) => event.stopPropagation()}>
          <div className="drawer-top"><span className="drawer-label">PROJECT DETAILS · API DEMO</span><div className="drawer-top-actions"><button className="secondary-button" type="button" onClick={deleteProject}>Delete project</button><button className="icon-button" type="button" aria-label="Close details" onClick={() => setSelectedProject(null)}><X size={19} /></button></div></div>
          <div className="drawer-project"><span className={`project-avatar project-${selectedProject.color}`}>{selectedProject.initials}</span><div><span className="drawer-id">{selectedProject.id} <i>·</i> {selectedProject.agency}</span><h2>{selectedProject.name}</h2></div></div>
          <div className="drawer-risk-summary">
            <div className="risk-dial"><strong>{selectedProject.riskScoresAvailable ? `${selectedProject.delayRisk}%` : '—'}</strong><small>{selectedProject.riskScoresAvailable ? 'demo risk score' : 'not scored'}</small></div>
            <div><span className={`status-pill status-${selectedProject.color}`}><i />{selectedProject.status}</span><p>Cost overrun risk <strong>{selectedProject.riskScoresAvailable ? `${selectedProject.costRisk}%` : 'Not scored'}</strong></p>{selectedProject.riskScoresAvailable && <p>Demo scores are not predictions</p>}<small>{selectedProject.riskScoresAvailable ? 'Sample data' : 'No risk model is connected'}</small></div>
          </div>
          <div className="drawer-section">
            <div className="section-kicker">FEATURE ENGINEERING · SAMPLE</div>
            {(() => {
              const features = calculateProjectFeatures(selectedProject)
              return <div className="feature-grid">
                <article><small>Progress variance</small><strong className={features.progressVariance < 0 ? 'feature-negative' : 'feature-positive'}>{features.progressVariance > 0 ? '+' : ''}{features.progressVariance} pp</strong><span>Actual {selectedProject.progress}% − planned {selectedProject.plannedProgress}%</span></article>
                <article><small>Schedule variance</small><strong className={features.scheduleVarianceDays !== null && features.scheduleVarianceDays > 0 ? 'feature-negative' : 'feature-positive'}>{features.scheduleVarianceDays === null ? 'Unavailable' : `${features.scheduleVarianceDays > 0 ? '+' : ''}${features.scheduleVarianceDays} days`}</strong><span>Forecast finish vs baseline finish</span></article>
              </div>
            })()}
          </div>
          <div className="drawer-section">
            <div className="drawer-section-heading"><div className="section-kicker">PROGRESS HISTORY · SAMPLE</div><button className="filter-button" type="button" onClick={() => setProgressDialogOpen(true)}><Plus size={13} /> Record update</button></div>
            <p className="feature-note">Latest snapshot: {selectedProject.progressAsOfDate}. Progress history is loaded from the Spring Boot API.</p>
            <div className="drawer-progress-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={selectedProject.progressHistory} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <defs><linearGradient id="projectProgressFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#27765f" stopOpacity={0.14} /><stop offset="100%" stopColor="#27765f" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#e9ece7" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8b918c', fontSize: 8 }} tickFormatter={(date: string) => date.slice(5)} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#8b918c', fontSize: 8 }} tickFormatter={(value: number) => `${value}%`} />
              <Tooltip labelFormatter={(date) => `As of ${String(date)}`} formatter={(value, name) => [`${Number(value)}%`, name === 'actual' ? 'Actual progress' : 'Planned progress']} contentStyle={{ border: '1px solid #e6e9e3', borderRadius: 6, fontSize: 10 }} />
              <Area type="monotone" dataKey="planned" stroke="#bbc4bd" strokeWidth={1.5} strokeDasharray="5 5" fill="none" name="Planned progress" dot={{ r: 3 }} />
              <Area type="monotone" dataKey="actual" stroke="#27765f" strokeWidth={2} fill="url(#projectProgressFill)" name="Actual progress" dot={{ r: 3 }} />
            </AreaChart></ResponsiveContainer></div>
          </div>
          <div className="drawer-section">
            <div className="drawer-section-heading"><div className="section-kicker">MILESTONES & DELAY</div><button className="filter-button" type="button" onClick={() => setMilestoneDialogOpen(true)}><Plus size={13} /> Add milestone</button></div>
            <div className="milestone-table-wrap"><table className="milestone-table"><thead><tr><th>Milestone</th><th>Planned</th><th>Delay</th><th>Status</th></tr></thead><tbody>{calculateProjectFeatures(selectedProject).milestoneDelays.map((milestone) => <tr key={milestone.id}><td>{milestone.name}</td><td>{milestone.plannedFinishDate}</td><td>{milestone.delayDays === null ? '—' : `${milestone.delayDays > 0 ? '+' : ''}${milestone.delayDays}d`}</td><td><select aria-label={`Status for ${milestone.name}`} value={milestone.status} onChange={(event) => updateMilestoneStatus(milestone.id, event.target.value as MilestoneStatus)}><option>Not started</option><option>In progress</option><option>Complete</option></select></td></tr>)}</tbody></table></div>
            <p className="feature-note">Positive variance means behind schedule. Milestone delay uses actual finish when complete, otherwise forecast finish. Demo values only.</p>
          </div>
          {selectedProject.riskScoresAvailable && <>
            <div className="drawer-section"><div className="section-kicker">WHY THIS PROJECT IS AT RISK</div><div className="factor-row"><span className="factor-rank">01</span><span><strong>Permit approval lag</strong><small>Environmental review is 23 days behind baseline</small></span><b className="factor-impact">+31%</b></div><div className="factor-row"><span className="factor-rank">02</span><span><strong>Subcontractor capacity</strong><small>Two specialist crews below planned staffing</small></span><b className="factor-impact">+24%</b></div><div className="factor-row"><span className="factor-rank">03</span><span><strong>Weather exposure</strong><small>Seasonal rainfall impacts foundation window</small></span><b className="factor-impact">+16%</b></div></div>
            <div className="evidence-card"><div className="evidence-icon"><FileText size={17} /></div><div><div className="section-kicker">SUPPORTING EVIDENCE</div><strong>Weekly field report · October 1</strong><p>“Permit review remains outstanding. Foundation work cannot proceed until environmental clearance is received.”</p><button type="button">View source document <ArrowRight size={13} /></button></div></div>
            <div className="recommendation-card">
  {dismissed ? (
    <div className="dismissed-card">
      <div><X size={16} /><strong>Recommendation dismissed</strong></div>
      <p>This recommendation was dismissed. The decision is recorded in the audit trail.</p>
    </div>
  ) : (
    <div className="recommendation-card">
      <div className="recommendation-title"><Sparkles size={16} /><strong>Recommended next step</strong></div>
      <p>Schedule an agency coordination meeting to resolve permit blockers before the October 18 milestone.</p>
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
          </>}
        </aside>
      </div>}
{addProjectOpen && <AddProjectDialog onClose={() => setAddProjectOpen(false)} onSubmit={addProject} />}
{progressDialogOpen && <ProgressUpdateDialog onClose={() => setProgressDialogOpen(false)} onSubmit={updateProjectProgress} />}
{milestoneDialogOpen && <AddMilestoneDialog onClose={() => setMilestoneDialogOpen(false)} onSubmit={addMilestone} />}
    </div>
  )
}

export default App
