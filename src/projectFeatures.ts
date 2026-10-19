export type MilestoneStatus = 'Not started' | 'In progress' | 'Complete'

export type Milestone = {
  id: string
  name: string
  plannedFinishDate: string
  forecastFinishDate: string | null
  actualFinishDate: string | null
  status: MilestoneStatus
}

export type ProgressSnapshot = {
  date: string
  planned: number
  actual: number
}

export type Project = {
  id: string
  name: string
  agency: string
  contractor: string
  budget: string
  progress: number
  plannedProgress: number
  progressAsOfDate: string
  progressHistory: ProgressSnapshot[]
  baselineFinishDate: string
  forecastFinishDate: string
  delayRisk: number
  costRisk: number
  riskScoresAvailable: boolean
  status: string
  color: string
  initials: string
  milestone: string
  due: string
  milestones: Milestone[]
}

function daysBetween(startDate: string, endDate: string): number | null {
  const start = Date.parse(`${startDate}T00:00:00Z`)
  const end = Date.parse(`${endDate}T00:00:00Z`)

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  return Math.round((end - start) / 86_400_000)
}

export function calculateProjectFeatures(project: Project) {
  return {
    progressVariance: project.progress - project.plannedProgress,
    scheduleVarianceDays: daysBetween(project.baselineFinishDate, project.forecastFinishDate),
    milestoneDelays: project.milestones.map((milestone) => ({
      ...milestone,
      delayDays: daysBetween(
        milestone.plannedFinishDate,
        milestone.actualFinishDate ?? milestone.forecastFinishDate ?? '',
      ),
    })),
  }
}
