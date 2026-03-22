import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function MapEvents({ isPickingLocation, setPickedLocation }) {
    useMapEvents({
        click(e) {
            if (isPickingLocation) {
                setPickedLocation([e.latlng.lat, e.latlng.lng])
            }
        },
    })
    return null
}

// ── Icon: Ambulance (Cleaner light-mode compatible) ─────────────────────────────
const ambulanceIcon = L.divIcon({
    className: '',
    html: `
    <div style="position:relative;width:44px;height:44px">
      <div style="
        position:absolute;inset:0;
        border-radius:50%;
        background:rgba(239,68,68,0.15);
        animation:amb-ping 1.2s ease-in-out infinite;
      "></div>
      <div style="
        position:absolute;inset:4px;
        background:#ef4444;
        border:3px solid #fff;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:18px;
        box-shadow:0 4px 15px rgba(239,68,68,0.4);
      ">🚑</div>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
})

// ── Icon: Target Hospital (Premium Emerald) ─────────────────────────────────────
const makeHospitalIcon = (isTarget = false) => L.divIcon({
    className: '',
    html: `
    <div style="
      width:${isTarget ? 42 : 36}px;height:${isTarget ? 42 : 36}px;
      background:${isTarget ? '#10b981' : '#3b82f6'};
      border:3px solid #fff;
      border-radius:12px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 12px ${isTarget ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.2)'};
      position:relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    ">
      <div style="position:absolute;width:60%;height:22%;background:white;border-radius:2px;"></div>
      <div style="position:absolute;height:60%;width:22%;background:white;border-radius:2px;"></div>
      ${isTarget ? '<div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;background:#ef4444;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(239,68,68,0.5);"></div>' : ''}
    </div>`,
    iconSize: [isTarget ? 42 : 36, isTarget ? 42 : 36],
    iconAnchor: [isTarget ? 21 : 18, isTarget ? 42 : 36],
    popupAnchor: [0, isTarget ? -44 : -38],
})

const hospitalIcon = makeHospitalIcon(false)
const targetHospitalIcon = makeHospitalIcon(true)

// ── Icon: Traffic Signal (Modern Slate Housing) ──────────────────────────────────
const makeSignalIcon = (state) => {
    const colors = {
        RED: { top: '#ef4444', mid: '#e2e8f0', bot: '#e2e8f0' },
        GREEN: { top: '#e2e8f0', mid: '#e2e8f0', bot: '#10b981' },
        YELLOW: { top: '#e2e8f0', mid: '#f59e0b', bot: '#e2e8f0' },
        PREEMPTED_GREEN: { top: '#e2e8f0', mid: '#e2e8f0', bot: '#10b981' },
    }
    const c = colors[state] || colors.RED
    const glowColor = state === 'RED' ? 'rgba(239,68,68,0.4)'
        : (state === 'GREEN' || state === 'PREEMPTED_GREEN') ? 'rgba(16,185,129,0.4)'
            : 'rgba(245,158,11,0.4)'

    return L.divIcon({
        className: '',
        html: `
        <div style="display:flex;flex-direction:column;align-items:center;width:24px;">
          <div style="
            width:20px;
            background:#334155;
            border:2px solid #fff;
            border-radius:6px;
            padding:3px;
            display:flex;flex-direction:column;gap:3px;
            box-shadow:0 4px 10px rgba(0,0,0,0.1);
          ">
            <div style="width:12px;height:12px;border-radius:50%;background:${c.top};margin:0 auto;box-shadow:${c.top !== '#e2e8f0' ? '0 0 6px ' + glowColor : 'none'};transition:all 0.4s;"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:${c.mid};margin:0 auto;box-shadow:${c.mid !== '#e2e8f0' ? '0 0 6px ' + glowColor : 'none'};transition:all 0.4s;"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:${c.bot};margin:0 auto;box-shadow:${c.bot !== '#e2e8f0' ? '0 0 6px ' + glowColor : 'none'};transition:all 0.4s;"></div>
          </div>
          <div style="width:3px;height:12px;background:#94a3b8;border-radius:1px;"></div>
        </div>`,
        iconSize: [24, 64],
        iconAnchor: [12, 64],
        popupAnchor: [0, -66],
    })
}

// ── Icon: OSM Signal (Clean Slate) ────────────────────────────────────────────────
const osmSignalIcon = L.divIcon({
    className: '',
    html: `
    <div style="display:flex;flex-direction:column;align-items:center;width:18px;opacity:0.6">
      <div style="
        width:14px;background:#475569;border:1.5px solid #fff;
        border-radius:4px;padding:2px;display:flex;flex-direction:column;gap:2px;
      ">
        <div style="width:8px;height:8px;border-radius:50%;background:#cbd5e1;margin:0 auto;"></div>
        <div style="width:8px;height:8px;border-radius:50%;background:#cbd5e1;margin:0 auto;"></div>
        <div style="width:8px;height:8px;border-radius:50%;background:#cbd5e1;margin:0 auto;"></div>
      </div>
      <div style="width:2px;height:10px;background:#94a3b8;"></div>
    </div>`,
    iconSize: [18, 48],
    iconAnchor: [9, 48],
    popupAnchor: [0, -50],
})

// ── Icon: User GPS Location ──────────────────────────────────────────────────
const userLocationIcon = L.divIcon({
    className: '',
    html: `
    <div style="position:relative;width:30px;height:30px">
      <div style="
        position:absolute;inset:0;
        border-radius:50%;
        background:rgba(59,130,246,0.1);
        animation:amb-ping 1.5s ease-in-out infinite;
      "></div>
      <div style="
        position:absolute;inset:6px;
        background:#3b82f6;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 4px 12px rgba(59,130,246,0.3);
      "></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
})

function MapFollower({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) map.setView(position, map.getZoom(), { animate: true })
    }, [position, map])
    return null
}

export default function MapComponent({
    ambulancePos,
    route,
    signals,
    osmSignals,
    allHospitals,
    targetHospital,
    userLocation,
    center,
    isPickingLocation,
    pickedLocation,
    setPickedLocation,
}) {
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <style>{`
                @keyframes amb-ping {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.7); opacity: 0; }
                }
                .leaflet-popup-content-wrapper {
                    background: #ffffff;
                    color: #0f172a;
                    border: none;
                    border-radius: 16px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    padding: 0;
                }
                .leaflet-popup-tip { background: #ffffff; }
                .leaflet-popup-content { margin: 16px; font-family: 'Inter', sans-serif; min-width: 180px; }
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

                {ambulancePos && <MapFollower position={ambulancePos} />}

                {ambulancePos && (
                    <Circle
                        center={ambulancePos}
                        radius={300}
                        pathOptions={{
                            color: '#10b981',
                            fillColor: '#10b981',
                            fillOpacity: 0.08,
                            weight: 1.5,
                            dashArray: '4, 8'
                        }}
                    />
                )}

                <MapEvents isPickingLocation={isPickingLocation} setPickedLocation={setPickedLocation} />

                {pickedLocation && (
                    <Marker position={pickedLocation}>
                        <Popup>
                            <div className="font-bold text-slate-800">Dispatch Location</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1">{pickedLocation[0].toFixed(5)}, {pickedLocation[1].toFixed(5)}</div>
                        </Popup>
                    </Marker>
                )}

                {route && route.length > 1 && (
                    <Polyline
                        positions={route}
                        color="#3b82f6"
                        weight={6}
                        opacity={0.7}
                        lineCap="round"
                    />
                )}

                {osmSignals && osmSignals.map((sig) => (
                    <Marker
                        key={`osm-${sig.id}`}
                        position={[sig.lat, sig.lon]}
                        icon={osmSignalIcon}
                    >
                        <Popup>
                            <div className="space-y-1">
                                <div className="font-black text-slate-900 text-xs flex items-center gap-2">🚦 Traffic Node</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{sig.name || "Managed Intersection"}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {signals && signals.map((sig) => (
                    <Marker
                        key={`sim-${sig.id}`}
                        position={[sig.lat, sig.lon]}
                        icon={makeSignalIcon(sig.state)}
                    >
                        <Popup>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-slate-900 text-xs">Signal #{sig.id}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                        sig.state.includes('GREEN') ? 'bg-emerald-50 text-emerald-600' : sig.state === 'RED' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                                    }`}>{sig.state}</span>
                                </div>
                                {sig.state === 'PREEMPTED_GREEN' && (
                                    <div className="flex items-center gap-2 p-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold animate-pulse">
                                        ⚡ Preemption Active
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {allHospitals && allHospitals.map((h) => {
                    const isTarget = targetHospital && (targetHospital.id === h.id || targetHospital._id === h._id)
                    return (
                        <Marker
                            key={`h-${h._id || h.id}`}
                            position={[h.lat, h.lon]}
                            icon={isTarget ? targetHospitalIcon : hospitalIcon}
                        >
                            <Popup>
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-black text-slate-900 text-sm leading-tight">{h.name}</div>
                                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{h.specialization || "Emergency Care"}</div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                        <div className="p-1 bg-slate-100 rounded text-slate-500 font-black text-[9px] uppercase tracking-tighter">ICU: {h.icu_beds_available}+</div>
                                        {isTarget && (
                                            <div className="px-2 py-1 bg-red-500 text-white rounded text-[8px] font-black uppercase tracking-widest animate-pulse">En Route</div>
                                        )}
                                    </div>
                                    
                                    {h.capabilities && (
                                        <div className="flex flex-wrap gap-1">
                                            {h.capabilities.slice(0, 3).map(cap => (
                                                <span key={cap} className="px-1.5 py-0.5 bg-slate-50 text-slate-400 border border-slate-100 rounded text-[8px] font-black uppercase">{cap}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}

                {ambulancePos && (
                    <Marker position={ambulancePos} icon={ambulanceIcon}>
                        <Popup>
                            <div className="flex flex-col items-center gap-2 py-1">
                                <div className="font-black text-red-500 text-xs tracking-widest uppercase italic">Ambulance Alpha</div>
                                <div className="text-[10px] text-slate-400 font-bold">Status: Emergency Transit</div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {userLocation && (
                    <Marker position={userLocation} icon={userLocationIcon}>
                        <Popup>
                            <div className="font-black text-blue-600 text-xs uppercase tracking-tight">Your Signal</div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    )
}
