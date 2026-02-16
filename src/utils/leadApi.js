// Lead API - calls serverless functions in production, direct API in dev

const isDev = import.meta.env.DEV

// For local development, use direct API calls
// For production (Vercel), use serverless functions
const API_BASE = isDev ? '' : ''

// Search queries for flooring contractors (used in dev mode)
// Tier 1 - Primary targets (highest priority)
// Tier 2 - Strong adjacent
// Tier 3 - Opportunistic
const SEARCH_QUERIES = [
  // Tier 1 - Primary targets
  'commercial epoxy flooring contractor',
  'resinous flooring contractor',
  'industrial floor coatings contractor',
  'concrete coatings contractor',
  // Tier 2 - Strong adjacent
  'commercial flooring contractor',
  'industrial painting contractor',
  'facility maintenance contractor',
  // Tier 3 - Opportunistic
  'concrete polishing contractor',
  'commercial property maintenance',
]

export async function searchLeads(city, options = {}) {
  const { filterChains = true } = options

  if (isDev) {
    // Development: call OpenWebNinja directly
    return searchLeadsDev(city, { filterChains })
  }

  // Production: call serverless function
  const params = new URLSearchParams({ city, filterChains })
  const response = await fetch(`/api/search-leads?${params}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to search for leads')
  }

  const data = await response.json()
  return data.leads
}

// Development mode - direct API call
async function searchLeadsDev(city, options = {}) {
  const { filterChains = true } = options
  const API_KEY = import.meta.env.VITE_OPENWEBNINJA_API_KEY
  const BASE_URL = 'https://api.openwebninja.com/local-business-data/search'

  if (!API_KEY) {
    throw new Error('Missing VITE_OPENWEBNINJA_API_KEY in environment')
  }

  const allResults = []
  const seenIds = new Set()

  for (const queryBase of SEARCH_QUERIES) {
    const query = `${queryBase} ${city}`

    try {
      const response = await fetch(`${BASE_URL}?${new URLSearchParams({
        query,
        limit: 50,  // Increased from 10 to get more results per query
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

        const lead = {
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
          linkedInUrl: generateLinkedInUrl(biz.name),
        }

        // Check if it's a chain store
        const chainCheck = detectChain(biz.name, biz.types || [])
        lead.isChain = chainCheck.isChain
        lead.chainReason = chainCheck.reason

        // Filter out chains if requested
        if (filterChains && lead.isChain) {
          continue
        }

        allResults.push(lead)
      }
    } catch (error) {
      console.error(`Search error for "${queryBase}":`, error)
    }
  }

  return allResults
}

// Generate LinkedIn search URL for finding business owner
function generateLinkedInUrl(companyName) {
  const searchQuery = `${companyName} owner`
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`
}

// Chain store detection
const CHAIN_BLOCKLIST = [
  'garage kings', 'garageexperts', 'garage experts', 'garage force',
  'concrete craft', 'guardian', 'floor coverings international',
  'n-hance', 'chem-dry', 'certapro', 'college hunks',
  'servpro', 'stanley steemer', '1-800', 'the grounds guys',
  'home depot', 'lowes', 'sherwin williams', 'ppg', 'benjamin moore',
  'flooring america', 'carpet one', 'empire today', 'lumber liquidators',
  'floor & decor', 'tile shop', 'menards', 'ace hardware',
  'precision garage door', 'overhead door', 'clopay',
  'mach 1 epoxy', 'mach one epoxy', 'hello garage', 'tailored living',
]

const CHAIN_KEYWORDS = [
  'franchise', 'franchising', 'locations nationwide', 'national brand',
  'serving multiple', 'multiple locations', 'locations across',
]

function detectChain(name, types = []) {
  const text = `${name} ${types.join(' ')}`.toLowerCase()

  // Check blocklist
  for (const chain of CHAIN_BLOCKLIST) {
    if (text.includes(chain)) {
      return { isChain: true, reason: `Matches known chain: ${chain}` }
    }
  }

  // Check chain keywords
  for (const keyword of CHAIN_KEYWORDS) {
    if (text.includes(keyword)) {
      return { isChain: true, reason: `Contains chain keyword: ${keyword}` }
    }
  }

  return { isChain: false, reason: null }
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

// Scrape contact pages for emails and owner names
export async function scrapeContacts(leads) {
  // Get websites that don't have emails yet
  const websites = leads
    .filter(lead => lead.website && (!lead.email || lead.email === 'Not found'))
    .map(lead => lead.website)

  if (websites.length === 0) {
    return leads
  }

  if (isDev) {
    console.log('Contact scraping skipped in dev mode (requires serverless function)')
    return leads
  }

  try {
    // Process in batches of 10
    const results = {}

    for (let i = 0; i < websites.length; i += 10) {
      const batch = websites.slice(i, i + 10)

      const response = await fetch('/api/scrape-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websites: batch })
      })

      if (response.ok) {
        const data = await response.json()
        Object.assign(results, data.results)
      }
    }

    // Merge scraped data into leads
    return leads.map(lead => {
      if (!lead.website) return lead

      const scrapedData = results[lead.website]
      if (scrapedData?.found) {
        return {
          ...lead,
          email: lead.email || scrapedData.email,
          ownerName: scrapedData.ownerName || lead.ownerName,
          scrapedEmails: scrapedData.allEmails,
        }
      }

      return lead
    })
  } catch (error) {
    console.error('Contact scraping error:', error)
    return leads
  }
}
