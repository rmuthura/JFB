const LEADS_KEY = 'jfb_leads'
const HISTORY_KEY = 'jfb_history'

export function saveLeads(leads, city) {
  const data = {
    leads,
    city,
    savedAt: new Date().toISOString()
  }
  localStorage.setItem(LEADS_KEY, JSON.stringify(data))

  // Also add to history
  addToHistory(leads, city)
}

export function loadLeads() {
  try {
    const data = localStorage.getItem(LEADS_KEY)
    return data ? JSON.parse(data) : { leads: [], city: '' }
  } catch {
    return { leads: [], city: '' }
  }
}

export function addToHistory(leads, city) {
  const history = loadHistory()

  // Don't add duplicates
  const exists = history.some(h => h.city === city && h.leads.length === leads.length)
  if (exists) return

  history.unshift({
    city,
    leads,
    leadCount: leads.length,
    date: new Date().toISOString()
  })

  // Keep only last 20 entries
  const trimmed = history.slice(0, 20)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
}

export function loadHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}
