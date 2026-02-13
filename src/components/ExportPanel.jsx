import { exportLeadsToCSV, exportMessagesToTxt } from '../utils/csvExport'
import { generateAllMessages } from '../utils/messageGenerator'
import { clearHistory } from '../utils/storage'
import { useState } from 'react'

export default function ExportPanel({ leads, currentCity, history, onLoadHistory }) {
  const [cleared, setCleared] = useState(false)

  const handleExportCSV = () => {
    if (leads.length === 0) return
    exportLeadsToCSV(leads, currentCity)
  }

  const handleExportMessages = () => {
    if (leads.length === 0) return
    const messages = generateAllMessages(leads)
    exportMessagesToTxt(messages)
  }

  const handleClearHistory = () => {
    clearHistory()
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
    // Parent will need to refresh history
    window.location.reload()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Export Current Session */}
      <div className="bg-dark-card rounded-lg p-6">
        <h2 className="text-xl font-heading text-white mb-4">Export Current Session</h2>

        {leads.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-dark-bg rounded-lg">
              <div className="flex-1">
                <h3 className="font-heading text-white">{currentCity || 'Current Search'}</h3>
                <p className="text-sm text-gray-400">{leads.length} leads ready for export</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-heading font-semibold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>

              <button
                onClick={handleExportMessages}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-dark-bg hover:bg-gray-700 text-white border border-gray-600 rounded-lg font-heading font-semibold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Download Messages (.txt)
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No leads to export. Search for a city in the Find Leads tab first.</p>
          </div>
        )}
      </div>

      {/* Search History */}
      <div className="bg-dark-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading text-white">Search History</h2>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                cleared
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-red-400 hover:bg-red-500/20'
              }`}
            >
              {cleared ? 'Cleared!' : 'Clear History'}
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-dark-bg rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => onLoadHistory(item)}
              >
                <div>
                  <h3 className="font-heading text-white">{item.city}</h3>
                  <p className="text-sm text-gray-400">
                    {item.leadCount} leads • {formatDate(item.date)}
                  </p>
                </div>
                <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                  Load
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No search history yet. Your previous searches will appear here.</p>
          </div>
        )}
      </div>

      {/* Stats */}
      {leads.length > 0 && (
        <div className="bg-dark-card rounded-lg p-6">
          <h2 className="text-xl font-heading text-white mb-4">Current Session Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-dark-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-heading text-amber-400">{leads.length}</div>
              <div className="text-sm text-gray-400">Total Leads</div>
            </div>
            <div className="bg-dark-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-heading text-green-400">
                {leads.filter(l => l.jfbRating >= 4).length}
              </div>
              <div className="text-sm text-gray-400">Tier 1</div>
            </div>
            <div className="bg-dark-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-heading text-yellow-400">
                {leads.filter(l => l.jfbRating === 3).length}
              </div>
              <div className="text-sm text-gray-400">Tier 2</div>
            </div>
            <div className="bg-dark-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-heading text-red-400">
                {leads.filter(l => l.jfbRating <= 2).length}
              </div>
              <div className="text-sm text-gray-400">Tier 3</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
