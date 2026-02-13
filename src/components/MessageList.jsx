import { useState, useMemo } from 'react'
import MessageCard from './MessageCard'
import { generateAllMessages } from '../utils/messageGenerator'

export default function MessageList({ leads }) {
  const [filter, setFilter] = useState('all')
  const [copiedAll, setCopiedAll] = useState(false)

  const messages = useMemo(() => generateAllMessages(leads), [leads])

  const filteredMessages = useMemo(() => {
    if (filter === 'all') return messages
    if (filter === 'tier1') return messages.filter(m => m.rating >= 4)
    if (filter === 'tier2') return messages.filter(m => m.rating === 3)
    if (filter === 'tier3') return messages.filter(m => m.rating <= 2)
    return messages
  }, [messages, filter])

  const copyAllMessages = async () => {
    const allText = filteredMessages.map(m =>
      `========================================\n` +
      `LEAD #${m.leadNumber}: ${m.companyName}\n` +
      `Business Type: ${m.businessType} | Rating: ${m.rating}/5\n` +
      `========================================\n\n` +
      `${m.message}\n\n`
    ).join('\n')

    try {
      await navigator.clipboard.writeText(allText)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (leads.length === 0) {
    return (
      <div className="bg-dark-card rounded-lg p-8 text-center">
        <h2 className="text-xl font-heading text-white mb-2">No Messages Yet</h2>
        <p className="text-gray-400">Find some leads first, then come back here to generate personalized outreach messages.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-card rounded-lg p-4">
        <div>
          <h2 className="text-xl font-heading text-white">Outreach Messages</h2>
          <p className="text-sm text-gray-400">
            {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} ready
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            {[
              { key: 'all', label: 'All' },
              { key: 'tier1', label: 'Tier 1' },
              { key: 'tier2', label: 'Tier 2' },
              { key: 'tier3', label: 'Tier 3' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-amber-500 text-black'
                    : 'bg-dark-bg text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={copyAllMessages}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              copiedAll
                ? 'bg-green-500/20 text-green-400'
                : 'bg-amber-500 text-black hover:bg-amber-400'
            }`}
          >
            {copiedAll ? 'Copied All!' : 'Copy All'}
          </button>
        </div>
      </div>

      {/* Message cards */}
      <div className="space-y-4">
        {filteredMessages.map((message, index) => (
          <MessageCard key={message.leadNumber} message={message} index={index} />
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <div className="bg-dark-card rounded-lg p-8 text-center">
          <p className="text-gray-400">No messages match the selected filter.</p>
        </div>
      )}
    </div>
  )
}
