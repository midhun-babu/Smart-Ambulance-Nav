import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, ShieldAlert, Users, LogOut } from 'lucide-react';
import * as ambulanceService from '../services/ambulanceService';

export default function HospitalDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeDrivers, setActiveDrivers] = useState([]);
    
    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const res = await ambulanceService.getActiveDrivers();
                if (res.data?.drivers) {
                    setActiveDrivers(res.data.drivers);
                }
            } catch (error) {
                console.error("Error fetching drivers", error);
            }
        };
        fetchDrivers();
        const interval = setInterval(fetchDrivers, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
                        {user?.name?.charAt(0) || 'H'}
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 leading-tight">{user?.name || 'Hospital Dashboard'}</h1>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Hospital Portal</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-500 font-semibold text-sm">Active Ambulances</h3>
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800">{activeDrivers.length}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-500 font-semibold text-sm">Incoming Patients</h3>
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                <Users className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-500 font-semibold text-sm">Est. Wait Time</h3>
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800">0m</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-500 font-semibold text-sm">Emergency Alerts</h3>
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                <ShieldAlert className="w-4 h-4 text-red-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800">0</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">Nearby Ambulances</h2>
                    </div>
                    {activeDrivers.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-500 font-medium">No active ambulances currently registered in the network.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeDrivers.map((driver) => (
                                        <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-800">{driver.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{driver.phone || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    driver.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {driver.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
