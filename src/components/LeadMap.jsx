import { useEffect, useRef, useState } from 'react'

const RATING_COLORS = {
  5: '#22c55e', // green
  4: '#84cc16', // lime
  3: '#eab308', // yellow
  2: '#f97316', // orange
  1: '#ef4444'  // red
}

export default function LeadMap({ leads, selectedLead, onSelectLead }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [mapError, setMapError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      script.async = true
      script.defer = true
      script.onload = initMap
      script.onerror = () => setMapError('Failed to load Google Maps')
      document.head.appendChild(script)
    } else {
      initMap()
    }
  }, [])

  const initMap = () => {
    if (!mapRef.current || !window.google) return

    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 39.8283, lng: -98.5795 }, // Center of US
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1a1d27' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1d27' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2f3a' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1117' }] },
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ]
      })
      setIsLoading(false)
      updateMarkers()
    } catch (err) {
      setMapError('Failed to initialize map')
    }
  }

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    const bounds = new window.google.maps.LatLngBounds()
    let hasValidCoords = false

    leads.forEach((lead, index) => {
      if (!lead.lat || !lead.lng) return

      hasValidCoords = true
      const position = { lat: lead.lat, lng: lead.lng }
      bounds.extend(position)

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: lead.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: RATING_COLORS[lead.jfbRating] || RATING_COLORS[2],
          fillOpacity: selectedLead === index ? 1 : 0.8,
          strokeColor: selectedLead === index ? '#fff' : '#000',
          strokeWeight: selectedLead === index ? 3 : 1,
          scale: selectedLead === index ? 12 : 8
        }
      })

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="background: #1a1d27; color: white; padding: 8px; border-radius: 4px; min-width: 150px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${lead.name}</div>
            <div style="font-size: 12px; color: #9ca3af;">${lead.businessType}</div>
            <div style="margin-top: 4px;">
              <span style="color: ${RATING_COLORS[lead.jfbRating]};">Rating: ${lead.jfbRating}/5</span>
              <span style="margin-left: 8px; color: #f59e0b;">${lead.priorityTier}</span>
            </div>
            ${lead.phone ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">${lead.phone}</div>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        onSelectLead && onSelectLead(index)
        infoWindow.open(mapInstanceRef.current, marker)
      })

      markersRef.current.push(marker)
    })

    if (hasValidCoords) {
      mapInstanceRef.current.fitBounds(bounds)
      // Don't zoom in too much
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
        if (mapInstanceRef.current.getZoom() > 14) {
          mapInstanceRef.current.setZoom(14)
        }
        window.google.maps.event.removeListener(listener)
      })
    }
  }

  // Update markers when leads or selection changes
  useEffect(() => {
    updateMarkers()
  }, [leads, selectedLead])

  if (mapError) {
    return (
      <div className="bg-dark-card rounded-lg p-8 text-center h-80">
        <p className="text-red-400">{mapError}</p>
        <p className="text-gray-400 text-sm mt-2">Check your Google Maps API key</p>
      </div>
    )
  }

  return (
    <div className="bg-dark-card rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 className="font-heading text-white">Lead Locations</h3>
        <div className="flex items-center gap-4 text-xs">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: RATING_COLORS[rating] }}
              ></span>
              <span className="text-gray-400">{rating}</span>
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="h-80 flex items-center justify-center">
          <div className="text-amber-400">Loading map...</div>
        </div>
      )}

      <div
        ref={mapRef}
        className="h-80 w-full"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  )
}
