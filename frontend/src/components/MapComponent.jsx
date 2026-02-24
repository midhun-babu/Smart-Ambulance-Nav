import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

// Custom icons
const ambulaceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3203/3203007.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
})

const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
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
    "PREEMPTED_GREEN": new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4814/4814868.png', // same as green but we'll add a halo effect maybe via css or popup
        iconSize: [32, 32],
        className: 'ring-4 ring-green-400 rounded-full bg-green-200 animate-pulse',
        iconAnchor: [16, 16],
    })
}

// Component to dynamically recenter map to ambulance
const MapCenterer = ({ pos }) => {
    const map = useMap();
    useEffect(() => {
        if (pos) {
            map.setView(pos);
        }
    }, [pos, map]);
    return null;
}

const MapComponent = ({ ambulancePos, route, signals, targetHospital, center }) => {
    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Target Hospital */}
            {targetHospital && (
                <Marker position={[targetHospital.lat, targetHospital.lon]} icon={hospitalIcon}>
                    <Popup>
                        <strong className="text-lg">{targetHospital.name}</strong><br />
                        {targetHospital.specialization}<br />
                        ICU Beds: {targetHospital.icu_beds_available}
                    </Popup>
                </Marker>
            )}

            {/* Ambulance */}
            {ambulancePos && (
                <Marker position={ambulancePos} icon={ambulaceIcon} zIndexOffset={1000}>
                    <Popup>Ambulance</Popup>
                </Marker>
            )}

            {/* Ensure map follows ambulance */}
            {ambulancePos && <MapCenterer pos={ambulancePos} />}

            {/* Traffic Signals */}
            {signals.map(s => (
                <Marker key={`signal-${s.id}`} position={[s.lat, s.lon]} icon={signalIcons[s.state] || signalIcons["RED"]}>
                    <Popup>
                        <strong>Signal {s.id}</strong><br />
                        State: <span className="font-bold">{s.state}</span>
                    </Popup>
                </Marker>
            ))}

            {/* Calculated Route */}
            {route && route.length > 0 && (
                <Polyline positions={route} color="blue" weight={6} opacity={0.7} />
            )}

        </MapContainer>
    )
}

export default MapComponent
