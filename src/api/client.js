// API client for the swt-api Go backend. Every list endpoint returns
// { data, nextCursor, hasMore } — these functions pass that shape through
// unchanged so components can drive "load more" directly off the response.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function listEntities(cursor = '') {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  return get(`/api/entities${params}`)
}

export function getEntity(id) {
  return get(`/api/entities/${id}`)
}

export function getTimeline(entityId, { cursor = '', limit = 30, reportingOwner = '' } = {}) {
  const params = new URLSearchParams({ limit })
  if (cursor) params.set('cursor', cursor)
  if (reportingOwner) params.set('reporting_owner', reportingOwner)
  return get(`/api/entities/${entityId}/timeline?${params}`)
}

export function listFilings(entityId, { cursor = '', reportingOwner = '' } = {}) {
  const params = new URLSearchParams({ entity_id: entityId })
  if (cursor) params.set('cursor', cursor)
  if (reportingOwner) params.set('reporting_owner', reportingOwner)
  return get(`/api/filings?${params}`)
}

export function listGovEvents(entityId, cursor = '') {
  const params = new URLSearchParams({ entity_id: entityId })
  if (cursor) params.set('cursor', cursor)
  return get(`/api/gov-events?${params}`)
}

export function listCorrelations({ entityId = '', confidence = '', cursor = '' } = {}) {
  const params = new URLSearchParams()
  if (entityId) params.set('entity_id', entityId)
  if (confidence) params.set('confidence', confidence)
  if (cursor) params.set('cursor', cursor)
  return get(`/api/correlations?${params}`)
}

export async function confirmCorrelation(id, note = '') {
  const res = await fetch(`${BASE_URL}/api/correlations/${id}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  })
  if (!res.ok) throw new Error(`Confirm failed: ${res.status}`)
  return res.json()
}

export async function rejectCorrelation(id) {
  const res = await fetch(`${BASE_URL}/api/correlations/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Reject failed: ${res.status}`)
  return res.json()
}
