import { useMemo, useState } from 'react'
import { Activity, ArrowRight, BriefcaseBusiness, CalendarDays, CircleDollarSign, FileSearch, FileText, FolderOpen, Plus, ShieldAlert, UsersRound } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Project } from './projectFeatures'
import './WorkspacePages.css'

type ProjectRecord = Project

type PageProps = {
  projects: ProjectRecord[]
  onSelectProject: (project: ProjectRecord) => void
  onGoToProjects: () => void
  onAddProject?: () => void
}

const documents = [
  { id: 'DOC-1048', title: 'Weekly field report', project: 'East River Flood Barrier', projectId: 'CP-2048', date: 'Oct 1, 2026', type: 'Field report', status: 'Reviewed', excerpt: 'Permit review remains outstanding. Foundation work cannot proceed until environmental clearance is received. The team has requested an updated review date from the agency.' },
  { id: 'DOC-1039', title: 'Environmental permit status', project: 'East River Flood Barrier', projectId: 'CP-2048', date: 'Sep 28, 2026', type: 'Permit update', status: 'Needs review', excerpt: 'The environmental review is still in progress. No revised approval date has been confirmed in this update.' },
  { id: 'DOC-1026', title: 'Monthly cost report', project: 'I-405 Sound Wall Expansion', projectId: 'CP-1932', date: 'Sep 30, 2026', type: 'Cost report', status: 'Reviewed', excerpt: 'Several material line items have moved above the original estimate. The project team is preparing a change forecast for the next review.' },
  { id: 'DOC-1017', title: 'North corridor progress photos', project: 'I-405 Sound Wall Expansion', projectId: 'CP-1932', date: 'Sep 26, 2026', type: 'Progress update', status: 'Reviewed', excerpt: 'Work continues along the north corridor. The next update should include the paving schedule and the revised material delivery dates.' },
  { id: 'DOC-1008', title: 'Commissioning readiness checklist', project: 'Civic Center Modernization', projectId: 'CP-1876', date: 'Sep 25, 2026', type: 'Checklist', status: 'Reviewed', excerpt: 'Systems commissioning preparation is underway. Remaining checks are assigned to the electrical and building controls teams.' },
  { id: 'DOC-0993', title: 'Water main cost and quantity update', project: 'South County Water Main', projectId: 'CP-1764', date: 'Sep 24, 2026', type: 'Cost report', status: 'Needs review', excerpt: 'Reported spending is running ahead of installed quantities. The next review should reconcile invoices against completed work.' },
]

const signals = [
  { projectId: 'CP-2048', category: 'Schedule', title: 'Permit review is holding up foundation work', detail: 'Environmental clearance is still outstanding ahead of the October 18 milestone.', score: 78, updated: '2 hours ago' },
  { projectId: 'CP-1932', category: 'Cost', title: 'Material costs are trending above estimate', detail: 'Recent material line items are higher than the original estimate.', score: 56, updated: '5 hours ago' },
  { projectId: 'CP-1764', category: 'Cost', title: 'Spend is ahead of completed work', detail: 'Reported spending and installed quantities may need to be reconciled.', score: 47, updated: 'Yesterday' },
]

function StatusPill({ project }: { project: ProjectRecord }) {
  return <span className={`status-pill status-${project.color}`}><i />{project.status}</span>
}

function ProjectTable({ projects, onSelectProject }: PageProps) {
  if (projects.length === 0) return <div className="workspace-empty">No projects match this filter.</div>

  return (
    <div className="workspace-table-scroll">
      <table className="workspace-table">
        <thead><tr><th>Project</th><th>Agency</th><th>Contractor</th><th>Budget</th><th>Progress</th><th>Delay risk</th><th>Cost risk</th><th>Status</th></tr></thead>
        <tbody>{projects.map((project) => <tr key={project.id} onClick={() => onSelectProject(project)}>
          <td><button className="workspace-project-link" type="button" onClick={(event) => { event.stopPropagation(); onSelectProject(project) }}><strong>{project.name}</strong><small>{project.id}</small></button></td>
          <td>{project.agency}</td><td>{project.contractor}</td><td className="workspace-budget">{project.budget}</td>
          <td><div className="workspace-progress"><span><i style={{ width: `${project.progress}%` }} /></span>{project.progress}%</div></td>
          <td><span className={`workspace-risk ${project.riskScoresAvailable ? project.delayRisk >= 65 ? 'risk-high' : project.delayRisk >= 40 ? 'risk-mid' : 'risk-low' : ''}`}>{project.riskScoresAvailable ? `${project.delayRisk}%` : 'Not scored'}</span></td>
          <td><span className={`workspace-risk ${project.riskScoresAvailable ? project.costRisk >= 65 ? 'risk-high' : project.costRisk >= 40 ? 'risk-mid' : 'risk-low' : ''}`}>{project.riskScoresAvailable ? `${project.costRisk}%` : 'Not scored'}</span></td>
          <td><StatusPill project={project} /></td>
        </tr>)}</tbody>
      </table>
    </div>
  )
}

export function ProjectsPage({ projects, onSelectProject, onAddProject }: PageProps) {
  const [statusFilter, setStatusFilter] = useState('All projects')
  const filteredProjects = statusFilter === 'All projects' ? projects : projects.filter((project) => project.status === statusFilter)
  const statuses = ['All projects', 'Action needed', 'Watch closely', 'On track']

  return <div className="workspace-page-content">
    <div className="workspace-page-toolbar"><div className="workspace-tabs" aria-label="Filter projects">{statuses.map((status) => <button key={status} className={statusFilter === status ? 'workspace-tab active' : 'workspace-tab'} type="button" onClick={() => setStatusFilter(status)}>{status}</button>)}</div><span className="workspace-result-count">{filteredProjects.length} shown · sample data</span></div>
    <section className="workspace-panel"><div className="workspace-panel-heading"><div><span className="section-kicker">CONTRACT REGISTER</span><h2>Project portfolio</h2></div><button className="filter-button add-project-button" type="button" onClick={onAddProject}><Plus size={14} /> Add project</button></div><ProjectTable projects={filteredProjects} onSelectProject={onSelectProject} onGoToProjects={() => {}} /></section>
  </div>
}

export function RiskSignalsPage({ projects, onSelectProject }: PageProps) {
  const [category, setCategory] = useState('All signals')
  const shownSignals = signals.filter((signal) => category === 'All signals' || signal.category === category)
  const projectById = new Map(projects.map((project) => [project.id, project]))

  return <div className="workspace-page-content">
    <div className="workspace-page-toolbar"><div className="workspace-tabs" aria-label="Filter signals">{['All signals', 'Schedule', 'Cost'].map((filter) => <button key={filter} className={category === filter ? 'workspace-tab active' : 'workspace-tab'} type="button" onClick={() => setCategory(filter)}>{filter}</button>)}</div><span className="workspace-result-count">{shownSignals.length} signals · sample data</span></div>
    <section className="workspace-panel"><div className="workspace-panel-heading"><div><span className="section-kicker">REVIEW QUEUE</span><h2>Signals to review</h2></div><p>These sample flags are prompts for human review, not verified predictions.</p></div>
      <div className="signal-page-list">{shownSignals.map((signal) => {
        const project = projectById.get(signal.projectId)
        if (!project) return null
        return <button className="signal-page-row" type="button" key={signal.projectId} onClick={() => onSelectProject(project)}><span className={`signal-page-icon ${signal.score >= 65 ? 'signal-page-high' : 'signal-page-watch'}`}><ShieldAlert size={18} /></span><span className="signal-page-copy"><span className="signal-page-meta">{signal.category} concern <i>·</i> {signal.updated}</span><strong>{signal.title}</strong><small>{project.name} <i>·</i> {signal.detail}</small></span><span className={`workspace-risk ${signal.score >= 65 ? 'risk-high' : 'risk-mid'}`}>{signal.score}%<small>sample score</small></span><ArrowRight size={17} /></button>
      })}</div>
    </section>
    <p className="workspace-footnote"><Activity size={15} /> Risk values in this demo are static examples. A production model would need to be tested and validated.</p>
  </div>
}

export function DocumentsPage({ projects, onSelectProject }: PageProps) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All documents')
  const [selectedDocumentId, setSelectedDocumentId] = useState(documents[0].id)
  const types = ['All documents', 'Field report', 'Permit update', 'Cost report', 'Progress update', 'Checklist']
  const filteredDocuments = useMemo(() => documents.filter((document) => {
    const matchesType = typeFilter === 'All documents' || document.type === typeFilter
    const matchesQuery = `${document.title} ${document.project} ${document.type}`.toLowerCase().includes(query.toLowerCase())
    return matchesType && matchesQuery
  }), [query, typeFilter])
  const selectedDocument = filteredDocuments.find((document) => document.id === selectedDocumentId) ?? filteredDocuments[0]

  return <div className="workspace-page-content">
    <section className="workspace-panel documents-toolbar"><div><span className="section-kicker">PROJECT RECORDS</span><h2>Documents and updates</h2><p>Sample reports attached to projects in this demo.</p></div><label className="document-search"><FileSearch size={16} /><input aria-label="Search documents" placeholder="Find a document or project" value={query} onChange={(event) => setQuery(event.target.value)} /></label></section>
    <div className="document-filters">{types.map((type) => <button key={type} className={typeFilter === type ? 'document-filter selected' : 'document-filter'} type="button" onClick={() => setTypeFilter(type)}>{type}</button>)}</div>
    <div className="documents-layout"><section className="workspace-panel document-list-panel"><div className="document-list-heading"><strong>{filteredDocuments.length} documents</strong><span>Newest first</span></div>{filteredDocuments.length ? filteredDocuments.map((document) => <button type="button" key={document.id} className={`document-row ${selectedDocument?.id === document.id ? 'document-row-selected' : ''}`} onClick={() => setSelectedDocumentId(document.id)}><span className="document-file-icon"><FileText size={17} /></span><span className="document-row-copy"><strong>{document.title}</strong><small>{document.project}</small></span><span className="document-row-date">{document.date}</span></button>) : <div className="workspace-empty">No matching documents. Try another search.</div>}</section>
      <aside className="workspace-panel document-preview">{selectedDocument ? <><div className="preview-topline"><span className="document-file-icon"><FileText size={18} /></span><span className="document-status">{selectedDocument.status}</span></div><span className="section-kicker">{selectedDocument.type.toUpperCase()} <i>·</i> {selectedDocument.id}</span><h2>{selectedDocument.title}</h2><p className="preview-project">{selectedDocument.project}</p><div className="preview-rule" /><p className="preview-excerpt">“{selectedDocument.excerpt}”</p><div className="preview-footer"><span><CalendarDays size={14} /> {selectedDocument.date}</span><button type="button" onClick={() => { const project = projects.find((item) => item.id === selectedDocument.projectId); if (project) onSelectProject(project) }}>Open project <ArrowRight size={14} /></button></div></> : <div className="workspace-empty">Choose a document to preview.</div>}</aside>
    </div>
    <p className="workspace-footnote"><FileSearch size={15} /> Document search and excerpts use sample content. Secure document storage and retrieval are future backend work.</p>
  </div>
}

export function ContractorsPage({ projects, onSelectProject }: PageProps) {
  const contractorGroups = Array.from(new Map(projects.map((project) => [project.contractor, projects.filter((item) => item.contractor === project.contractor)])).values())
  return <div className="workspace-page-content">
    <section className="workspace-panel"><div className="workspace-panel-heading"><div><span className="section-kicker">DELIVERY PARTNERS</span><h2>Contractor performance</h2></div><p>Contractors are grouped from the sample project list.</p></div>
      <div className="contractor-grid">{contractorGroups.map((group) => {
        const contractor = group[0].contractor
        const averageProgress = Math.round(group.reduce((sum, project) => sum + project.progress, 0) / group.length)
        const scoredProjects = group.filter((project) => project.riskScoresAvailable)
        const highestRisk = scoredProjects.length
          ? Math.max(...scoredProjects.map((project) => Math.max(project.delayRisk, project.costRisk)))
          : null
        return <article className="contractor-card" key={contractor}><div className="contractor-card-head"><span className="contractor-avatar"><UsersRound size={17} /></span><span className={`workspace-risk ${highestRisk === null ? '' : highestRisk >= 65 ? 'risk-high' : highestRisk >= 40 ? 'risk-mid' : 'risk-low'}`}>{highestRisk === null ? 'Not scored' : `${highestRisk}%`}<small>highest project risk</small></span></div><h3>{contractor}</h3><p>{group.map((project) => project.agency).join(', ')}</p><div className="contractor-stats"><span><small>Projects</small><strong>{group.length}</strong></span><span><small>Average progress</small><strong>{averageProgress}%</strong></span><span><small>Contract value</small><strong>₹{group.reduce((sum, project) => sum + Number(project.budget.replace(/[₹\sCr,]/g, '')), 0).toFixed(2)} Cr</strong></span></div><div className="contractor-projects"><span className="section-kicker">PROJECTS</span>{group.map((project) => <button type="button" key={project.id} onClick={() => onSelectProject(project)}>{project.name}<ArrowRight size={14} /></button>)}</div></article>
      })}</div>
    </section>
    <p className="workspace-footnote"><UsersRound size={15} /> Contractor information is summarized from the visible sample projects; no external performance data is connected.</p>
  </div>
}

export function BudgetPage({ projects, onSelectProject }: PageProps) {
  const budgetRows = projects.map((project) => ({ name: project.name, shortName: project.name.length > 21 ? `${project.name.slice(0, 18)}...` : project.name, budget: Number(project.budget.replace(/[₹\sCr,]/g, '')), progress: project.progress, project }))
  const totalBudget = budgetRows.reduce((sum, row) => sum + row.budget, 0)
  const attentionCount = projects.filter((project) => project.riskScoresAvailable && project.costRisk >= 40).length

  return <div className="workspace-page-content">
    <section className="budget-summary-grid"><article className="budget-summary"><span><CircleDollarSign size={17} /> Visible sample commitments</span><strong>₹{totalBudget.toFixed(2)} Cr</strong><small>4 projects shown in this workspace</small></article><article className="budget-summary"><span><Activity size={17} /> Cost items to review</span><strong>{attentionCount}</strong><small>Cost-risk score at or above 40</small></article><article className="budget-summary"><span><BriefcaseBusiness size={17} /> Portfolio context</span><strong>₹84.26 Cr</strong><small>Illustrative total for 12 contracts</small></article></section>
    <section className="workspace-panel budget-chart-panel"><div className="workspace-panel-heading"><div><span className="section-kicker">COMMITTED BUDGET · INR</span><h2>Visible projects by contract value</h2></div><p>Sample commitments in Indian rupees, not live spend.</p></div><div className="budget-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={budgetRows} layout="vertical" margin={{ top: 5, right: 20, left: 8, bottom: 0 }}><CartesianGrid stroke="#e9ece7" strokeDasharray="3 5" horizontal={false} /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#77847a', fontSize: 11 }} tickFormatter={(value: number) => `₹${value} Cr`} /><YAxis type="category" dataKey="shortName" width={155} axisLine={false} tickLine={false} tick={{ fill: '#4e5c52', fontSize: 11 }} /><Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)} Cr`, 'Committed budget']} contentStyle={{ border: '1px solid #e6e9e3', borderRadius: 7, fontSize: 12 }} /><Bar dataKey="budget" fill="#54876b" radius={[0, 4, 4, 0]} barSize={19} /></BarChart></ResponsiveContainer></div></section>
    <section className="workspace-panel budget-table-panel"><div className="workspace-panel-heading"><div><span className="section-kicker">COST REVIEW</span><h2>Cost risk by project</h2></div></div><div className="budget-cost-list">{projects.map((project) => <button type="button" key={project.id} onClick={() => onSelectProject(project)}><span><strong>{project.name}</strong><small>{project.budget} committed</small></span><span className="budget-risk-track"><i className={project.costRisk >= 65 ? 'budget-risk-high' : project.costRisk >= 40 ? 'budget-risk-mid' : 'budget-risk-low'} style={{ width: `${project.riskScoresAvailable ? project.costRisk : 0}%` }} /></span><b className={`workspace-risk ${project.riskScoresAvailable ? project.costRisk >= 65 ? 'risk-high' : project.costRisk >= 40 ? 'risk-mid' : 'risk-low' : ''}`}>{project.riskScoresAvailable ? `${project.costRisk}%` : 'Not scored'}</b><ArrowRight size={15} /></button>)}</div></section>
    <p className="workspace-footnote"><CircleDollarSign size={15} /> This view compares sample contract commitments and sample cost-risk values. Actual invoices, payments, and cost forecasts are not connected.</p>
  </div>
}

export function HelpPage({ onGoToProjects }: Pick<PageProps, 'onGoToProjects'>) {
  return <div className="workspace-page-content"><section className="workspace-panel help-panel"><span className="section-kicker">GETTING STARTED</span><h2>How to use the portfolio</h2><p>Start with the overview, open a signal to understand the project context, then review its evidence before deciding on a follow-up.</p><div className="help-steps"><div><span>01</span><strong>Find a project</strong><small>Use the project list or priority signals.</small></div><div><span>02</span><strong>Review the details</strong><small>Check milestones, risk reasons and sample evidence.</small></div><div><span>03</span><strong>Choose a response</strong><small>Approve or dismiss the recommendation. Demo decisions are not saved.</small></div></div><button className="help-primary-action" type="button" onClick={onGoToProjects}>Browse projects <ArrowRight size={15} /></button></section><p className="workspace-footnote"><FolderOpen size={15} /> This help page describes the current frontend demo. All shown project information is sample data.</p></div>
}
