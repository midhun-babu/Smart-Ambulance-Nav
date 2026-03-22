import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MapComponent from './components/MapComponent'
import Dashboard from './components/Dashboard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useGps } from './hooks/useGps'
import * as ambulanceService from './services/ambulanceService'

function MainApp() {
    const { user, logout } = useAuth();
    const [graphLoaded, setGraphLoaded] = useState(false)
    const [loading, setLoading] = useState(true)

    const [signals, setSignals] = useState([])
    const [osmSignals, setOsmSignals] = useState([])
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

    const addAlert = (msg) => {
        setAlerts(prev => [msg, ...prev].slice(0, 8))
    }

    // GPS state logic extracted to hook
    const { userLocation, setUserLocation, gpsLoading, handleGetGps } = useGps(addAlert)

    // Manual Picking state
    const [isPickingLocation, setIsPickingLocation] = useState(false)
    const [pickedLocation, setPickedLocation] = useState(null)

    const simIntervalRef = useRef(null)
    const routeRef = useRef([])
    
    useEffect(() => { routeRef.current = route }, [route])

    useEffect(() => {
        const checkGraph = async () => {
            try {
                const res = await ambulanceService.getGraphStatus()
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
        fetchAllHospitals()
        fetchOsmSignals()

        let signalInterval;
        if (graphLoaded) {
            signalInterval = setInterval(fetchSignals, 2000)
        }
        return () => {
            if (signalInterval) clearInterval(signalInterval)
        }
    }, [graphLoaded])

    const fetchSignals = async () => {
        try {
            const res = await ambulanceService.getSignalsStatus()
            if (res.data.signals) setSignals(res.data.signals)
        } catch (e) {
            console.error('Failed to fetch signals')
        }
    }

    const fetchAllHospitals = async () => {
        try {
            const res = await ambulanceService.getHospitals()
            if (res.data.hospitals) setAllHospitals(res.data.hospitals)
        } catch (e) {
            console.error('Failed to fetch hospitals', e)
        }
    }

    const fetchOsmSignals = async () => {
        try {
            const res = await ambulanceService.getOsmSignals()
            if (res.data.signals) setOsmSignals(res.data.signals)
        } catch (e) {
            console.error('Failed to fetch OSM signals', e)
        }
    }

    const startSimulation = async (caseType, startLat, startLon) => {
        setLoading(true)
        try {
            const res = await ambulanceService.getRoute(startLat, startLon, caseType)
            setTargetHospital(res.data.hospital)
            setRoute(res.data.route)
            routeRef.current = res.data.route
            setTravelTime(res.data.estimated_time_minutes)
            setAmbulancePos([startLat, startLon])
            setRouteIndex(0)
            setSimulationActive(true)
            setPickedLocation(null)
            setIsPickingLocation(false)
            addAlert(`Route calculated to ${res.data.hospital.name}. ETA: ${res.data.estimated_time_minutes} min.`)

            if (simIntervalRef.current) clearInterval(simIntervalRef.current)
            simIntervalRef.current = setInterval(simulateMovement, 1000 / simulationSpeed)
        } catch (e) {
            addAlert('Routing failed! Using Failsafe Mode.')
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
            
            ambulanceService.postSimulationStep(nextPos[0], nextPos[1], currentRoute)
                .then(res => {
                    setSignals(res.data.signals)
                    if (res.data.preemption_active) {
                        addAlert('Green Signal Preempted Ahead!')
                    }
                })
                .catch(e => console.error('Sim step failed', e))
                
            return prev + 1
        })
    }

    const stopSimulation = () => {
        if (simIntervalRef.current) {
            clearInterval(simIntervalRef.current)
            simIntervalRef.current = null
        }
        setSimulationActive(false)
        addAlert('Simulation stopped by operator.')
    }

    useEffect(() => {
        if (simulationActive && simIntervalRef.current) {
            clearInterval(simIntervalRef.current)
            simIntervalRef.current = setInterval(simulateMovement, 1000 / simulationSpeed)
        }
    }, [simulationSpeed, simulationActive])

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
            {/* Dashboard Area */}
            <div className="w-1/3 min-w-[350px] max-w-[450px] h-full shadow-2xl z-20 bg-slate-900 flex flex-col border-r border-slate-800">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Session</p>
                        <p className="text-sm font-bold text-blue-400">{user?.name} ({user?.role})</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-xs bg-slate-800 hover:bg-red-600/20 hover:text-red-400 px-3 py-1.5 rounded-lg border border-slate-700 transition-all font-bold"
                    >
                        Sign Out
                    </button>
                </div>
                <Dashboard
                    startSimulation={startSimulation}
                    stopSimulation={stopSimulation}
                    isPickingLocation={isPickingLocation}
                    setIsPickingLocation={setIsPickingLocation}
                    pickedLocation={pickedLocation}
                    setPickedLocation={setPickedLocation}
                    loading={loading}
                    targetHospital={targetHospital}
                    travelTime={travelTime}
                    alerts={alerts}
                    triggerEmergencyOptions={() => addAlert('Emergency options triggered.')}
                    simulationActive={simulationActive}
                    simulationSpeed={simulationSpeed}
                    setSimulationSpeed={setSimulationSpeed}
                    userLocation={userLocation}
                    onGetGPS={handleGetGps}
                    gpsLoading={gpsLoading}
                />
            </div>

            {/* Map Area */}
            <div className="flex-1 h-full relative">
                <MapComponent
                    ambulancePos={ambulancePos}
                    route={route}
                    signals={signals}
                    osmSignals={osmSignals}
                    allHospitals={allHospitals}
                    targetHospital={targetHospital}
                    userLocation={userLocation}
                    center={[9.9816, 76.2999]}
                    isPickingLocation={isPickingLocation}
                    pickedLocation={pickedLocation}
                    setPickedLocation={setPickedLocation}
                />
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <MainApp />
                        </ProtectedRoute>
                    } />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
