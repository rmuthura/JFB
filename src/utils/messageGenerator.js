import { TAILORED_LINES } from '../data/businessTypes'

export function generateMessage(lead) {
  const tailoredLine = TAILORED_LINES[lead.businessType] || TAILORED_LINES['Other']

  return `Hi,

My name is Aidan Thompson, and I represent JFB Hart Coatings — a family-run company specializing in high-performance coating systems. I am currently based in Western Kentucky and actively building relationships with contractors and businesses across the region.

I wanted to reach out because I see potential alignment between what ${lead.name} does and our Supreme Xtreme product line. Supreme Xtreme is a water-based floor coating that delivers strong durability, chemical resistance, flexibility, and low-VOC performance — all while reducing long-term maintenance cycles for commercial and institutional facilities.

${tailoredLine}

This is not about replacing anything in your current process — I see Supreme Xtreme as a complementary product that could open new opportunities or strengthen what you already offer.

I would be happy to provide more information if you are interested.

Aidan Thompson
JFB Hart Coatings
aidan.thompsonjfb@outlook.com
630 392 4977
https://jfbsupremextreme.com/
www.linkedin.com/in/aidan-thompson-83873431b`
}

export function generateAllMessages(leads) {
  return leads.map((lead, index) => ({
    leadNumber: index + 1,
    companyName: lead.name,
    businessType: lead.businessType,
    rating: lead.jfbRating,
    message: generateMessage(lead)
  }))
}
