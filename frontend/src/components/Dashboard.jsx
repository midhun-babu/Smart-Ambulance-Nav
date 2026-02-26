import { useState } from 'react'
import { AlertTriangle, Activity, Hospital, Zap, Play, StopCircle } from 'lucide-react'

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
    simulationSpeed,
    setSimulationSpeed,
}) {
    const [selectedCase, setSelectedCase] = useState(CASE_PRESETS[0])

    const handleStart = () => {
        startSimulation(selectedCase.type, selectedCase.lat, selectedCase.lon)
    }

    return (
        <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto stylish-scrollbar">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl">🚑</div>
                <div>
                    <h1 className="text-base font-bold text-slate-100 leading-tight">SmartAmbulance</h1>
                    <p className="text-xs text-slate-400">Kerala Emergency Response System</p>
                </div>
                <div className={`ml-auto w-2.5 h-2.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} title={loading ? 'Loading…' : 'Ready'} />
            </div>

            {/* Case Selector */}
            <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Emergency Type</label>
                <div className="grid grid-cols-2 gap-2">
                    {CASE_PRESETS.map(c => (
                        <button
                            key={c.type}
                            onClick={() => setSelectedCase(c)}
                            className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-all border
                                ${selectedCase.type === c.type
                                    ? 'bg-red-500/20 border-red-500 text-red-300'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                        >
                            <span>{c.emoji}</span>
                            <span>{c.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Simulation Speed */}
            <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                    <Zap size={12} /> Simulation Speed
                </label>
                <div className="flex gap-2">
                    {[1, 2, 5, 10].map(s => (
                        <button
                            key={s}
                            onClick={() => setSimulationSpeed(s)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border
                                ${simulationSpeed === s
                                    ? 'bg-blue-500/30 border-blue-500 text-blue-300'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
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
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-red-900/30"
                >
                    <Play size={16} />
                    {loading ? 'Calculating Route…' : 'Dispatch Ambulance'}
                </button>
                <button
                    onClick={triggerEmergencyOptions}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-sm transition-all"
                >
                    <AlertTriangle size={14} />
                    Activate Failsafe
                </button>
            </div>

            {/* Hospital Info */}
            {targetHospital && (
                <div className="rounded-xl bg-emerald-900/30 border border-emerald-700/40 p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={14} className="text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Routed Hospital</span>
                    </div>
                    <p className="text-sm font-bold text-slate-100">{targetHospital.name}</p>
                    {travelTime && (
                        <p className="text-xs text-slate-400 mt-0.5">ETA: <span className="text-emerald-300 font-semibold">{travelTime} min</span></p>
                    )}
                    {targetHospital.capabilities && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {targetHospital.capabilities.map(cap => (
                                <span key={cap} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-800/50 text-emerald-300 border border-emerald-700/30">
                                    {cap}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Alerts Log */}
            <div className="flex-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">System Alerts</label>
                <div className="flex flex-col gap-2">
                    {alerts.length === 0 && (
                        <p className="text-xs text-slate-600 italic">No alerts yet. Dispatch to begin.</p>
                    )}
                    {alerts.map((alert, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-2 p-2.5 rounded-lg text-xs border
                                ${i === 0 ? 'bg-blue-900/30 border-blue-700/40 text-blue-200' : 'bg-slate-800/50 border-slate-700/30 text-slate-400'}`}
                        >
                            <span className="mt-0.5 shrink-0">
                                {i === 0 ? '🔵' : '⚪'}
                            </span>
                            {alert}
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Badge */}
            {simulationActive && (
                <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
                    <StopCircle size={14} className="animate-pulse" />
                    Simulation Active
                </div>
            )}

            <p className="text-[10px] text-slate-700 text-center pb-1">Smart Ambulance Nav v1.0 · Kochi, Kerala</p>
        </div>
    )
}
