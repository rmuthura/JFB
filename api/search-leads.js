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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { city, limit = 25 } = req.query

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
      if (allResults.length >= limit) break

      const query = `${queryBase} ${city}`
      const params = new URLSearchParams({
        query,
        limit: 10,
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
    }

    return res.status(200).json({ leads: allResults })
  } catch (error) {
    console.error('Search error:', error)
    return res.status(500).json({ error: 'Failed to search for leads' })
  }
}
