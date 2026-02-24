import React, { useState } from 'react'

const Dashboard = ({ startSimulation, loading, targetHospital, travelTime, alerts, triggerEmergencyOptions, simulationActive }) => {
    const [caseType, setCaseType] = useState('General')
    // We'll hardcode a few start points in Kochi for the demo
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
        <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
            {/* Header */}
            <div className="p-6 bg-blue-700 text-white shadow-md">
                <h1 className="text-2xl font-bold tracking-tight">Ambulance Routing</h1>
                <p className="text-blue-100 text-sm mt-1">Kerala Region (Kochi Demo)</p>
            </div>

            {/* Controls */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">

                {/* Case Type Selection */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Case Type</label>
                    <select
                        value={caseType}
                        onChange={e => setCaseType(e.target.value)}
                        disabled={simulationActive || loading}
                        className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="General">General Emergency</option>
                        <option value="Trauma">Severe Trauma</option>
                        <option value="Cardiac">Cardiac Arrest</option>
                    </select>
                </div>

                {/* Start Location Selection */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Ambulance Start Location</label>
                    <select
                        value={selectedStart}
                        onChange={e => setSelectedStart(Number(e.target.value))}
                        disabled={simulationActive || loading}
                        className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {startPoints.map((pt, idx) => (
                            <option key={idx} value={idx}>{pt.label}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleStart}
                    disabled={loading || simulationActive}
                    className={`w-full py-3 rounded-lg text-white font-bold shadow-md transition-all
            ${(loading || simulationActive) ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                >
                    {loading ? 'Processing...' : 'Start Simulation'}
                </button>

                <button
                    onClick={triggerEmergencyOptions}
                    className="w-full py-3 rounded-lg text-red-700 bg-red-100 font-bold border border-red-200 hover:bg-red-200 transition-all active:scale-95"
                >
                    Trigger Emergency Failsafe
                </button>

                {/* Target Hospital Info */}
                {targetHospital && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
                        <h3 className="font-bold text-blue-900 mb-1">Assigned Hospital</h3>
                        <p className="text-sm font-medium text-blue-800">{targetHospital.name}</p>
                        <p className="text-xs text-blue-600 mt-1">{targetHospital.specialization}</p>
                        <div className="mt-3 flex justify-between items-center text-sm font-semibold text-blue-900">
                            <span>ETA: {travelTime} mins</span>
                            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {targetHospital.icu_beds_available} ICU Beds
                            </span>
                        </div>
                    </div>
                )}

            </div>

            {/* Alerts Panel */}
            <div className="p-4 bg-slate-900 text-slate-100 max-h-48 overflow-y-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    System Alerts
                </h3>
                {alerts.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No active alerts.</p>
                ) : (
                    <ul className="space-y-2">
                        {alerts.map((a, i) => (
                            <li key={i} className={`text-sm py-2 px-3 rounded border-l-2 ${a.includes('Preempted') ? 'border-green-400 bg-green-900/30 text-green-100' :
                                    a.includes('Failsafe') ? 'border-red-400 bg-red-900/30 text-red-100' :
                                        'border-blue-400 bg-blue-900/30 text-blue-100'
                                }`}>
                                {a}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </div>
    )
}

export default Dashboard
