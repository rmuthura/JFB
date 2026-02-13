import { useState } from 'react'
import LeadTable from './LeadTable'
import LeadMap from './LeadMap'
import { searchLeads, findEmails } from '../utils/leadApi'
import { detectBusinessType, calculateRating, getPriorityTier } from '../data/businessTypes'

export default function LeadFinder({ leads, currentCity, onLeadsFound, onRemoveLead, onUpdateLead }) {
  const [searchCity, setSearchCity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFindingEmails, setIsFindingEmails] = useState(false)
  const [error, setError] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showMap, setShowMap] = useState(true)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchCity.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const rawLeads = await searchLeads(searchCity.trim(), 25)

      // Process leads with business type detection and rating
      const processedLeads = rawLeads.map(lead => {
        const businessType = detectBusinessType(lead.name, lead.types)
        const jfbRating = calculateRating(lead.name, lead.types, lead.reviewCount)
        const priorityTier = getPriorityTier(jfbRating)

        return {
          ...lead,
          businessType,
          jfbRating,
          priorityTier
        }
      })

      // Sort by rating (highest first)
      processedLeads.sort((a, b) => b.jfbRating - a.jfbRating)

      onLeadsFound(processedLeads, searchCity.trim())
      setSearchCity('')
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'Failed to search for leads. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFindEmails = async () => {
    if (leads.length === 0) return

    setIsFindingEmails(true)
    try {
      const leadsWithEmails = await findEmails(leads)
      onLeadsFound(leadsWithEmails, currentCity)
    } catch (err) {
      console.error('Email lookup error:', err)
      setError('Failed to find emails. This feature works in production.')
    } finally {
      setIsFindingEmails(false)
    }
  }

  const emailCount = leads.filter(l => l.email && l.email !== 'Not found').length

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-dark-card rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-400 mb-2">
              Search for Flooring Contractors
            </label>
            <input
              type="text"
              id="city"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Enter a city (e.g., Nashville, TN)"
              className="w-full px-4 py-3 bg-dark-bg border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading || !searchCity.trim()}
              className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-heading font-semibold rounded-lg transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                'Find Leads'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Results Header */}
      {leads.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-heading text-white">
              {leads.length} Leads in {currentCity}
            </h2>
            <p className="text-sm text-gray-400">
              {leads.filter(l => l.jfbRating >= 4).length} Tier 1 •
              {leads.filter(l => l.jfbRating === 3).length} Tier 2 •
              {leads.filter(l => l.jfbRating <= 2).length} Tier 3
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFindEmails}
              disabled={isFindingEmails || leads.length === 0}
              className="px-4 py-2 text-sm bg-amber-500/20 border border-amber-500 rounded-lg text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isFindingEmails ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Finding...
                </span>
              ) : (
                `Find Emails ${emailCount > 0 ? `(${emailCount} found)` : ''}`
              )}
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 text-sm bg-dark-card border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      {leads.length > 0 && showMap && (
        <LeadMap
          leads={leads}
          selectedLead={selectedLead}
          onSelectLead={setSelectedLead}
        />
      )}

      {/* Lead Table */}
      <LeadTable
        leads={leads}
        onRemoveLead={onRemoveLead}
        onUpdateLead={onUpdateLead}
        onSelectLead={setSelectedLead}
        selectedLead={selectedLead}
      />
    </div>
  )
}
