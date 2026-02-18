import { useState, useEffect } from 'react'
import Header from './components/Header'
import TabNav from './components/TabNav'
import Playbook from './components/Playbook'
import LeadFinder from './components/LeadFinder'
import MessageList from './components/MessageList'
import ExportPanel from './components/ExportPanel'
import { loadLeads, saveLeads, loadHistory } from './utils/storage'

function App() {
  const [activeTab, setActiveTab] = useState('leads')
  const [leads, setLeads] = useState([])
  const [currentCity, setCurrentCity] = useState('')
  const [history, setHistory] = useState([])

  // Load saved data on mount
  useEffect(() => {
    const savedLeads = loadLeads()
    const savedHistory = loadHistory()
    if (savedLeads.leads) {
      setLeads(savedLeads.leads)
      setCurrentCity(savedLeads.city || '')
    }
    setHistory(savedHistory)
  }, [])

  // Save leads when they change
  useEffect(() => {
    if (leads.length > 0) {
      saveLeads(leads, currentCity)
    }
  }, [leads, currentCity])

  const handleLeadsFound = (newLeads, city) => {
    setLeads(newLeads)
    setCurrentCity(city)
  }

  const handleRemoveLead = (leadId) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId))
  }

  const handleUpdateLead = (leadId, updatedLead) => {
    setLeads(prev => prev.map(lead => lead.id === leadId ? updatedLead : lead))
  }

  const handleLoadHistory = (item) => {
    setLeads(item.leads)
    setCurrentCity(item.city)
    setActiveTab('leads')
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} leadCount={leads.length} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'playbook' && <Playbook />}

        {activeTab === 'leads' && (
          <LeadFinder
            leads={leads}
            currentCity={currentCity}
            onLeadsFound={handleLeadsFound}
            onRemoveLead={handleRemoveLead}
            onUpdateLead={handleUpdateLead}
          />
        )}

        {activeTab === 'messages' && (
          <MessageList leads={leads} />
        )}

        {activeTab === 'export' && (
          <ExportPanel
            leads={leads}
            currentCity={currentCity}
            history={history}
            onLoadHistory={handleLoadHistory}
          />
        )}
      </main>
    </div>
  )
}

export default App
