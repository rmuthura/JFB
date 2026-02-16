export function exportLeadsToCSV(leads, city) {
  const headers = [
    'Lead Number',
    'Company Name',
    'Website',
    'Email',
    'Phone',
    'Business Type',
    'JFB Fit Rating',
    'Priority Tier',
    'City Searched'
  ]

  const rows = leads.map((lead, index) => [
    index + 1,
    lead.name,
    lead.website || '',
    lead.email || 'Not found',
    lead.phone || 'Not found',
    lead.businessType,
    `${lead.jfbRating} of 5`,  // Changed from "X/5" to prevent Excel date interpretation
    lead.priorityTier,
    city
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  downloadFile(csvContent, `jfb-leads-${city.replace(/[^a-z0-9]/gi, '-')}.csv`, 'text/csv')
}

export function exportMessagesToTxt(messages) {
  const content = messages.map(m =>
    `========================================\n` +
    `LEAD #${m.leadNumber}: ${m.companyName}\n` +
    `Business Type: ${m.businessType} | Rating: ${m.rating} of 5\n` +
    `========================================\n\n` +
    `${m.message}\n\n`
  ).join('\n')

  downloadFile(content, 'jfb-outreach-messages.txt', 'text/plain')
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
