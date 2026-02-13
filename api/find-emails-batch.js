// Vercel Serverless Function - Batch find emails via Hunter.io
// Finds emails for multiple domains at once

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { domains } = req.body

  if (!domains || !Array.isArray(domains)) {
    return res.status(400).json({ error: 'domains array is required in request body' })
  }

  const API_KEY = process.env.HUNTER_API_KEY
  if (!API_KEY) {
    return res.status(500).json({ error: 'Hunter.io API key not configured' })
  }

  const results = {}

  // Process domains (limit to avoid rate limits)
  const domainsToProcess = domains.slice(0, 10) // Max 10 per request

  for (const domain of domainsToProcess) {
    if (!domain) continue

    try {
      const params = new URLSearchParams({
        domain: domain,
        api_key: API_KEY
      })

      const response = await fetch(`https://api.hunter.io/v2/domain-search?${params}`)
      const data = await response.json()

      if (response.ok && data.data?.emails?.length > 0) {
        const bestEmail = data.data.emails.sort((a, b) => b.confidence - a.confidence)[0]
        results[domain] = {
          email: bestEmail.value,
          confidence: bestEmail.confidence,
          firstName: bestEmail.first_name,
          lastName: bestEmail.last_name,
          found: true
        }
      } else {
        results[domain] = { email: null, found: false }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`Error for ${domain}:`, error)
      results[domain] = { email: null, found: false, error: true }
    }
  }

  return res.status(200).json({ results })
}
