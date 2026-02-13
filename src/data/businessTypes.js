// Business types and their tailored message lines
export const BUSINESS_TYPES = [
  'Epoxy Flooring Contractor',
  'Concrete Coatings Contractor',
  'Garage Floor Coating Company',
  'Resinous Flooring Contractor',
  'Commercial Floor Coating Specialist',
  'Industrial Painting Contractor',
  'Facility Maintenance Contractor',
  'Concrete Polishing Contractor',
  'Commercial Property Maintenance',
  'Other'
]

export const TAILORED_LINES = {
  'Epoxy Flooring Contractor': 'Given your expertise in epoxy applications, Supreme Xtreme could serve as a strong complementary option for projects requiring a water-based, low-VOC alternative that still delivers industrial-grade performance.',
  'Concrete Coatings Contractor': 'With your focus on concrete coatings, Supreme Xtreme could complement your current lineup as a high-durability, water-based system ideal for occupied commercial spaces.',
  'Garage Floor Coating Company': 'As you already work with coating systems, Supreme Xtreme could be a valuable addition for commercial or institutional projects where low odor and fast return-to-service are priorities.',
  'Resinous Flooring Contractor': 'Your background in resinous systems aligns well with what Supreme Xtreme offers — a water-based coating that delivers the chemical resistance and durability your clients expect.',
  'Commercial Floor Coating Specialist': 'With your focus on commercial environments, Supreme Xtreme could be a natural fit — designed specifically for high-traffic institutional spaces that demand durability with minimal downtime.',
  'Industrial Painting Contractor': 'Since your team already handles industrial coatings, Supreme Xtreme could expand your floor coating capabilities with a water-based system built for commercial and institutional use.',
  'Facility Maintenance Contractor': 'For the facilities you maintain, Supreme Xtreme eliminates the constant strip-and-wax cycle, reducing labor costs and downtime — which is exactly what your clients need.',
  'Concrete Polishing Contractor': 'When your clients ask about coating options for their prepped slabs, Supreme Xtreme gives you a high-performance, water-based answer that complements your polishing work.',
  'Commercial Property Maintenance': 'Supreme Xtreme could help the properties you manage reduce their long-term floor maintenance costs while keeping spaces safe and operational.',
  'Other': 'Supreme Xtreme could be a strong complementary product for your business — offering industrial-grade floor protection in a practical, water-based system.'
}

// Keywords to detect business type from name/types
export const TYPE_KEYWORDS = {
  'Epoxy Flooring Contractor': ['epoxy', 'epoxies'],
  'Concrete Coatings Contractor': ['concrete coating', 'concrete coatings'],
  'Garage Floor Coating Company': ['garage', 'garage floor'],
  'Resinous Flooring Contractor': ['resinous', 'resin'],
  'Commercial Floor Coating Specialist': ['commercial floor', 'floor coating'],
  'Industrial Painting Contractor': ['industrial paint', 'industrial coating'],
  'Facility Maintenance Contractor': ['facility', 'maintenance'],
  'Concrete Polishing Contractor': ['polish', 'polishing'],
  'Commercial Property Maintenance': ['property', 'commercial maintenance'],
}

// Determine business type from name and categories
export function detectBusinessType(name, types = []) {
  const text = `${name} ${types.join(' ')}`.toLowerCase()

  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return type
      }
    }
  }

  // Default classifications based on common patterns
  if (text.includes('coating') || text.includes('coatings')) {
    return 'Concrete Coatings Contractor'
  }
  if (text.includes('flooring') || text.includes('floor')) {
    return 'Commercial Floor Coating Specialist'
  }
  if (text.includes('paint')) {
    return 'Industrial Painting Contractor'
  }

  return 'Other'
}

// Calculate JFB fit rating (1-5)
export function calculateRating(name, types = [], reviewCount = 0) {
  const text = `${name} ${types.join(' ')}`.toLowerCase()

  // Red flags - immediate low rating
  const redFlags = ['road', 'traffic', 'pavement', 'striping', 'asphalt', 'dot', 'highway', 'line striping']
  for (const flag of redFlags) {
    if (text.includes(flag)) return 1
  }

  // Tier 1 keywords - highest ratings
  const tier1 = ['epoxy', 'resinous', 'resin', 'industrial floor', 'concrete coating']
  for (const kw of tier1) {
    if (text.includes(kw)) return 5
  }

  // Tier 2 keywords
  const tier2 = ['floor coating', 'industrial painting', 'commercial floor']
  for (const kw of tier2) {
    if (text.includes(kw)) return 4
  }

  // Tier 3 keywords
  const tier3 = ['facility', 'maintenance', 'polishing', 'concrete']
  for (const kw of tier3) {
    if (text.includes(kw)) return 3
  }

  // Default based on review count (more reviews = more established)
  if (reviewCount > 50) return 3
  if (reviewCount > 10) return 2

  return 2
}

// Get priority tier from rating
export function getPriorityTier(rating) {
  if (rating >= 4) return 'Tier 1'
  if (rating === 3) return 'Tier 2'
  return 'Tier 3'
}
