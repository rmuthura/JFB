const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API Keys from environment
const OPENWEBNINJA_API_KEY = process.env.OPENWEBNINJA_API_KEY;
const HUNTER_API_KEY = process.env.HUNTER_API_KEY;

// Search queries - Tier 1, 2, 3
const SEARCH_QUERIES = [
  'commercial epoxy flooring contractor',
  'resinous flooring contractor',
  'industrial floor coatings contractor',
  'concrete coatings contractor',
  'commercial flooring contractor',
  'industrial painting contractor',
  'facility maintenance contractor',
  'concrete polishing contractor',
  'commercial property maintenance',
];

// Chain detection
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
];

const CHAIN_KEYWORDS = [
  'franchise', 'franchising', 'locations nationwide', 'national brand',
  'serving multiple', 'multiple locations', 'locations across',
];

function detectChain(name, types) {
  types = types || [];
  const text = (name + ' ' + types.join(' ')).toLowerCase();

  for (const chain of CHAIN_BLOCKLIST) {
    if (text.includes(chain)) {
      return { isChain: true, reason: 'Matches known chain: ' + chain };
    }
  }

  for (const keyword of CHAIN_KEYWORDS) {
    if (text.includes(keyword)) {
      return { isChain: true, reason: 'Contains chain keyword: ' + keyword };
    }
  }

  return { isChain: false, reason: null };
}

function generateLinkedInUrl(companyName) {
  const searchQuery = companyName + ' owner';
  return 'https://www.linkedin.com/search/results/people/?keywords=' + encodeURIComponent(searchQuery);
}

// Search leads endpoint
app.get('/api/search-leads', async (req, res) => {
  const city = req.query.city;
  const filterChains = req.query.filterChains !== 'false';

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  if (!OPENWEBNINJA_API_KEY) {
    return res.status(500).json({ error: 'OpenWebNinja API key not configured' });
  }

  const BASE_URL = 'https://api.openwebninja.com/local-business-data/search';
  const allResults = [];
  const seenIds = new Set();

  try {
    for (const queryBase of SEARCH_QUERIES) {
      const query = queryBase + ' ' + city;
      const params = new URLSearchParams({
        query: query,
        limit: '50',
        language: 'en',
        region: 'us'
      });

      const response = await fetch(BASE_URL + '?' + params.toString(), {
        headers: { 'x-api-key': OPENWEBNINJA_API_KEY }
      });

      if (!response.ok) {
        console.error('API error: ' + response.status);
        continue;
      }

      const data = await response.json();

      for (const biz of (data.data || [])) {
        if (seenIds.has(biz.business_id)) continue;
        seenIds.add(biz.business_id);

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
        };

        const chainCheck = detectChain(biz.name, biz.types);
        lead.isChain = chainCheck.isChain;
        lead.chainReason = chainCheck.reason;

        if (filterChains && lead.isChain) {
          continue;
        }

        allResults.push(lead);
      }
    }

    console.log('Found ' + allResults.length + ' leads for ' + city);
    return res.json({ leads: allResults });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Failed to search for leads' });
  }
});

// Find emails batch endpoint (Hunter.io)
app.post('/api/find-emails-batch', async (req, res) => {
  const domains = req.body.domains;

  if (!domains || !Array.isArray(domains)) {
    return res.status(400).json({ error: 'domains array is required' });
  }

  if (!HUNTER_API_KEY) {
    return res.status(500).json({ error: 'Hunter API key not configured' });
  }

  const results = {};
  const toProcess = domains.slice(0, 10);

  for (const domain of toProcess) {
    try {
      const params = new URLSearchParams({
        domain: domain,
        api_key: HUNTER_API_KEY
      });

      const response = await fetch('https://api.hunter.io/v2/domain-search?' + params.toString());

      if (!response.ok) {
        results[domain] = { found: false };
        continue;
      }

      const data = await response.json();
      const emails = (data.data && data.data.emails) || [];

      if (emails.length > 0) {
        const sortedEmails = emails.sort((a, b) => b.confidence - a.confidence);
        const bestEmail = sortedEmails[0];
        results[domain] = {
          email: bestEmail.value,
          confidence: bestEmail.confidence,
          firstName: bestEmail.first_name,
          lastName: bestEmail.last_name,
          found: true
        };
      } else {
        results[domain] = { found: false };
      }
    } catch (error) {
      console.error('Hunter error for ' + domain + ':', error);
      results[domain] = { found: false };
    }

    await new Promise(function(r) { setTimeout(r, 200); });
  }

  return res.json({ results: results });
});

// Scrape contact pages endpoint
app.post('/api/scrape-contact', async (req, res) => {
  const websites = req.body.websites;

  if (!websites || !Array.isArray(websites)) {
    return res.status(400).json({ error: 'websites array is required' });
  }

  const results = {};
  const toProcess = websites.slice(0, 10);

  for (const website of toProcess) {
    try {
      const contactInfo = await scrapeWebsite(website);
      results[website] = contactInfo;
    } catch (error) {
      console.error('Error scraping ' + website + ':', error.message);
      results[website] = { found: false, error: error.message };
    }
    await new Promise(function(r) { setTimeout(r, 200); });
  }

  return res.json({ results: results });
});

async function scrapeWebsite(website) {
  const baseUrl = website.startsWith('http') ? website : 'https://' + website;

  let html = await fetchPage(baseUrl);
  if (!html) return { found: false, error: 'Could not fetch page' };

  let emails = extractEmails(html);
  let ownerName = extractOwnerName(html);

  if (emails.length === 0) {
    const contactPaths = ['/contact', '/contact-us', '/about', '/about-us', '/team'];
    for (const pagePath of contactPaths) {
      try {
        const contactUrl = new URL(pagePath, baseUrl).href;
        const contactHtml = await fetchPage(contactUrl);
        if (contactHtml) {
          emails = emails.concat(extractEmails(contactHtml));
          if (!ownerName) ownerName = extractOwnerName(contactHtml);
          if (emails.length > 0) break;
        }
      } catch (e) {
        // continue
      }
    }
  }

  const uniqueEmails = Array.from(new Set(emails));
  const bestEmail = prioritizeEmail(uniqueEmails);

  return {
    found: !!bestEmail,
    email: bestEmail,
    allEmails: uniqueEmails.slice(0, 5),
    ownerName: ownerName,
  };
}

async function fetchPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(function() { controller.abort(); }, 5000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JFBLeadFinder/1.0)',
        'Accept': 'text/html',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) return null;

    return await response.text();
  } catch (e) {
    return null;
  }
}

function extractEmails(html) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = html.match(emailRegex) || [];

  return matches.filter(function(email) {
    const lower = email.toLowerCase();
    return !lower.includes('example.com') &&
           !lower.includes('domain.com') &&
           !lower.includes('sentry.io') &&
           !lower.includes('wixpress.com') &&
           !lower.includes('.png') &&
           !lower.includes('.jpg');
  });
}

function extractOwnerName(html) {
  const patterns = [
    /(?:owner|founder|ceo|president)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    /([A-Z][a-z]+\s+[A-Z][a-z]+)[,\s]+(?:owner|founder|ceo|president)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
}

function prioritizeEmail(emails) {
  if (emails.length === 0) return null;
  if (emails.length === 1) return emails[0];

  const priorityPrefixes = ['owner', 'info', 'contact', 'hello', 'admin', 'sales'];
  for (const prefix of priorityPrefixes) {
    const match = emails.find(function(e) { return e.toLowerCase().startsWith(prefix); });
    if (match) return match;
  }
  return emails[0];
}

// Serve React app for all other routes - use regex pattern for Express 5 compatibility
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, function() {
  console.log('JFB Lead Command server running on port ' + PORT);
});
