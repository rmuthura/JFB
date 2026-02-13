const tabs = [
  { id: 'playbook', label: 'PLAYBOOK' },
  { id: 'leads', label: 'FIND LEADS' },
  { id: 'messages', label: 'MESSAGES' },
  { id: 'export', label: 'EXPORT' },
]

export default function TabNav({ activeTab, setActiveTab, leadCount }) {
  return (
    <nav className="bg-dark-surface border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 font-heading text-sm tracking-wider border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
              {tab.id === 'leads' && leadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-amber-500 text-black rounded-full">
                  {leadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
