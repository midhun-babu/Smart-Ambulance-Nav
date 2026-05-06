import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MapComponent from './components/MapComponent'
import Dashboard from './components/Dashboard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import HospitalDashboard from './pages/HospitalDashboard'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useGps } from './hooks/useGps'
import * as ambulanceService from './services/ambulanceService'
import { LogOut, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

function MainApp() {
    const { user, logout } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [graphLoaded, setGraphLoaded] = useState(false)
    const [loading, setLoading] = useState(true)

    const [signals, setSignals] = useState([])
    const [allHospitals, setAllHospitals] = useState([])
    const [activeDrivers, setActiveDrivers] = useState([])

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

    const { userLocation, setUserLocation, gpsLoading, handleGetGps, startGpsTracking, stopGpsTracking } = useGps(addAlert)

    const [liveTrackingActive, setLiveTrackingActive] = useState(false)

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
        fetchActiveDrivers()

        let signalInterval;
        let driverInterval;
        if (graphLoaded) {
            signalInterval = setInterval(fetchSignals, 2000)
        }
        driverInterval = setInterval(fetchActiveDrivers, 5000)
        return () => {
            if (signalInterval) clearInterval(signalInterval)
            if (driverInterval) clearInterval(driverInterval)
        }
    }, [graphLoaded])

    useEffect(() => {
        if (user?.role !== 'driver') return
        const reportLocation = () => {
            if (userLocation) {
                const status = (simulationActive || liveTrackingActive) ? 'not available' : 'available'
                ambulanceService.updateDriverLocation(userLocation[0], userLocation[1], status)
                    .catch(e => console.warn('Location report failed', e))
            }
        }
        reportLocation()
        const interval = setInterval(reportLocation, 10000)
        return () => clearInterval(interval)
    }, [user, userLocation, simulationActive, liveTrackingActive])

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



    const fetchActiveDrivers = async () => {
        try {
            const res = await ambulanceService.getActiveDrivers()
            if (res.data.drivers) setActiveDrivers(res.data.drivers)
        } catch (e) {
            console.error('Failed to fetch active drivers', e)
        }
    }

    const startSimulation = async (caseType, startLat, startLon, hospitalId = null) => {
        setLoading(true)
        try {
            const res = await ambulanceService.getRoute(startLat, startLon, caseType, hospitalId)
            setTargetHospital(res.data.hospital)
            setRoute(res.data.route)
            routeRef.current = res.data.route
            setTravelTime(res.data.estimated_time_minutes)
            setAmbulancePos([startLat, startLon])
            setRouteIndex(0)
            setSimulationActive(true)
            setLiveTrackingActive(false)
            setPickedLocation(null)
            setIsPickingLocation(false)
            stopGpsTracking()
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

    const startLiveTracking = async (caseType, startLat, startLon, hospitalId = null) => {
        setLoading(true)
        try {
            const res = await ambulanceService.getRoute(startLat, startLon, caseType, hospitalId)
            const hospitalData = res.data.hospital
            const initialRoute = res.data.route
            
            setTargetHospital(hospitalData)
            setRoute(initialRoute)
            routeRef.current = initialRoute
            setTravelTime(res.data.estimated_time_minutes)
            setAmbulancePos([startLat, startLon])
            setRouteIndex(0)
            setLiveTrackingActive(true)
            setSimulationActive(false)
            setPickedLocation(null)
            setIsPickingLocation(false)
            addAlert(`Route found to ${hospitalData.name}. ETA: ${res.data.estimated_time_minutes} min. Live GPS active.`)

            if (simIntervalRef.current) clearInterval(simIntervalRef.current)
            
            let lastRecalcLat = startLat
            let lastRecalcLon = startLon

            startGpsTracking(async (newLoc) => {
                setAmbulancePos(newLoc)
                
                const dLat = newLoc[0] - lastRecalcLat
                const dLon = newLoc[1] - lastRecalcLon
                const distApprox = Math.sqrt(dLat * dLat + dLon * dLon)
                
                if (distApprox > 0.0003) { // ~30m threshold
                    lastRecalcLat = newLoc[0]
                    lastRecalcLon = newLoc[1]
                    try {
                        const routeRes = await ambulanceService.getRoute(newLoc[0], newLoc[1], caseType, hospitalId)
                        setRoute(routeRes.data.route)
                        routeRef.current = routeRes.data.route
                        setTravelTime(routeRes.data.estimated_time_minutes)
                    } catch (e) {
                        console.warn('Route recalc failed, keeping existing route', e)
                    }
                }

                ambulanceService.postSimulationStep(newLoc[0], newLoc[1], routeRef.current)
                    .then(res => {
                        setSignals(res.data.signals)
                        if (res.data.preemption_active) {
                            addAlert('Green Signal Preempted Ahead!')
                        }
                    })
                    .catch(e => console.error('Sim step failed', e))
            })

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
                addAlert('Ambulance arrived at the destination.')
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
        stopGpsTracking()
        setSimulationActive(false)
        setLiveTrackingActive(false)
        addAlert('Navigation stopped by operator.')
    }

    useEffect(() => {
        if (simulationActive && simIntervalRef.current) {
            clearInterval(simIntervalRef.current)
            simIntervalRef.current = setInterval(simulateMovement, 1000 / simulationSpeed)
        }
    }, [simulationSpeed, simulationActive])

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
            <div className="w-1/3 min-w-[380px] max-w-[450px] h-full shadow-2xl z-20 bg-white flex flex-col border-r border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xs shadow-inner">
                            {user?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-none">{isAdmin ? 'Admin View' : 'Driver Session'}</p>
                            <p className="text-sm font-black text-slate-800 mt-1">{user?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                                title="Back to Admin Dashboard"
                            >
                                <ArrowLeft size={16} />
                            </Link>
                        )}
                        <button
                            onClick={logout}
                            className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95"
                            title="Sign Out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
                <Dashboard
                    isAdmin={isAdmin}
                    startSimulation={startSimulation}
                    startLiveTracking={startLiveTracking}
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
                    liveTrackingActive={liveTrackingActive}
                    simulationSpeed={simulationSpeed}
                    setSimulationSpeed={setSimulationSpeed}
                    userLocation={userLocation}
                    onGetGPS={handleGetGps}
                    gpsLoading={gpsLoading}
                    activeDrivers={activeDrivers}
                    allHospitals={allHospitals}
                />
            </div>

            <div className="flex-1 h-full relative">
                <MapComponent
                    ambulancePos={ambulancePos}
                    route={route}
                    signals={signals}
                    allHospitals={allHospitals}
                    targetHospital={targetHospital}
                    userLocation={userLocation}
                    center={[9.9816, 76.2999]}
                    isPickingLocation={isPickingLocation}
                    pickedLocation={pickedLocation}
                    setPickedLocation={setPickedLocation}
                    activeDrivers={activeDrivers}
                />
            </div>
        </div>
    );
}

function RootRedirect() {
    const { user } = useAuth();
    if (user?.role === 'admin') return <Navigate to="/admin" />;
    if (user?.role === 'hospital') return <Navigate to="/hospital" />;
    return <Navigate to="/dashboard" />;
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
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/hospital" element={
                        <ProtectedRoute>
                            <HospitalDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/" element={<RootRedirect />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
