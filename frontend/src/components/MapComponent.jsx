import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ── Helper: scale marker size based on zoom ──────────────────────────────────
// Leaflet icons are just HTML, so we create them at fixed sizes.

// ── Icon: Ambulance (pulsing red circle + emoji) ─────────────────────────────
const ambulanceIcon = L.divIcon({
    className: '',
    html: `
    <div style="position:relative;width:44px;height:44px">
      <div style="
        position:absolute;inset:0;
        border-radius:50%;
        background:rgba(239,68,68,0.25);
        animation:amb-ping 1.2s ease-in-out infinite;
      "></div>
      <div style="
        position:absolute;inset:4px;
        background:#ef4444;
        border:3px solid #fff;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:17px;
        box-shadow:0 2px 12px rgba(239,68,68,0.7);
      ">🚑</div>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
})

// ── Icon: Target Hospital (green cross) ─────────────────────────────────────
const makeHospitalIcon = (isTarget = false) => L.divIcon({
    className: '',
    html: `
    <div style="
      width:${isTarget ? 40 : 32}px;height:${isTarget ? 40 : 32}px;
      background:${isTarget ? '#16a34a' : '#1d4ed8'};
      border:3px solid #fff;
      border-radius:8px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 10px rgba(0,0,0,0.4);
      position:relative;
    ">
      <!-- cross bar horizontal -->
      <div style="position:absolute;width:60%;height:22%;background:white;border-radius:2px;"></div>
      <!-- cross bar vertical -->
      <div style="position:absolute;height:60%;width:22%;background:white;border-radius:2px;"></div>
    </div>`,
    iconSize: [isTarget ? 40 : 32, isTarget ? 40 : 32],
    iconAnchor: [isTarget ? 20 : 16, isTarget ? 40 : 32],
    popupAnchor: [0, isTarget ? -42 : -34],
})

const hospitalIcon = makeHospitalIcon(false)
const targetHospitalIcon = makeHospitalIcon(true)

// ── Icon: Traffic Signal Post (realistic post with 3-light housing) ──────────
const makeSignalIcon = (state) => {
    const colors = {
        RED: { top: '#ef4444', mid: '#374151', bot: '#374151' },
        GREEN: { top: '#374151', mid: '#374151', bot: '#22c55e' },
        YELLOW: { top: '#374151', mid: '#eab308', bot: '#374151' },
        PREEMPTED_GREEN: { top: '#374151', mid: '#374151', bot: '#4ade80' },
    }
    const c = colors[state] || colors.RED
    const glowColor = state === 'RED' ? 'rgba(239,68,68,0.6)'
        : state === 'GREEN' || state === 'PREEMPTED_GREEN' ? 'rgba(34,197,94,0.6)'
            : 'rgba(234,179,8,0.6)'

    return L.divIcon({
        className: '',
        html: `
        <div style="display:flex;flex-direction:column;align-items:center;width:22px;">
          <!-- Signal housing -->
          <div style="
            width:18px;
            background:#1f2937;
            border:2px solid #4b5563;
            border-radius:4px;
            padding:2px;
            display:flex;flex-direction:column;gap:2px;
            box-shadow:0 0 6px ${glowColor};
          ">
            <div style="width:12px;height:12px;border-radius:50%;background:${c.top};margin:0 auto;box-shadow:${c.top !== '#374151' ? '0 0 8px ' + glowColor : 'none'};"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:${c.mid};margin:0 auto;box-shadow:${c.mid !== '#374151' ? '0 0 8px ' + glowColor : 'none'};"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:${c.bot};margin:0 auto;box-shadow:${c.bot !== '#374151' ? '0 0 8px ' + glowColor : 'none'};"></div>
          </div>
          <!-- Post -->
          <div style="width:3px;height:10px;background:#6b7280;border-radius:1px;"></div>
          <!-- Base -->
          <div style="width:8px;height:3px;background:#6b7280;border-radius:1px;"></div>
        </div>`,
        iconSize: [22, 58],
        iconAnchor: [11, 58],
        popupAnchor: [0, -60],
    })
}

// ── Icon: Static OSM signal (small grey post, no state color) ───────────────
const osmSignalIcon = L.divIcon({
    className: '',
    html: `
    <div style="display:flex;flex-direction:column;align-items:center;width:16px;opacity:0.75">
      <div style="
        width:14px;background:#1f2937;border:1.5px solid #6b7280;
        border-radius:3px;padding:1px;display:flex;flex-direction:column;gap:1.5px;
      ">
        <div style="width:9px;height:9px;border-radius:50%;background:#6b2828;margin:0 auto;"></div>
        <div style="width:9px;height:9px;border-radius:50%;background:#6b5c0a;margin:0 auto;"></div>
        <div style="width:9px;height:9px;border-radius:50%;background:#14542b;margin:0 auto;"></div>
      </div>
      <div style="width:2px;height:8px;background:#9ca3af;"></div>
      <div style="width:6px;height:2px;background:#9ca3af;"></div>
    </div>`,
    iconSize: [16, 46],
    iconAnchor: [8, 46],
    popupAnchor: [0, -48],
})

// ── Icon: User GPS Location ──────────────────────────────────────────────────
const userLocationIcon = L.divIcon({
    className: '',
    html: `
    <div style="position:relative;width:28px;height:28px">
      <div style="
        position:absolute;inset:0;
        border-radius:50%;
        background:rgba(59,130,246,0.2);
        animation:amb-ping 1.5s ease-in-out infinite;
      "></div>
      <div style="
        position:absolute;inset:6px;
        background:#3b82f6;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 0 12px rgba(59,130,246,0.8);
      "></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
})

// ── Map pan follower ─────────────────────────────────────────────────────────
function MapFollower({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) map.setView(position, map.getZoom(), { animate: true })
    }, [position, map])
    return null
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MapComponent({
    ambulancePos,
    route,
    signals,        // sim signals with live state (red/green/yellow)
    osmSignals,     // real OSM signals (static, no state)
    allHospitals,   // all hospitals to show as markers
    targetHospital,
    userLocation,
    center,
}) {
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <style>{`
                @keyframes amb-ping {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.7); opacity: 0; }
                }
                .leaflet-popup-content-wrapper {
                    background: #1e293b;
                    color: #e2e8f0;
                    border: 1px solid #334155;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }
                .leaflet-popup-tip { background: #1e293b; }
                .leaflet-popup-content { margin: 10px 14px; font-size: 13px; line-height: 1.5; }
            `}</style>

            <MapContainer
                center={center || [9.9816, 76.2999]}
                zoom={13}
                style={{ width: '100%', height: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Follow ambulance during simulation */}
                {ambulancePos && <MapFollower position={ambulancePos} />}

                {/* Route polyline */}
                {route && route.length > 1 && (
                    <Polyline
                        positions={route}
                        color="#3b82f6"
                        weight={5}
                        opacity={0.9}
                        dashArray="12 6"
                    />
                )}

                {/* ── Real OSM traffic signals (static grey posts) ─── */}
                {osmSignals && osmSignals.map((sig) => (
                    <Marker
                        key={`osm-${sig.id}`}
                        position={[sig.lat, sig.lon]}
                        icon={osmSignalIcon}
                    >
                        <Popup>
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>🚦 Traffic Signal</div>
                                {sig.name && <div style={{ color: '#94a3b8', fontSize: 12 }}>{sig.name}</div>}
                                <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>OSM ID: {sig.id}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* ── Simulation signals (live colored traffic light posts) ─── */}
                {signals && signals.map((sig) => (
                    <Marker
                        key={`sim-${sig.id}`}
                        position={[sig.lat, sig.lon]}
                        icon={makeSignalIcon(sig.state)}
                    >
                        <Popup>
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>🚦 Signal #{sig.id}</div>
                                <div>State: <span style={{
                                    color: sig.state === 'GREEN' || sig.state === 'PREEMPTED_GREEN' ? '#4ade80'
                                        : sig.state === 'RED' ? '#f87171' : '#facc15',
                                    fontWeight: 600
                                }}>{sig.state}</span></div>
                                {sig.state === 'PREEMPTED_GREEN' && (
                                    <div style={{ color: '#4ade80', fontSize: 11, marginTop: 4 }}>⚡ Preempted for ambulance</div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* ── All hospitals ─── */}
                {allHospitals && allHospitals.map((h) => {
                    const isTarget = targetHospital && targetHospital.id === h.id
                    return (
                        <Marker
                            key={`h-${h.id}`}
                            position={[h.lat, h.lon]}
                            icon={isTarget ? targetHospitalIcon : hospitalIcon}
                        >
                            <Popup>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                                        {isTarget ? '🎯 ' : ''}🏥 {h.name}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: 12 }}>{h.specialization}</div>
                                    <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                                        🛏 ICU beds: {h.icu_beds_available}
                                    </div>
                                    {h.capabilities && (
                                        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {h.capabilities.map(cap => (
                                                <span key={cap} style={{
                                                    background: '#1e3a5f', color: '#93c5fd',
                                                    borderRadius: 4, padding: '1px 6px', fontSize: 10
                                                }}>{cap}</span>
                                            ))}
                                        </div>
                                    )}
                                    {isTarget && (
                                        <div style={{
                                            marginTop: 6, background: '#14532d',
                                            color: '#4ade80', borderRadius: 4,
                                            padding: '3px 8px', fontSize: 11, textAlign: 'center'
                                        }}>
                                            ← Ambulance en route
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}

                {/* ── Ambulance marker ─── */}
                {ambulancePos && (
                    <Marker position={ambulancePos} icon={ambulanceIcon}>
                        <Popup>
                            <div>
                                <div style={{ fontWeight: 700 }}>🚑 Ambulance</div>
                                <div style={{ color: '#94a3b8', fontSize: 11 }}>In transit</div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* ── User GPS location ─── */}
                {userLocation && (
                    <Marker position={userLocation} icon={userLocationIcon}>
                        <Popup>
                            <div>
                                <div style={{ fontWeight: 700 }}>📍 Your Location</div>
                                <div style={{ color: '#94a3b8', fontSize: 11 }}>
                                    {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    )
}
