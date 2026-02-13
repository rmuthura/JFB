// Vercel Serverless Function - Find email via Hunter.io
// Looks up email addresses from company domain

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { domain } = req.query

  if (!domain) {
    return res.status(400).json({ error: 'Domain parameter is required' })
  }

  const API_KEY = process.env.HUNTER_API_KEY
  if (!API_KEY) {
    return res.status(500).json({ error: 'Hunter.io API key not configured' })
  }

  try {
    // Hunter.io Domain Search - finds emails associated with a domain
    const params = new URLSearchParams({
      domain: domain,
      api_key: API_KEY
    })

    const response = await fetch(`https://api.hunter.io/v2/domain-search?${params}`)
    const data = await response.json()

    if (!response.ok) {
      console.error('Hunter.io error:', data)
      return res.status(response.status).json({
        error: data.errors?.[0]?.details || 'Failed to find email'
      })
    }

    // Get the best email (first one with highest confidence)
    const emails = data.data?.emails || []

    if (emails.length === 0) {
      return res.status(200).json({ email: null, found: false })
    }

    // Sort by confidence and get the best one
    const bestEmail = emails.sort((a, b) => b.confidence - a.confidence)[0]

    return res.status(200).json({
      email: bestEmail.value,
      confidence: bestEmail.confidence,
      firstName: bestEmail.first_name,
      lastName: bestEmail.last_name,
      position: bestEmail.position,
      found: true
    })
  } catch (error) {
    console.error('Hunter.io error:', error)
    return res.status(500).json({ error: 'Failed to find email' })
  }
}
