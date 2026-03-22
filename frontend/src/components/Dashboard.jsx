import { useState } from 'react'
import { AlertTriangle, Activity, Zap, Play, StopCircle, MapPin, Navigation, Loader, ChevronRight, Info } from 'lucide-react'

const CASE_PRESETS = [
    { label: 'Cardiac Arrest', type: 'cardiac', icon: '❤️', color: 'red' },
    { label: 'Trauma', type: 'trauma', icon: '🤕', color: 'orange' },
    { label: 'Stroke', type: 'stroke', icon: '🧠', color: 'purple' },
    { label: 'Burns', type: 'burns', icon: '🔥', color: 'yellow' },
]

export default function Dashboard({
    startSimulation,
    loading,
    targetHospital,
    travelTime,
    alerts,
    triggerEmergencyOptions,
    simulationActive,
    liveTrackingActive,
    startLiveTracking,
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
    const [trackingMode, setTrackingMode] = useState('simulation') // 'simulation' vs 'live'

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
        if (trackingMode === 'live') {
            if (!userLocation) return;
            startLat = userLocation[0];
            startLon = userLocation[1];
            startLiveTracking(selectedCase.type, startLat, startLon);
            return;
        }
        if (useGPS && userLocation) {
            startLat = userLocation[0];
            startLon = userLocation[1];
        } else if (pickedLocation) {
            startLat = pickedLocation[0];
            startLon = pickedLocation[1];
        } else {
            // Default to preset (just use Marine Drive coordinates if nothing picked/gps)
            startLat = 9.9816;
            startLon = 76.2999;
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
            if (!userLocation) onGetGPS();
            else { setUseGPS(true); setPickedLocation(null); }
        } else { setUseGPS(false); }
    }

    return (
        <div className="flex flex-col h-full bg-white text-slate-900 font-sans p-6 gap-6 overflow-y-auto stylish-scrollbar animate-in slide-in-from-left duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl shadow-inner group">
                    🚑
                </div>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">SmartNav</h1>
                    <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest mt-1.5 flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-orange-400 animate-pulse' : 'bg-emerald-500'}`} />
                        Ernakulam Network
                    </p>
                </div>
            </div>

            {/* Mode Selection */}
            <div className="bg-slate-50 p-1.5 rounded-[1.25rem] border border-slate-100 flex shadow-sm">
                <button
                    onClick={() => setTrackingMode('simulation')}
                    className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${trackingMode === 'simulation' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-black/[0.02]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Simulation
                </button>
                <button
                    onClick={() => { setTrackingMode('live'); setUseGPS(true); if (!userLocation) onGetGPS(); }}
                    className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${trackingMode === 'live' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Live GPS
                </button>
            </div>

            {/* Emergency Type Container */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={12} className="text-emerald-500" /> Dispatch Case
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {CASE_PRESETS.map(c => (
                        <button
                            key={c.type}
                            onClick={() => setSelectedCase(c)}
                            className={`flex flex-col items-start gap-2 p-4 rounded-2xl transition-all border text-left group
                                ${selectedCase.type === c.type
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 shadow-slate-900/10 -translate-y-1'
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'}`}
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{c.icon}</span>
                            <span className="text-[11px] font-black uppercase tracking-tight">{c.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Location Management */}
            <div className="space-y-6">
                {trackingMode === 'simulation' && (
                    <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-5 space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Navigation size={12} className="text-blue-500" /> Origin Control
                        </label>
                        
                        <div className="space-y-3">
                            <select
                                onChange={handleScenarioChange}
                                value={pickedLocation ? '' : 'Select Test Scenario...'}
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm shadow-black/[0.02]"
                            >
                                {TEST_SCENARIOS.map(s => (
                                    <option key={s.name} value={s.name}>{s.name}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => { setIsPickingLocation(!isPickingLocation); if (!isPickingLocation) setUseGPS(false); }}
                                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all active:scale-95
                                    ${isPickingLocation 
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200 animate-pulse' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {isPickingLocation ? 'Picking Point...' : '📍 Pick on Map'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-emerald-50/30 rounded-3xl border border-emerald-100/50 p-5 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} className="text-emerald-500" /> Device Telemetry
                    </label>

                    <div className="space-y-3">
                        <button
                            onClick={onGetGPS}
                            disabled={gpsLoading}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-tight transition-all disabled:opacity-50 hover:bg-emerald-50 active:scale-95 shadow-sm"
                        >
                            {gpsLoading ? <Loader size={12} className="animate-spin" /> : <Navigation size={12} />}
                            {userLocation ? 'Refresh Signal' : 'Acquire GPS'}
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={() => { setUseGPS(false); setIsPickingLocation(false); }}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                                    ${!useGPS ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                            >
                                Static
                            </button>
                            <button
                                onClick={handleGPSToggle}
                                disabled={!userLocation}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                                    ${useGPS && userLocation ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border-slate-100 text-slate-400'}
                                    disabled:opacity-40 disabled:grayscale`}
                            >
                                Satellite
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulation Controls */}
            {trackingMode === 'simulation' && (
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warp Speed</label>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        {[1, 2, 5, 10].map(s => (
                            <button
                                key={s}
                                onClick={() => setSimulationSpeed(s)}
                                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${simulationSpeed === s ? 'bg-white text-blue-600 shadow-sm shadow-blue-900/10 ring-1 ring-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {s}×
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Primary Action */}
            <div className="space-y-3 pt-4 border-t border-slate-50">
                <button
                    onClick={handleStart}
                    disabled={loading || simulationActive || liveTrackingActive || isPickingLocation}
                    className={`btn-primary w-full h-14 text-sm tracking-wide ${trackingMode === 'live' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-emerald-600 shadow-emerald-200'}`}
                >
                    {loading ? (
                        <Loader className="animate-spin" size={20} />
                    ) : (simulationActive || liveTrackingActive) ? (
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                            Dispatching...
                        </div>
                    ) : (
                        <>
                            <Zap size={18} fill="currentColor" />
                            {trackingMode === 'live' ? 'Initiate Emergency Response' : 'Execute Simulation'}
                        </>
                    )}
                </button>

                {(simulationActive || liveTrackingActive) && (
                    <button
                        onClick={stopSimulation}
                        className="w-full py-3 rounded-2xl bg-white border border-red-100 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                    >
                        Abort Mission
                    </button>
                )}
            </div>

            {/* Active Destination Card */}
            {targetHospital && (
                <div className="glass-card p-5 border-emerald-100 bg-emerald-50/20 animate-in zoom-in duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                                <Activity size={12} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Destination</span>
                        </div>
                        <span className="text-xl font-black text-emerald-600">{travelTime || '--'} <span className="text-[10px] font-bold">MIN</span></span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">{targetHospital.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <Info size={10} className="text-slate-400" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{targetHospital.specialization || "Emergency Unit"}</span>
                    </div>
                </div>
            )}

            {/* Logs Area */}
            <div className="flex-1 min-h-0 flex flex-col space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} className="text-yellow-500" /> Live Feed
                </label>
                <div className="flex-1 bg-slate-50/50 rounded-3xl border border-slate-100 p-4 overflow-y-auto stylish-scrollbar space-y-3">
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2 opacity-50">
                            <Info size={24} />
                            <p className="text-[11px] font-bold italic">Standby for updates...</p>
                        </div>
                    ) : (
                        alerts.map((alert, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-3 p-3 rounded-xl text-[11px] font-bold leading-relaxed border transition-all animate-in slide-in-from-right duration-300
                                    ${i === 0 ? 'bg-white border-blue-100 text-blue-700 shadow-sm' : 'bg-transparent border-transparent text-slate-400 opacity-60'}`}
                            >
                                <ChevronRight size={14} className={`shrink-0 ${i === 0 ? 'text-blue-500' : 'text-slate-300'}`} />
                                {alert}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <footer className="pt-4 text-center border-t border-slate-50">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Smart AmbuNav v2.0 Premium</p>
            </footer>
        </div>
    )
}
