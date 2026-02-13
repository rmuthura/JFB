import { useState } from 'react'

const RATING_COLORS = {
  5: 'bg-green-500',
  4: 'bg-lime-500',
  3: 'bg-yellow-500',
  2: 'bg-orange-500',
  1: 'bg-red-500'
}

export default function LeadTable({ leads, onRemoveLead, onUpdateLead, onSelectLead, selectedLead }) {
  const [sortField, setSortField] = useState('jfbRating')
  const [sortDir, setSortDir] = useState('desc')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const sortedLeads = [...leads].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortDir === 'asc') {
      return aVal > bVal ? 1 : -1
    }
    return aVal < bVal ? 1 : -1
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const startEdit = (lead, index) => {
    setEditingId(index)
    setEditForm({ ...lead })
  }

  const saveEdit = (index) => {
    onUpdateLead(index, editForm)
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const SortHeader = ({ field, children }) => (
    <th
      className="px-3 py-3 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-amber-400 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-amber-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  )

  if (leads.length === 0) {
    return (
      <div className="bg-dark-card rounded-lg p-8 text-center">
        <p className="text-gray-400">No leads found. Search for a city to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-dark-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-bg border-b border-gray-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider">#</th>
              <SortHeader field="name">Company</SortHeader>
              <SortHeader field="businessType">Type</SortHeader>
              <SortHeader field="jfbRating">Rating</SortHeader>
              <SortHeader field="priorityTier">Tier</SortHeader>
              <th className="px-3 py-3 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-3 py-3 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedLeads.map((lead, index) => {
              const isEditing = editingId === index
              const isSelected = selectedLead === index

              return (
                <tr
                  key={lead.id || index}
                  className={`hover:bg-dark-bg/50 transition-colors cursor-pointer ${isSelected ? 'bg-amber-500/10 border-l-2 border-amber-400' : ''}`}
                  onClick={() => onSelectLead && onSelectLead(index)}
                >
                  <td className="px-3 py-3 text-sm text-gray-400">{index + 1}</td>

                  <td className="px-3 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-dark-bg border border-gray-600 rounded px-2 py-1 text-sm text-white w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-white">{lead.name}</div>
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {lead.website.replace(/^https?:\/\//, '').slice(0, 30)}...
                          </a>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-300">
                    {isEditing ? (
                      <select
                        value={editForm.businessType}
                        onChange={(e) => setEditForm({ ...editForm, businessType: e.target.value })}
                        className="bg-dark-bg border border-gray-600 rounded px-2 py-1 text-sm text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option>Epoxy Flooring Contractor</option>
                        <option>Concrete Coatings Contractor</option>
                        <option>Garage Floor Coating Company</option>
                        <option>Resinous Flooring Contractor</option>
                        <option>Commercial Floor Coating Specialist</option>
                        <option>Industrial Painting Contractor</option>
                        <option>Facility Maintenance Contractor</option>
                        <option>Concrete Polishing Contractor</option>
                        <option>Commercial Property Maintenance</option>
                        <option>Other</option>
                      </select>
                    ) : (
                      <span className="text-xs">{lead.businessType}</span>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${RATING_COLORS[lead.jfbRating]}`}></span>
                      <span className="text-sm text-white font-mono">{lead.jfbRating}/5</span>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${
                      lead.priorityTier === 'Tier 1' ? 'bg-green-500/20 text-green-400' :
                      lead.priorityTier === 'Tier 2' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {lead.priorityTier}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-sm">
                    <div className="space-y-1">
                      {lead.phone && (
                        <div className="text-gray-300 font-mono text-xs">{lead.phone}</div>
                      )}
                      {lead.email && lead.email !== 'Not found' && (
                        <div className="text-amber-400 text-xs">{lead.email}</div>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    {isEditing ? (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => saveEdit(index)}
                          className="text-green-400 hover:text-green-300 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-400 hover:text-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => startEdit(lead, index)}
                          className="text-amber-400 hover:text-amber-300 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onRemoveLead(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
