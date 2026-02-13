import { useState } from 'react'

export default function MessageCard({ message, index }) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const RATING_COLORS = {
    5: 'text-green-400',
    4: 'text-lime-400',
    3: 'text-yellow-400',
    2: 'text-orange-400',
    1: 'text-red-400'
  }

  return (
    <div className="bg-dark-card rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-700 cursor-pointer hover:bg-dark-bg/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <span className="text-amber-400 font-mono font-bold">#{message.leadNumber}</span>
          <div>
            <h3 className="font-heading text-white">{message.companyName}</h3>
            <span className="text-xs text-gray-400">{message.businessType}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`font-mono ${RATING_COLORS[message.rating]}`}>
            {message.rating}/5
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              copyToClipboard()
            }}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              copied
                ? 'bg-green-500/20 text-green-400'
                : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <span className="text-gray-400 text-sm">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 bg-dark-bg rounded p-4 overflow-x-auto">
            {message.message}
          </pre>
        </div>
      )}
    </div>
  )
}
