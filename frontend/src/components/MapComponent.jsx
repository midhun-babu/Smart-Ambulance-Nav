import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issue with Vite/webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Ambulance icon
const ambulanceIcon = L.divIcon({
    className: '',
    html: `<div style="
        width: 36px; height: 36px;
        background: #ef4444;
        border: 3px solid #ffffff;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 18px;
        box-shadow: 0 0 12px 4px rgba(239,68,68,0.6);
        animation: pulse 1s infinite;
    ">🚑</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
})

// Hospital icon
const hospitalIcon = L.divIcon({
    className: '',
    html: `<div style="
        width: 32px; height: 32px;
        background: #22c55e;
        border: 3px solid #ffffff;
        border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px;
        box-shadow: 0 0 8px rgba(34,197,94,0.5);
    ">🏥</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
})

// Re-center the map when ambulance moves
function MapFollower({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom(), { animate: true })
        }
    }, [position, map])
    return null
}

export default function MapComponent({ ambulancePos, route, signals, targetHospital, center }) {
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <style>{`
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 12px 4px rgba(239,68,68,0.6); }
                    50% { box-shadow: 0 0 24px 10px rgba(239,68,68,0.9); }
                }
            `}</style>
            <MapContainer
                center={center || [9.9816, 76.2999]}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Follow ambulance */}
                {ambulancePos && <MapFollower position={ambulancePos} />}

                {/* Route polyline */}
                {route && route.length > 1 && (
                    <Polyline
                        positions={route}
                        color="#3b82f6"
                        weight={5}
                        opacity={0.85}
                        dashArray="10 5"
                    />
                )}

                {/* Ambulance marker */}
                {ambulancePos && (
                    <Marker position={ambulancePos} icon={ambulanceIcon}>
                        <Popup>🚑 Ambulance in transit</Popup>
                    </Marker>
                )}

                {/* Target hospital marker */}
                {targetHospital && targetHospital.lat && targetHospital.lon && (
                    <Marker
                        position={[targetHospital.lat, targetHospital.lon]}
                        icon={hospitalIcon}
                    >
                        <Popup>
                            <strong>🏥 {targetHospital.name}</strong><br />
                            {targetHospital.capabilities?.join(', ')}
                        </Popup>
                    </Marker>
                )}

                {/* Traffic signals */}
                {signals && signals.map((sig, idx) => {
                    const color = sig.state === 'GREEN' ? '#22c55e'
                        : sig.state === 'RED' ? '#ef4444'
                            : '#eab308'
                    return (
                        <Circle
                            key={idx}
                            center={[sig.lat, sig.lon]}
                            radius={30}
                            pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}
                        >
                            <Popup>
                                Signal #{sig.id ?? idx}<br />
                                State: <strong>{sig.state}</strong>
                            </Popup>
                        </Circle>
                    )
                })}
            </MapContainer>
        </div>
    )
}
