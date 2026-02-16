// Vercel Serverless Function - Scrape contact info from websites
// Extracts emails and owner names from contact/about pages

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

  const { websites } = req.body

  if (!websites || !Array.isArray(websites)) {
    return res.status(400).json({ error: 'websites array is required' })
  }

  const results = {}

  // Process up to 10 websites to avoid timeout
  const toProcess = websites.slice(0, 10)

  for (const website of toProcess) {
    try {
      const contactInfo = await scrapeWebsite(website)
      results[website] = contactInfo
    } catch (error) {
      console.error(`Error scraping ${website}:`, error.message)
      results[website] = { found: false, error: error.message }
    }

    // Small delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  return res.status(200).json({ results })
}

async function scrapeWebsite(website) {
  // Normalize URL
  const baseUrl = website.startsWith('http') ? website : `https://${website}`

  // Try to fetch the main page first
  let html = await fetchPage(baseUrl)

  if (!html) {
    return { found: false, error: 'Could not fetch page' }
  }

  // Extract emails from main page
  let emails = extractEmails(html)
  let ownerName = extractOwnerName(html)

  // If no emails found, try common contact page URLs
  if (emails.length === 0) {
    const contactPaths = ['/contact', '/contact-us', '/about', '/about-us', '/team', '/our-team']

    for (const path of contactPaths) {
      try {
        const contactUrl = new URL(path, baseUrl).href
        const contactHtml = await fetchPage(contactUrl)

        if (contactHtml) {
          const pageEmails = extractEmails(contactHtml)
          emails = [...emails, ...pageEmails]

          if (!ownerName) {
            ownerName = extractOwnerName(contactHtml)
          }

          if (emails.length > 0) break
        }
      } catch (e) {
        // Continue to next path
      }
    }
  }

  // Dedupe and prioritize emails
  const uniqueEmails = [...new Set(emails)]
  const bestEmail = prioritizeEmail(uniqueEmails)

  return {
    found: !!bestEmail,
    email: bestEmail,
    allEmails: uniqueEmails.slice(0, 5),
    ownerName: ownerName,
  }
}

async function fetchPage(url) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JFBLeadFinder/1.0)',
        'Accept': 'text/html',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!response.ok) return null

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('text/html')) return null

    return await response.text()
  } catch (error) {
    return null
  }
}

function extractEmails(html) {
  // Email regex pattern
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const matches = html.match(emailRegex) || []

  // Filter out common non-contact emails
  const filtered = matches.filter(email => {
    const lower = email.toLowerCase()
    return !lower.includes('example.com') &&
           !lower.includes('domain.com') &&
           !lower.includes('email.com') &&
           !lower.includes('sentry.io') &&
           !lower.includes('wixpress.com') &&
           !lower.includes('wordpress') &&
           !lower.includes('.png') &&
           !lower.includes('.jpg') &&
           !lower.includes('.gif')
  })

  return filtered
}

function extractOwnerName(html) {
  // Look for common owner/founder patterns
  const patterns = [
    /(?:owner|founder|ceo|president|proprietor)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    /([A-Z][a-z]+\s+[A-Z][a-z]+)[,\s]+(?:owner|founder|ceo|president|proprietor)/i,
    /<(?:h[1-6]|p|span)[^>]*>([A-Z][a-z]+\s+[A-Z][a-z]+)[,\s]*-?\s*(?:owner|founder|ceo|president)/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return null
}

function prioritizeEmail(emails) {
  if (emails.length === 0) return null
  if (emails.length === 1) return emails[0]

  // Priority order: owner, info, contact, hello, admin, then others
  const priorityPrefixes = ['owner', 'info', 'contact', 'hello', 'admin', 'sales']

  for (const prefix of priorityPrefixes) {
    const match = emails.find(e => e.toLowerCase().startsWith(prefix))
    if (match) return match
  }

  // Return first email if no priority match
  return emails[0]
}
