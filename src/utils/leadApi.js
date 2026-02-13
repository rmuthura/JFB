// Lead API - calls serverless functions in production, direct API in dev

const isDev = import.meta.env.DEV

// For local development, use direct API calls
// For production (Vercel), use serverless functions
const API_BASE = isDev ? '' : ''

// Search queries for flooring contractors (used in dev mode)
const SEARCH_QUERIES = [
  'epoxy flooring',
  'flooring contractor',
  'concrete coatings',
  'floor coatings',
  'industrial flooring',
  'commercial flooring',
]

export async function searchLeads(city, limit = 25) {
  if (isDev) {
    // Development: call OpenWebNinja directly
    return searchLeadsDev(city, limit)
  }

  // Production: call serverless function
  const response = await fetch(`/api/search-leads?city=${encodeURIComponent(city)}&limit=${limit}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to search for leads')
  }

  const data = await response.json()
  return data.leads
}

// Development mode - direct API call
async function searchLeadsDev(city, limit = 25) {
  const API_KEY = import.meta.env.VITE_OPENWEBNINJA_API_KEY
  const BASE_URL = 'https://api.openwebninja.com/local-business-data/search'

  if (!API_KEY) {
    throw new Error('Missing VITE_OPENWEBNINJA_API_KEY in environment')
  }

  const allResults = []
  const seenIds = new Set()

  for (const queryBase of SEARCH_QUERIES) {
    if (allResults.length >= limit) break

    const query = `${queryBase} ${city}`

    try {
      const response = await fetch(`${BASE_URL}?${new URLSearchParams({
        query,
        limit: 10,
        language: 'en',
        region: 'us'
      })}`, {
        headers: { 'x-api-key': API_KEY }
      })

      if (!response.ok) {
        console.error(`API error: ${response.status}`)
        continue
      }

      const data = await response.json()

      for (const biz of data.data || []) {
        if (seenIds.has(biz.business_id)) continue
        seenIds.add(biz.business_id)

        if (allResults.length >= limit) break

        allResults.push({
          id: biz.business_id,
          name: biz.name,
          website: biz.website || null,
          email: null,
          phone: biz.phone_number || null,
          address: biz.full_address || null,
          city: city,
          lat: biz.latitude,
          lng: biz.longitude,
          rating: biz.rating,
          reviewCount: biz.review_count || 0,
          types: biz.types || [],
        })
      }
    } catch (error) {
      console.error(`Search error for "${queryBase}":`, error)
    }
  }

  return allResults
}

// Find emails for leads using Hunter.io
export async function findEmails(leads) {
  // Extract domains from website URLs
  const domains = leads
    .filter(lead => lead.website)
    .map(lead => {
      try {
        const url = new URL(lead.website.startsWith('http') ? lead.website : `https://${lead.website}`)
        return url.hostname.replace('www.', '')
      } catch {
        return null
      }
    })
    .filter(Boolean)

  if (domains.length === 0) {
    return leads
  }

  try {
    let results

    if (isDev) {
      // In dev, we'd need Hunter API key in frontend - skip for now
      console.log('Email lookup skipped in dev mode (requires Hunter.io API)')
      return leads
    }

    // Production: call serverless function
    const response = await fetch('/api/find-emails-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains })
    })

    if (!response.ok) {
      console.error('Email lookup failed')
      return leads
    }

    const data = await response.json()
    results = data.results

    // Merge emails back into leads
    return leads.map(lead => {
      if (!lead.website) return lead

      try {
        const url = new URL(lead.website.startsWith('http') ? lead.website : `https://${lead.website}`)
        const domain = url.hostname.replace('www.', '')
        const emailData = results[domain]

        if (emailData?.found) {
          return {
            ...lead,
            email: emailData.email,
            contactName: emailData.firstName && emailData.lastName
              ? `${emailData.firstName} ${emailData.lastName}`
              : null
          }
        }
      } catch {
        // Invalid URL
      }

      return lead
    })
  } catch (error) {
    console.error('Email lookup error:', error)
    return leads
  }
}
