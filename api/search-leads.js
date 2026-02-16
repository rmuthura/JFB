// Vercel Serverless Function - Search for leads via OpenWebNinja
// This keeps the API key secure on the server

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

  for (const chain of CHAIN_BLOCKLIST) {
    if (text.includes(chain)) {
      return { isChain: true, reason: `Matches known chain: ${chain}` }
    }
  }

  for (const keyword of CHAIN_KEYWORDS) {
    if (text.includes(keyword)) {
      return { isChain: true, reason: `Contains chain keyword: ${keyword}` }
    }
  }

  return { isChain: false, reason: null }
}

function generateLinkedInUrl(companyName) {
  const searchQuery = `${companyName} owner`
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { city, filterChains = 'true' } = req.query
  const shouldFilterChains = filterChains === 'true'

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' })
  }

  const API_KEY = process.env.OPENWEBNINJA_API_KEY
  if (!API_KEY) {
    return res.status(500).json({ error: 'OpenWebNinja API key not configured' })
  }

  const BASE_URL = 'https://api.openwebninja.com/local-business-data/search'
  const allResults = []
  const seenIds = new Set()

  try {
    for (const queryBase of SEARCH_QUERIES) {
      const query = `${queryBase} ${city}`
      const params = new URLSearchParams({
        query,
        limit: 50,  // Increased from 10 to get more results
        language: 'en',
        region: 'us'
      })

      const response = await fetch(`${BASE_URL}?${params}`, {
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
        if (shouldFilterChains && lead.isChain) {
          continue
        }

        allResults.push(lead)
      }
    }

    return res.status(200).json({ leads: allResults })
  } catch (error) {
    console.error('Search error:', error)
    return res.status(500).json({ error: 'Failed to search for leads' })
  }
}
