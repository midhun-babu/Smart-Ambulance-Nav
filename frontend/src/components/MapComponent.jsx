import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

// Custom icons
const ambulaceIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/color/48/ambulance.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
})

const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
})

const signalIcons = {
    "RED": new L.divIcon({
        className: 'custom-signal-icon',
        html: `
            <div class="flex flex-col items-center bg-slate-900 p-1 rounded border border-slate-700 shadow-xl scale-75">
                <div class="w-3 h-3 rounded-full mb-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-red-400/50"></div>
                <div class="w-3 h-3 rounded-full mb-1 bg-slate-800"></div>
                <div class="w-3 h-3 rounded-full bg-slate-800"></div>
            </div>
        `,
        iconSize: [24, 48],
        iconAnchor: [12, 24]
    }),
    "GREEN": new L.divIcon({
        className: 'custom-signal-icon',
        html: `
            <div class="flex flex-col items-center bg-slate-900 p-1 rounded border border-slate-700 shadow-xl scale-75">
                <div class="w-3 h-3 rounded-full mb-1 bg-slate-800"></div>
                <div class="w-3 h-3 rounded-full mb-1 bg-slate-800"></div>
                <div class="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] border border-emerald-400/50"></div>
            </div>
        `,
        iconSize: [24, 48],
        iconAnchor: [12, 24]
    }),
    "YELLOW": new L.divIcon({
        className: 'custom-signal-icon',
        html: `
            <div class="flex flex-col items-center bg-slate-900 p-1 rounded border border-slate-700 shadow-xl scale-75">
                <div class="w-3 h-3 rounded-full mb-1 bg-slate-800"></div>
                <div class="w-3 h-3 rounded-full mb-1 bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)] border border-yellow-400/50"></div>
                <div class="w-3 h-3 rounded-full bg-slate-800"></div>
            </div>
        `,
        iconSize: [24, 48],
        iconAnchor: [12, 24]
    }),
    "PREEMPTED_GREEN": new L.divIcon({
        className: 'custom-signal-icon',
        html: `
            <div class="flex flex-col items-center bg-slate-900 p-1 rounded border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110">
                <div class="w-3 h-3 rounded-full mb-1 bg-slate-800"></div>
                <div class="w-3 h-3 rounded-full mb-1 bg-slate-800"></div>
                <div class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,1)] border-2 border-white/30"></div>
            </div>
        `,
        iconSize: [28, 56],
        iconAnchor: [14, 28]
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
            ))}

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
