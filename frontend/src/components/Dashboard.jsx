import React, { useState } from 'react'
import { AlertCircle, Navigation, Activity, Clock, Play, MapPin, Zap, Settings2 } from 'lucide-react'

const Dashboard = ({ startSimulation, loading, targetHospital, travelTime, alerts, triggerEmergencyOptions, simulationActive, simulationSpeed, setSimulationSpeed }) => {
    const [caseType, setCaseType] = useState('General')
    const startPoints = [
        { label: "Marine Drive", lat: 9.9790, lon: 76.2764 },
        { label: "Edappally Toll", lat: 10.0270, lon: 76.3082 },
        { label: "Vyttila Mobility Hub", lat: 9.9657, lon: 76.3183 },
        { label: "Kakkanad InfoPark", lat: 10.0118, lon: 76.3456 },
    ]
    const [selectedStart, setSelectedStart] = useState(0)

    const handleStart = () => {
        const pt = startPoints[selectedStart]
        startSimulation(caseType, pt.lat, pt.lon)
    }

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800/50">
            {/* Mission Control Header */}
            <div className="p-6 bg-gradient-to-r from-blue-900/40 to-slate-900 border-b border-blue-900/30">
                <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-blue-400" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Ambulance Routing</h1>
                        <p className="text-blue-400 text-sm tracking-widest uppercase mt-1">Kerala Region :: Mission Control</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6 stylish-scrollbar">

                {/* Case Type Selection */}
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                        <AlertCircle className="w-4 h-4 text-red-500" /> Emergency Case Type
                    </label>
                    <select
                        value={caseType}
                        onChange={e => setCaseType(e.target.value)}
                        disabled={simulationActive || loading}
                        className="w-full bg-slate-950/80 border border-slate-700 text-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                    >
                        <option value="General">General Emergency</option>
                        <option value="Trauma">Severe Trauma</option>
                        <option value="Cardiac">Cardiac Arrest</option>
                    </select>
                </div>

                {/* Start Location Selection */}
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                        <Navigation className="w-4 h-4 text-blue-400" /> Ambulance Start Location
                    </label>
                    <select
                        value={selectedStart}
                        onChange={e => setSelectedStart(Number(e.target.value))}
                        disabled={simulationActive || loading}
                        className="w-full bg-slate-950/80 border border-slate-700 text-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                    >
                        {startPoints.map((pt, idx) => (
                            <option key={idx} value={idx}>{pt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Simulation Speed Control */}
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
                    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300 mb-3">
                        <div className="flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-emerald-400" /> Simulation Speed (Evaluator Mode)
                        </div>
                        <span className="text-xs font-normal text-slate-400">Fast-forward map movement to save time.</span>
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 5, 10].map(speed => (
                            <button
                                key={speed}
                                onClick={() => setSimulationSpeed(speed)}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${simulationSpeed === speed ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>

                {/* Primary Actions */}
                <div className="space-y-3 pt-2">
                    <button
                        onClick={handleStart}
                        disabled={loading || simulationActive}
                        className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${(loading || simulationActive) ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20 border-t-2 border-white/20 active:scale-95'}`}
                    >
                        {loading ? <Clock className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                        {loading ? 'Processing...' : 'LAUNCH FLIGHT PATH'}
                    </button>

                    <button
                        onClick={triggerEmergencyOptions}
                        className="w-full py-3 rounded-xl text-red-400 bg-red-950/20 font-bold border border-red-900/50 hover:bg-red-900/40 hover:text-red-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Zap className="w-4 h-4 fill-current" /> Manual Failsafe Override
                    </button>
                </div>

                {/* Target Hospital HUD */}
                {targetHospital && (
                    <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-500/30 p-5 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.1)] mt-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Destination Locked</h3>
                        <p className="text-xl font-extrabold text-white tracking-wide">{targetHospital.name}</p>
                        <p className="text-sm text-slate-400 mt-1">{targetHospital.specialization}</p>

                        <div className="mt-4 pt-4 border-t border-blue-900/30 flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                                <span className="text-slate-500 text-xs uppercase tracking-wider">Est. Travel</span>
                                <span className="text-lg font-mono font-bold text-emerald-400 flex items-center gap-1"><Clock className="w-4 h-4" /> {travelTime} m</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-slate-500 text-xs uppercase tracking-wider">ICU Status</span>
                                <span className="bg-blue-950 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-900/50 mt-1">
                                    {targetHospital.icu_beds_available} BEDS OPEN
                                </span>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Logs / Alerts Panel */}
            <div className="p-5 bg-slate-950/80 border-t border-slate-800">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                    System Telemetry Log
                </h3>
                <div className="h-32 overflow-y-auto stylish-scrollbar pr-2">
                    {alerts.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-600 text-xs font-mono">System standing by...</div>
                    ) : (
                        <div className="space-y-2">
                            {alerts.map((a, i) => (
                                <div key={i} className={`text-xs p-3 rounded-lg border-l-2 font-mono ${a.includes('Preempted') ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200' :
                                    a.includes('Failsafe') ? 'border-red-500 bg-red-950/30 text-red-200' :
                                        'border-blue-500 bg-blue-950/30 text-blue-200'
                                    }`}>
                                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                    {a}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default Dashboard
