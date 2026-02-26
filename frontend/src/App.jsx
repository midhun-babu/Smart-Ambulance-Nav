import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import MapComponent from './components/MapComponent'
import Dashboard from './components/Dashboard'

const API_BASE = 'http://localhost:8000'

function App() {
    const [graphLoaded, setGraphLoaded] = useState(false)
    const [loading, setLoading] = useState(true)

    // Simulation signals (from backend sim state)
    const [signals, setSignals] = useState([])
    // Real OSM signals (static, loaded once)
    const [osmSignals, setOsmSignals] = useState([])
    // All hospitals (static, loaded once)
    const [allHospitals, setAllHospitals] = useState([])

    // Ambulance state
    const [simulationActive, setSimulationActive] = useState(false)
    const [simulationSpeed, setSimulationSpeed] = useState(1)
    const [ambulancePos, setAmbulancePos] = useState(null)
    const [route, setRoute] = useState([])
    const [routeIndex, setRouteIndex] = useState(0)
    const [targetHospital, setTargetHospital] = useState(null)
    const [travelTime, setTravelTime] = useState(0)
    const [alerts, setAlerts] = useState([])

    // GPS state
    const [userLocation, setUserLocation] = useState(null)
    const [gpsLoading, setGpsLoading] = useState(false)

    const simIntervalRef = useRef(null)
    // Store route in a ref so setInterval can access the latest value
    const routeRef = useRef([])
    useEffect(() => { routeRef.current = route }, [route])

    useEffect(() => {
        const checkGraph = async () => {
            try {
                const res = await axios.get(`${API_BASE}/graph/load`)
                if (res.data.status === 'loaded') {
                    setGraphLoaded(true)
                    fetchSignals()
                }
            } catch (e) {
                console.error('Graph not loaded yet, retrying in 5s...')
                setTimeout(checkGraph, 5000)
            } finally {
                setLoading(false)
            }
        }
        checkGraph()

        // Fetch static data once
        fetchAllHospitals()
        fetchOsmSignals()

        // Poll sim signals every 2s
        const signalInterval = setInterval(fetchSignals, 2000)
        return () => clearInterval(signalInterval)
    }, [])

    const fetchSignals = async () => {
        try {
            const res = await axios.get(`${API_BASE}/signals/status`)
            if (res.data.signals) setSignals(res.data.signals)
        } catch (e) {
            console.error('Failed to fetch signals')
        }
    }

    const fetchAllHospitals = async () => {
        try {
            const res = await axios.get(`${API_BASE}/hospitals`)
            if (res.data.hospitals) setAllHospitals(res.data.hospitals)
        } catch (e) {
            console.error('Failed to fetch hospitals', e)
        }
    }

    const fetchOsmSignals = async () => {
        try {
            const res = await axios.get(`${API_BASE}/overpass/signals`)
            if (res.data.signals) setOsmSignals(res.data.signals)
            console.log(`Loaded ${res.data.count} real OSM traffic signals for Ernakulam.`)
        } catch (e) {
            console.error('Failed to fetch OSM signals', e)
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
            routeRef.current = res.data.route
            setTravelTime(res.data.estimated_time_minutes)
            setAmbulancePos([startLat, startLon])
            setRouteIndex(0)
            setSimulationActive(true)
            addAlert(`Route calculated to ${res.data.hospital.name}. ETA: ${res.data.estimated_time_minutes} min.`)

            if (simIntervalRef.current) clearInterval(simIntervalRef.current)
            simIntervalRef.current = setInterval(simulateMovement, 1000 / simulationSpeed)
        } catch (e) {
            addAlert('Routing failed! Using Failsafe Mode - Nearest General Hospital.')
            console.error('Routing error', e)
        } finally {
            setLoading(false)
        }
    }

    const simulateMovement = () => {
        setRouteIndex(prev => {
            const currentRoute = routeRef.current
            if (prev >= currentRoute.length - 1) {
                clearInterval(simIntervalRef.current)
                setSimulationActive(false)
                addAlert('Ambulance arrived at the destination. 🏥')
                return prev
            }

            const nextPos = currentRoute[prev + 1]
            setAmbulancePos(nextPos)

            axios.post(`${API_BASE}/simulate/step`, {
                current_lat: nextPos[0],
                current_lon: nextPos[1],
                route: currentRoute,
                speed_kmh: 60
            }).then(res => {
                setSignals(res.data.signals)
                if (res.data.preemption_active) {
                    addAlert('🟢 Signal Preempted Ahead! Clean Window active.')
                }
            }).catch(e => console.error('Sim step failed', e))

            return prev + 1
        })
    }

    useEffect(() => {
        if (simulationActive && simIntervalRef.current) {
            clearInterval(simIntervalRef.current)
            simIntervalRef.current = setInterval(simulateMovement, 1000 / simulationSpeed)
        }
    }, [simulationSpeed, simulationActive])

    const addAlert = (msg) => {
        setAlerts(prev => [msg, ...prev].slice(0, 8))
    }

    const handleGetGPS = () => {
        if (!navigator.geolocation) {
            addAlert('❌ Geolocation is not supported by your browser.')
            return
        }
        setGpsLoading(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                setUserLocation([latitude, longitude])
                setGpsLoading(false)
                addAlert(`📍 GPS location acquired: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
            },
            (err) => {
                setGpsLoading(false)
                addAlert(`❌ GPS Error: ${err.message}`)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const triggerEmergencyOptions = () => {
        addAlert('⚠️ Failsafe Activated: Switching to manual override mode.')
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100">
            {/* Sidebar Dashboard */}
            <div className="w-1/3 min-w-[350px] max-w-[450px] h-full shadow-2xl z-10 bg-slate-900 flex flex-col border-r border-slate-800">
                <Dashboard
                    startSimulation={startSimulation}
                    loading={loading || !graphLoaded}
                    targetHospital={targetHospital}
                    travelTime={travelTime}
                    alerts={alerts}
                    triggerEmergencyOptions={triggerEmergencyOptions}
                    simulationActive={simulationActive}
                    simulationSpeed={simulationSpeed}
                    setSimulationSpeed={setSimulationSpeed}
                    userLocation={userLocation}
                    onGetGPS={handleGetGPS}
                    gpsLoading={gpsLoading}
                />
            </div>

            {/* Map Area */}
            <div className="flex-1 h-full relative bg-slate-950">
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
                    osmSignals={osmSignals}
                    allHospitals={allHospitals}
                    targetHospital={targetHospital}
                    userLocation={userLocation}
                    center={[9.9816, 76.2999]}
                />
            </div>
        </div>
    )
}

export default App
