import React, { useEffect } from 'react'
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap
} from 'react-leaflet'
import L from 'leaflet'

/* ================= ICONS ================= */

// Ambulance Icon
const ambulanceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3203/3203007.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
})

// Hospital Icon
const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
})

// Traffic Signal Icons
const signalIcons = {
    RED: new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4814/4814890.png',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    }),
    GREEN: new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4814/4814868.png',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    }),
    YELLOW: new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4814/4814881.png',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    }),
    PREEMPTED_GREEN: new L.divIcon({
        className: '',
        html: `
      <div style="
        width:32px;
        height:32px;
        border-radius:50%;
        background:rgba(16,185,129,0.2);
        box-shadow:0 0 20px rgba(16,185,129,0.9);
        display:flex;
        align-items:center;
        justify-content:center;
        animation:pulse 1.5s infinite;
      ">
        <div style="width:12px;height:12px;background:#6ee7b7;border-radius:50%"></div>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    })
}

/* ================= MAP FOLLOW ================= */

const MapCenterer = ({ position }) => {
    const map = useMap()

    useEffect(() => {
        if (position) {
            map.panTo(position, {
                animate: true,
                duration: 0.6,
                easeLinearity: 0.25
            })
        }
    }, [position, map])

    return null
}

/* ================= MAIN COMPONENT ================= */

const MapComponent = ({
    ambulancePos,
    route = [],
    signals = [],
    targetHospital,
    center
}) => {
    const tileUrl =
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

    return (
        <MapContainer
            center={center}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            preferCanvas={true}
        >
            <TileLayer
                url={tileUrl}
                attribution='&copy; OpenStreetMap & CARTO'
            />

            {/* Hospital */}
            {targetHospital && (
                <Marker
                    position={[targetHospital.lat, targetHospital.lon]}
                    icon={hospitalIcon}
                >
                    <Popup>
                        <strong>{targetHospital.name}</strong><br />
                        {targetHospital.specialization}<br />
                        ICU Beds: {targetHospital.icu_beds_available}
                    </Popup>
                </Marker>
            )}

            {/* Ambulance */}
            {ambulancePos && (
                <>
                    <Marker
                        position={ambulancePos}
                        icon={ambulanceIcon}
                        zIndexOffset={1000}
                    >
                        <Popup>
                            <strong>Ambulance Unit 01</strong>
                        </Popup>
                    </Marker>
                    <MapCenterer position={ambulancePos} />
                </>
            )}

            {/* Traffic Signals */}
            {Array.isArray(signals) &&
                signals.map(signal => (
                    <Marker
                        key={signal.id}
                        position={[signal.lat, signal.lon]}
                        icon={signalIcons[signal.state] || signalIcons.RED}
                    >
                        <Popup>
                            <strong>Signal {signal.id}</strong><br />
                            Status: {signal.state}
                        </Popup>
                    </Marker>
                ))}

            {/* Route Glow */}
            {route.length > 0 && (
                <>
                    {/* Glow Layer */}
                    <Polyline
                        positions={route}
                        pathOptions={{
                            color: '#60a5fa',
                            weight: 10,
                            opacity: 0.25
                        }}
                    />
                    {/* Main Route */}
                    <Polyline
                        positions={route}
                        pathOptions={{
                            color: '#3b82f6',
                            weight: 5,
                            opacity: 0.9
                        }}
                    />
                </>
            )}
        </MapContainer>
    )
}

export default MapComponent