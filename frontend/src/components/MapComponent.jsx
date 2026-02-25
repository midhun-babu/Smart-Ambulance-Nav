import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

// Custom icons
const ambulaceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3203/3203007.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
})

const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
})

const signalIcons = {
    "RED": new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4814/4814890.png',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    }),
    "GREEN": new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4814/4814868.png',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    }),
    "YELLOW": new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4814/4814881.png',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    }),
    "PREEMPTED_GREEN": new L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-8 h-8 rounded-full bg-emerald-400/20 ring-4 ring-emerald-400 animate-pulse flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.8)]"><div class="w-3 h-3 bg-emerald-300 rounded-full"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    })
}

// Component to dynamically recenter map to ambulance
const MapCenterer = ({ pos }) => {
    const map = useMap();
    useEffect(() => {
        if (pos) {
            map.panTo(pos, { animate: true, duration: 1.0 });
        }
    }, [pos, map]);
    return null;
}

const MapComponent = ({ ambulancePos, route, signals, targetHospital, center }) => {
    // Dark mode tile layer URL
    const tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

    return (
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', background: '#0f172a' }} zoomControl={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={tileUrl}
            />

            {/* Target Hospital */}
            {targetHospital && (
                <Marker position={[targetHospital.lat, targetHospital.lon]} icon={hospitalIcon}>
                    <Popup className="dark-popup">
                        <div className="text-slate-900">
                            <strong className="text-lg text-blue-700">{targetHospital.name}</strong><br />
                            <span className="text-sm font-semibold">{targetHospital.specialization}</span><br />
                            <span className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 inline-block">ICU Beds: {targetHospital.icu_beds_available}</span>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Ambulance */}
            {ambulancePos && (
                <Marker position={ambulancePos} icon={ambulaceIcon} zIndexOffset={1000}>
                    <Popup className="dark-popup"><strong>Ambulance Unit 01</strong></Popup>
                </Marker>
            )}

            {/* Ensure map follows ambulance softly */}
            {ambulancePos && <MapCenterer pos={ambulancePos} />}

            {/* Traffic Signals */}
            {signals.map(s => (
                <Marker key={`signal-${s.id}`} position={[s.lat, s.lon]} icon={signalIcons[s.state] || signalIcons["RED"]}>
                    <Popup className="dark-popup">
                        <div className="text-slate-900">
                            <strong>Signal ID: {s.id}</strong><br />
                            Status: <span className={`font-bold ${s.state.includes('GREEN') ? 'text-emerald-600' : s.state === 'RED' ? 'text-red-600' : 'text-yellow-600'}`}>{s.state}</span>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Calculated Route - Glowing Blue */}
            {route && route.length > 0 && (
                <Polyline
                    positions={route}
                    color="#3b82f6"
                    weight={6}
                    opacity={0.8}
                    className="animate-pulse"
                />
            )}

        </MapContainer>
    )
}

export default MapComponent
