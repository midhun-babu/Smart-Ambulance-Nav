import { useState } from 'react'
import { AlertTriangle, Activity, Zap, Play, StopCircle, MapPin, Navigation, Loader, List, ShieldAlert } from 'lucide-react'
import EmergenciesList from './EmergenciesList'

const CASE_PRESETS = [
    { label: 'Cardiac Arrest', type: 'cardiac', lat: 9.9816, lon: 76.2999, emoji: '❤️' },
    { label: 'Trauma', type: 'trauma', lat: 9.9750, lon: 76.2800, emoji: '🩸' },
    { label: 'Stroke', type: 'stroke', lat: 9.9900, lon: 76.3100, emoji: '🧠' },
    { label: 'Burns', type: 'burns', lat: 9.9680, lon: 76.3050, emoji: '🔥' },
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
    requests = [],
    ambulances = [],
}) {
    const [activeTab, setActiveTab] = useState('control') // 'control' or 'logs'
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
        setActiveTab('logs'); // Switch to logs when simulation starts
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
        <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col p-4 pb-0 bg-slate-900 z-10">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-700/80">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl shrink-0">🚑</div>
                    <div>
                        <h1 className="text-base font-bold text-slate-100 leading-tight">SmartAmbulance Nav</h1>
                        <p className="text-[11px] text-slate-500">Ernakulam Emergency Response · Kerala</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex mt-3 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setActiveTab('control')}
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'control' ? 'bg-slate-700 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Zap size={12} /> Control Center
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'logs' ? 'bg-slate-700 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <List size={12} /> Live Emergencies
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto stylish-scrollbar p-4 flex flex-col gap-4">
                {activeTab === 'control' ? (
                    <>
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
                            </div>
                        </div>

                        {/* GPS Location Section */}
                        <div className="rounded-xl border border-slate-700 bg-slate-800/20 p-3">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <MapPin size={11} /> Device Origin (GPS)
                            </label>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={onGetGPS}
                                    disabled={gpsLoading}
                                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all"
                                >
                                    {gpsLoading ? <Loader size={12} className="animate-spin" /> : <Navigation size={12} />}
                                    {gpsLoading ? 'Getting Location...' : userLocation ? 'Update GPS Location' : 'Use My GPS Location'}
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setUseGPS(false); setIsPickingLocation(false); }}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all
                                            ${!useGPS ? 'bg-slate-700 border-slate-500 text-slate-100' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                                    >
                                        📍 Preset
                                    </button>
                                    <button
                                        onClick={handleGPSToggle}
                                        disabled={!userLocation}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all
                                            ${useGPS && userLocation ? 'bg-blue-700/40 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-500'}
                                            disabled:opacity-40`}
                                    >
                                        🛰 My GPS
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Simulation Speed */}
                        <div>
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Zap size={11} /> Speed
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 5, 10].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSimulationSpeed(s)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border
                                            ${simulationSpeed === s
                                                ? 'bg-blue-500/30 border-blue-500 text-blue-300'
                                                : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                                    >
                                        {s}×
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Box */}
                        <div className="flex flex-col gap-2 mt-auto">
                            <button
                                onClick={handleStart}
                                disabled={loading || (useGPS && !userLocation) || simulationActive || isPickingLocation}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-red-900/40"
                            >
                                <Play size={16} fill="currentColor" />
                                {loading ? 'Processing...' : simulationActive ? 'Ambulance Busy' : 'Dispatch Ambulance'}
                            </button>

                            {simulationActive && (
                                <button
                                    onClick={stopSimulation}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold text-sm transition-all shadow-lg"
                                >
                                    <StopCircle size={15} />
                                    Abort Mission
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Emergencies List Tab */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <ShieldAlert size={12} className="text-red-400" /> Active Requests
                                </label>
                                <EmergenciesList requests={requests} />
                            </div>

                            {/* Active Units */}
                            <div>
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Activity size={12} className="text-blue-400" /> Active Units
                                </label>
                                <div className="flex flex-col gap-2">
                                    {ambulances.length === 0 && (
                                        <div className="p-3 text-center text-slate-500 text-[10px] italic bg-slate-800/20 rounded-lg border border-slate-700">
                                            No tracking data available.
                                        </div>
                                    )}
                                    {ambulances.map(amb => (
                                        <div key={amb.id} className="p-3 bg-slate-800/40 border border-slate-700 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${amb.status === 'AVAILABLE' ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'}`} />
                                                <div>
                                                    <div className="text-xs font-bold text-slate-200">{amb.vehicle_number}</div>
                                                    <div className="text-[9px] text-slate-500 uppercase tracking-tight">{amb.status}</div>
                                                </div>
                                            </div>
                                            {amb.current_lat && (
                                                <div className="text-right">
                                                    <div className="text-[9px] font-mono text-slate-400">{amb.current_lat.toFixed(4)}, {amb.current_lon.toFixed(4)}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* System Stats (Shared) */}
                <div className="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-2">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Live Intelligence</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-slate-800/40 border border-slate-700 rounded-lg">
                            <div className="text-[9px] text-slate-500 uppercase">Requests</div>
                            <div className="text-sm font-bold text-slate-200">{requests.length}</div>
                        </div>
                        <div className="p-2 bg-slate-800/40 border border-slate-700 rounded-lg">
                            <div className="text-[9px] text-slate-500 uppercase">Active Units</div>
                            <div className="text-sm font-bold text-slate-200">{ambulances.filter(a => a.status !== 'OFFLINE').length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-slate-700 text-center py-2 shrink-0 bg-slate-900 border-t border-slate-800/50">Smart Ambulance Nav v1.1 · Ernakulam, Kerala</p>
        </div>
    )
}
