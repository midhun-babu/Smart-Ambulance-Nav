import { useState } from 'react'
import { AlertTriangle, Activity, Zap, Play, StopCircle, MapPin, Navigation, Loader } from 'lucide-react'

const CASE_PRESETS = [
    { label: 'Cardiac Arrest', type: 'cardiac', emoji: '❤️', lat: 9.9816, lon: 76.2999 },
    { label: 'Trauma', type: 'trauma', emoji: '🩹', lat: 9.9750, lon: 76.2800 },
    { label: 'Stroke', type: 'stroke', emoji: '🧠', lat: 9.9900, lon: 76.3100 },
    { label: 'Burns', type: 'burns', emoji: '🔥', lat: 9.9680, lon: 76.3050 },
]

export default function Dashboard({
    startSimulation,
    loading,
    targetHospital,
    travelTime,
    alerts,
    triggerEmergencyOptions,
    simulationActive,
    stopSimulation,
    simulationSpeed,
    setSimulationSpeed,
    userLocation,
    onGetGPS,
    gpsLoading,
    isPickingLocation,
    setIsPickingLocation,
    pickedLocation,
    setPickedLocation,
}) {
    const [selectedCase, setSelectedCase] = useState(CASE_PRESETS[0])
    const [useGPS, setUseGPS] = useState(false)

    const TEST_SCENARIOS = [
        { name: 'Select Test Scenario...', lat: 0, lon: 0 },
        { name: 'Marine Drive', lat: 9.9816, lon: 76.2999 },
        { name: 'Lulu Mall, Edappally', lat: 10.0260, lon: 76.3120 },
        { name: 'MG Road Metro', lat: 9.9750, lon: 76.2800 },
        { name: 'Vytila Hub', lat: 9.9680, lon: 76.3180 },
        { name: 'Infopark, Kakkanad', lat: 10.0100, lon: 76.3600 },
    ]

    const handleStart = () => {
        let startLat, startLon;

        if (useGPS && userLocation) {
            startLat = userLocation[0];
            startLon = userLocation[1];
        } else if (pickedLocation) {
            startLat = pickedLocation[0];
            startLon = pickedLocation[1];
        } else {
            startLat = selectedCase.lat;
            startLon = selectedCase.lon;
        }

        startSimulation(selectedCase.type, startLat, startLon);
    }

    const handleScenarioChange = (e) => {
        const scenario = TEST_SCENARIOS.find(s => s.name === e.target.value);
        if (scenario && scenario.lat !== 0) {
            setPickedLocation([scenario.lat, scenario.lon]);
            setUseGPS(false);
            setIsPickingLocation(false);
        }
    }

    const handleGPSToggle = () => {
        if (!useGPS) {
            if (!userLocation) {
                onGetGPS()
            } else {
                setUseGPS(true)
                setPickedLocation(null)
            }
        } else {
            setUseGPS(false)
        }
    }

    return (
        <div className="flex flex-col h-full p-4 gap-3 overflow-y-auto stylish-scrollbar">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-700/80">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl shrink-0">🚑</div>
                <div>
                    <h1 className="text-base font-bold text-slate-100 leading-tight">SmartAmbulance Nav</h1>
                    <p className="text-[11px] text-slate-500">Ernakulam Emergency Response · Kerala</p>
                </div>
                <div className={`ml-auto w-2.5 h-2.5 rounded-full shrink-0 ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} title={loading ? 'Loading…' : 'Backend Ready'} />
            </div>

            {/* Emergency Type */}
            <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Emergency Type</label>
                <div className="grid grid-cols-2 gap-2">
                    {CASE_PRESETS.map(c => (
                        <button
                            key={c.type}
                            onClick={() => setSelectedCase(c)}
                            className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-all border
                                ${selectedCase.type === c.type
                                    ? 'bg-red-500/20 border-red-500/70 text-red-300'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'}`}
                        >
                            <span>{c.emoji}</span>
                            <span className="text-xs">{c.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selection / Testing */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Navigation size={11} /> Selection / Testing
                </label>
                <div className="flex flex-col gap-2">
                    <select
                        onChange={handleScenarioChange}
                        value={pickedLocation ? '' : 'Select Test Scenario...'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-300 outline-none focus:border-blue-500 transition-colors"
                    >
                        {TEST_SCENARIOS.map(s => (
                            <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => { setIsPickingLocation(!isPickingLocation); if (!isPickingLocation) setUseGPS(false); }}
                        className={`w-full py-2 rounded-lg text-xs font-semibold border transition-all
                            ${isPickingLocation ? 'bg-orange-500/20 border-orange-500 text-orange-300 animate-pulse' : 'bg-slate-700/50 border-slate-600 text-slate-300'}`}
                    >
                        {isPickingLocation ? 'Click on Map to Drop Pin' : '📍 Pick Location on Map'}
                    </button>

                    {pickedLocation && !isPickingLocation && (
                        <div className="text-[10px] text-green-400 text-center bg-green-500/10 py-1 rounded border border-green-500/20">
                            ✓ Custom location selected
                        </div>
                    )}
                </div>
            </div>

            {/* GPS Location Section */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/20 p-3">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin size={11} /> Device Origin (GPS)
                </label>

                <div className="flex flex-col gap-2">
                    {/* Get GPS button */}
                    <button
                        onClick={onGetGPS}
                        disabled={gpsLoading}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                        {gpsLoading
                            ? <><Loader size={13} className="animate-spin" /> Getting GPS…</>
                            : <><Navigation size={13} /> {userLocation ? 'Update GPS Location' : 'Use My GPS Location'}</>
                        }
                    </button>

                    {userLocation && (
                        <div className="text-[11px] text-slate-400 bg-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
                            <span className="font-mono text-blue-300">
                                {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                            </span>
                        </div>
                    )}

                    {/* Toggle: preset or GPS */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setUseGPS(false); setIsPickingLocation(false); }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all
                                ${!useGPS ? 'bg-slate-600 border-slate-400 text-slate-100' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                        >
                            📍 Preset Location
                        </button>
                        <button
                            onClick={handleGPSToggle}
                            disabled={!userLocation}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all
                                ${useGPS && userLocation ? 'bg-blue-700/40 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-500'}
                                disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            🛰 My GPS
                        </button>
                    </div>

                    {useGPS && !userLocation && (
                        <p className="text-[10px] text-yellow-400/80 text-center">
                            ↑ Get GPS location first to enable
                        </p>
                    )}
                </div>
            </div>

            {/* Simulation Speed */}
            <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Zap size={11} /> Simulation Speed
                </label>
                <div className="flex gap-2">
                    {[1, 2, 5, 10].map(s => (
                        <button
                            key={s}
                            onClick={() => setSimulationSpeed(s)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border
                                ${simulationSpeed === s
                                    ? 'bg-blue-500/30 border-blue-500 text-blue-300'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                        >
                            {s}×
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleStart}
                    disabled={loading || (useGPS && !userLocation) || simulationActive || isPickingLocation}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-red-900/30"
                >
                    <Play size={15} />
                    {loading ? 'Calculating Route…' : simulationActive ? 'Ambulance in Transit' : useGPS && userLocation ? `Dispatch from GPS` : pickedLocation ? 'Dispatch from Picked Point' : 'Dispatch Ambulance'}
                </button>

                {simulationActive && (
                    <button
                        onClick={stopSimulation}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold text-sm transition-all shadow-lg"
                    >
                        <StopCircle size={15} />
                        Stop Simulation
                    </button>
                )}

                <button
                    onClick={triggerEmergencyOptions}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all border border-slate-600"
                >
                    <AlertTriangle size={13} />
                    Activate Failsafe
                </button>
            </div>

            {/* Hospital Info */}
            {targetHospital && (
                <div className="rounded-xl bg-emerald-900/25 border border-emerald-700/35 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Activity size={13} className="text-emerald-400" />
                        <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">Routed Hospital</span>
                    </div>
                    <p className="text-sm font-bold text-slate-100">{targetHospital.name}</p>
                    {targetHospital.specialization && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{targetHospital.specialization}</p>
                    )}
                    {travelTime && (
                        <p className="text-xs text-slate-400 mt-1">ETA: <span className="text-emerald-300 font-bold">{travelTime} min</span></p>
                    )}
                    {targetHospital.capabilities && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {targetHospital.capabilities.map(cap => (
                                <span key={cap} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-800/40 text-emerald-300 border border-emerald-700/25">
                                    {cap}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Alerts Log */}
            <div className="flex-1 min-h-0">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">System Alerts</label>
                <div className="flex flex-col gap-1.5">
                    {alerts.length === 0 && (
                        <p className="text-xs text-slate-600 italic px-1">No alerts yet. Dispatch to begin.</p>
                    )}
                    {alerts.map((alert, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs border transition-all
                                ${i === 0 ? 'bg-blue-900/25 border-blue-700/35 text-blue-200' : 'bg-slate-800/30 border-slate-700/20 text-slate-400'}`}
                        >
                            <span className="shrink-0 mt-0.5">{i === 0 ? '🔵' : '⚪'}</span>
                            {alert}
                        </div>
                    ))}
                </div>
            </div>

            {/* Active sim badge */}
            {simulationActive && (
                <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-semibold shrink-0">
                    <StopCircle size={13} className="animate-pulse" />
                    Simulation Active
                </div>
            )}

            <p className="text-[10px] text-slate-700 text-center pb-1 shrink-0">Smart Ambulance Nav v1.0 · Ernakulam, Kerala</p>
        </div>
    )
}
