import type { MilestoneStatus, Project, ProgressSnapshot } from './projectFeatures'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export type ProjectPayload = {
  name: string
  agency: string
  contractor: string
  budget: string
  progress: number
  plannedProgress: number
  baselineFinishDate: string
  forecastFinishDate: string
  milestone: string
  milestoneDueDate: string
}

export type ProgressPayload = ProgressSnapshot

export type MilestonePayload = {
  name: string
  plannedFinishDate: string
  forecastFinishDate: string | null
  actualFinishDate: string | null
  status: MilestoneStatus
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null
    throw new Error(body?.message ?? `Request failed (${response.status})`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getProjects() {
  return request<Project[]>('/projects')
}

export function createProject(payload: ProjectPayload) {
  return request<Project>('/projects', { method: 'POST', body: JSON.stringify(toApiProject(payload)) })
}

export function updateProject(id: string, payload: ProjectPayload) {
  return request<Project>(`/projects/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(toApiProject(payload)) })
}

export function deleteProject(id: string) {
  return request<void>(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function createProgressSnapshot(projectId: string, payload: ProgressPayload) {
  return request<Project>(`/projects/${encodeURIComponent(projectId)}/progress`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateProgressSnapshot(projectId: string, snapshotId: string, payload: ProgressPayload) {
  return request<Project>(`/projects/${encodeURIComponent(projectId)}/progress/${encodeURIComponent(snapshotId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteProgressSnapshot(projectId: string, snapshotId: string) {
  return request<Project>(`/projects/${encodeURIComponent(projectId)}/progress/${encodeURIComponent(snapshotId)}`, {
    method: 'DELETE',
  })
}

export function createMilestone(projectId: string, payload: MilestonePayload) {
  return request<Project>(`/projects/${encodeURIComponent(projectId)}/milestones`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateMilestone(projectId: string, milestoneId: string, payload: MilestonePayload) {
  return request<Project>(`/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(milestoneId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteMilestone(projectId: string, milestoneId: string) {
  return request<Project>(`/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(milestoneId)}`, {
    method: 'DELETE',
  })
}

function toApiProject(payload: ProjectPayload) {
  const budgetCrores = Number(payload.budget.replace(/[^\d.]/g, ''))
  if (!Number.isFinite(budgetCrores)) throw new Error('Budget must be a valid number')
  return {
    name: payload.name,
    agency: payload.agency,
    contractor: payload.contractor,
    budgetCrores,
    progress: payload.progress,
    plannedProgress: payload.plannedProgress,
    baselineFinishDate: payload.baselineFinishDate,
    forecastFinishDate: payload.forecastFinishDate,
    milestoneName: payload.milestone,
    milestoneDueDate: payload.milestoneDueDate,
  }
}
