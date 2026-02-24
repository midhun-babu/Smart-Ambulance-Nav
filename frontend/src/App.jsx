import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import MapComponent from './components/MapComponent'
import Dashboard from './components/Dashboard'

const API_BASE = 'http://localhost:8000'

function App() {
    const [graphLoaded, setGraphLoaded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [signals, setSignals] = useState([])

    // Ambulance state
    const [simulationActive, setSimulationActive] = useState(false)
    const [ambulancePos, setAmbulancePos] = useState(null)
    const [route, setRoute] = useState([])
    const [routeIndex, setRouteIndex] = useState(0)
    const [targetHospital, setTargetHospital] = useState(null)
    const [travelTime, setTravelTime] = useState(0)
    const [alerts, setAlerts] = useState([])

    const simIntervalRef = useRef(null)

    useEffect(() => {
        // Check if backend graph is loaded
        const checkGraph = async () => {
            try {
                const res = await axios.get(`${API_BASE}/graph/load`)
                if (res.data.status === 'loaded') {
                    setGraphLoaded(true)
                    fetchSignals()
                }
            } catch (e) {
                console.error("Graph not loaded yet, backend might be starting or loading data.")
                setTimeout(checkGraph, 5000)
            } finally {
                setLoading(false)
            }
        }
        checkGraph()

        // Independent interval to fetch signals for realistic traffic light updates even if ambulance is not moving
        const signalInterval = setInterval(fetchSignals, 2000)
        return () => clearInterval(signalInterval)
    }, [])

    const fetchSignals = async () => {
        try {
            const res = await axios.get(`${API_BASE}/signals/status`)
            if (res.data.signals) setSignals(res.data.signals)
        } catch (e) {
            console.error("Failed to fetch signals")
        }
    }

    const startSimulation = async (caseType, startLat, startLon) => {
        setLoading(true)
        try {
            const res = await axios.post(`${API_BASE}/route`, {
                start_lat: startLat,
                start_lon: startLon,
                case_type: caseType
            })

            setTargetHospital(res.data.hospital)
            setRoute(res.data.route)
            setTravelTime(res.data.estimated_time_minutes)
            setAmbulancePos([startLat, startLon])
            setRouteIndex(0)
            setSimulationActive(true)
            addAlert(`Route calculated to ${res.data.hospital.name}. ETA: ${res.data.estimated_time_minutes} mins.`)

            // Start moving
            if (simIntervalRef.current) clearInterval(simIntervalRef.current)
            simIntervalRef.current = setInterval(simulateMovement, 1000)
        } catch (e) {
            addAlert("Routing failed! Using Failsafe Mode - Nearest General Hospital.")
            console.error("Routing error", e)
        } finally {
            setLoading(false)
        }
    }

    const simulateMovement = async () => {
        setRouteIndex(prev => {
            if (prev >= route.length - 1) {
                clearInterval(simIntervalRef.current)
                setSimulationActive(false)
                addAlert("Ambulance arrived at the destination.")
                return prev
            }

            const nextPos = route[prev + 1]
            setAmbulancePos(nextPos)

            // Call backend to process simulation step
            axios.post(`${API_BASE}/simulate/step`, {
                current_lat: nextPos[0],
                current_lon: nextPos[1],
                route: route,
                speed_kmh: 60
            }).then(res => {
                setSignals(res.data.signals)
                if (res.data.preemption_active) {
                    addAlert("Signal Preempted Ahead! Clean Window active.")
                }
            }).catch(e => console.error("Sim step failed", e))

            return prev + 1
        })
    }

    const addAlert = (msg) => {
        setAlerts(prev => [msg, ...prev].slice(0, 5))
    }

    const triggerEmergencyOptions = () => {
        // Manual trigger failsafe UI
        addAlert("Failsafe Activated: Switching to manual override mode.")
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar Dashboard */}
            <div className="w-1/3 min-w-[320px] max-w-[400px] h-full shadow-xl z-10 bg-white flex flex-col">
                <Dashboard
                    startSimulation={startSimulation}
                    loading={loading || !graphLoaded}
                    targetHospital={targetHospital}
                    travelTime={travelTime}
                    alerts={alerts}
                    triggerEmergencyOptions={triggerEmergencyOptions}
                    simulationActive={simulationActive}
                />
            </div>

            {/* Map Area */}
            <div className="flex-1 h-full relative">
                {!graphLoaded && !loading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center pointer-events-none">
                        <div className="bg-white p-6 rounded-lg text-xl font-bold text-gray-800 shadow-lg">
                            Backend is loading graph data. Please wait...
                        </div>
                    </div>
                )}
                <MapComponent
                    ambulancePos={ambulancePos}
                    route={route}
                    signals={signals}
                    targetHospital={targetHospital}
                    // Default Kochi coordinates
                    center={[9.9816, 76.2999]}
                />
            </div>
        </div>
    )
}

export default App
