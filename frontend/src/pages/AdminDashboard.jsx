import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import * as adminService from '../services/adminService';
import { Users, Building2, CheckCircle, ShieldAlert, X, Edit2, Trash2, Plus, Loader, LogOut, MapPin, Ambulance, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('approvals');
    const [loading, setLoading] = useState(false);
    
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editType, setEditType] = useState(null); // 'user' or 'hospital'
    const [editData, setEditData] = useState(null);
    
    // Confirmation Modal State
    const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, id: null, title: '', message: '' });

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pendingRes, usersRes, hospitalsRes] = await Promise.all([
                adminService.getPendingUsers(),
                adminService.getAllUsers(),
                adminService.getAllHospitals()
            ]);
            setPendingUsers(pendingRes.data.users);
            setAllUsers(usersRes.data.users);
            setHospitals(hospitalsRes.data.hospitals);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (u) => {
        try {
            await adminService.approveUser(u._id);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteUser = (userId) => {
        if (userId === user?.id) {
            alert("Security Violation: You cannot delete your own administrative account while logged in.");
            return;
        }
        setConfirmState({
            isOpen: true,
            type: 'user',
            id: userId,
            title: 'Delete Driver Account',
            message: 'Are you sure you want to permanently remove this driver from the system? This action cannot be undone.'
        });
    };

    const handleDeleteHospital = (hospitalId) => {
        setConfirmState({
            isOpen: true,
            type: 'hospital',
            id: hospitalId,
            title: 'Decommission Hospital Unit',
            message: 'Are you sure you want to remove this hospital infrastructure from the live directory?'
        });
    };

    const executeDeletion = async () => {
        const { type, id } = confirmState;
        setConfirmState({ ...confirmState, isOpen: false });
        
        try {
            if (type === 'user') {
                await adminService.deleteUser(id);
            } else if (type === 'hospital') {
                await adminService.deleteHospital(id);
            }
            fetchData();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || `Failed to delete ${type}. Please check system logs.`;
            alert(msg);
        }
    };

    const openEditModal = (type, data = null) => {
        setEditType(type);
        setEditData(data ? { ...data } : { capabilities: [], icu_beds_available: 0 });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            if (editType === 'hospital') {
                if (editData._id || editData.id) {
                    await adminService.updateHospital(editData.id || editData._id, editData);
                } else {
                    await adminService.createHospital(editData);
                }
            } else if (editType === 'user') {
                await adminService.updateUser(editData._id, editData);
            }
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Save failed", error);
        }
    };

    function LocationPicker({ pos, setPos }) {
        useMapEvents({
            click(e) {
                setPos({ ...editData, lat: e.latlng.lat, lon: e.latlng.lng });
            },
        });
        return pos.lat ? <Marker position={[pos.lat, pos.lon]} /> : null;
    }

    const ICU_BED_OPTIONS = [
        { label: '0', value: 0 },
        { label: '1-5', value: 5 },
        { label: '6-10', value: 10 },
        { label: '11-20', value: 20 },
        { label: '21-50', value: 50 },
        { label: '50+', value: 100 }
    ];

    const CAPABILITY_OPTIONS = ["Trauma", "Cardiac", "Neurology", "Burn Unit", "Pediatric", "General"];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
            {/* Topbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest">System Control</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block border-r border-slate-200 pr-4 mr-2">
                        <p className="text-sm font-bold text-slate-800 leading-none">{user?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">Super Administrator</p>
                    </div>
                    <Link
                        to="/dashboard"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs transition border border-slate-200 shadow-sm"
                    >
                        <MapPin size={14} /> View Map
                    </Link>
                    <button 
                        onClick={logout}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition border border-slate-200 shadow-sm"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <main className="flex-1 px-6 py-8 max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-500">
                
                {/* Stats Summary (Added for flair) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Users size={60} />
                        </div>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Drivers</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-2">{allUsers.length}</h3>
                    </div>
                    <div className="glass-card p-6 flex flex-col justify-between overflow-hidden relative group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-emerald-600">
                            <Building2 size={60} />
                        </div>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Hospitals List</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-2">{hospitals.length}</h3>
                    </div>
                    <div className="glass-card p-6 flex flex-col justify-between overflow-hidden relative group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-orange-600">
                            <CheckCircle size={60} />
                        </div>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Pending Approvals</p>
                        <h3 className={`text-3xl font-black mt-2 ${pendingUsers.length > 0 ? 'text-orange-600' : 'text-slate-300'}`}>
                            {pendingUsers.length}
                        </h3>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="space-y-6">
                    <div className="flex gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 w-full sm:w-fit shadow-sm">
                        {[
                            { id: 'approvals', icon: <CheckCircle size={16}/>, label: 'Approvals' },
                            { id: 'users', icon: <Users size={16}/>, label: 'Drivers' },
                            { id: 'hospitals', icon: <Building2 size={16}/>, label: 'Hospitals' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center gap-2 flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            >
                                {tab.icon} {tab.label}
                                {tab.id === 'approvals' && pendingUsers.length > 0 && (
                                    <span className={`ml-1 w-2 h-2 rounded-full bg-orange-400 animate-ping`} />
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <Loader className="animate-spin text-emerald-500 mb-4" size={40} />
                            <p className="text-slate-400 font-bold text-sm">Syncing Data...</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            {/* Approvals Tab */}
                            {activeTab === 'approvals' && (
                                <div className="glass-card p-8 min-h-[400px]">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                                            <CheckCircle size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review Requests</h2>
                                    </div>
                                    
                                    {pendingUsers.length === 0 ? (
                                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                                <CheckCircle size={32} className="text-emerald-500" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800">Everything up to date!</h3>
                                            <p className="text-slate-400 text-sm mt-1">No pending driver registrations at the moment.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {pendingUsers.map(u => (
                                                <div key={u._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 p-6 rounded-2xl hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group">
                                                    <div className="flex gap-4 items-center mb-4 sm:mb-0">
                                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 font-bold group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-900 font-black text-lg leading-none">{u.name}</p>
                                                            <p className="text-slate-500 text-sm mt-1">{u.email} • <span className="text-blue-500 font-black text-[10px] uppercase tracking-widest">{u.role}</span></p>
                                                            <p className="text-slate-300 text-[10px] mt-1 font-bold">REQUESTED: {u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 w-full sm:w-auto">
                                                        <button 
                                                            onClick={() => handleApprove(u)}
                                                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-emerald-200 transition active:scale-95"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="flex-1 sm:flex-none bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 px-6 py-2.5 rounded-xl font-black text-sm transition active:scale-95"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div className="glass-card overflow-hidden">
                                     <div className="p-8 pb-4 flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                            <Users size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Driver Directory</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50/50 border-y border-slate-100 italic">
                                                <tr className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                                    <th className="px-8 py-4">Name</th>
                                                    <th className="px-8 py-4">Email Contact</th>
                                                    <th className="px-8 py-4">Status</th>
                                                    <th className="px-8 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {allUsers.map((u) => (
                                                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                                                                    {u.name.charAt(0)}
                                                                </div>
                                                                <span className="text-slate-900 font-bold">{u.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-slate-500 font-medium">{u.email}</td>
                                                        <td className="px-8 py-5">
                                                            {u.is_approved 
                                                                ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Approved
                                                                  </span>
                                                                : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Pending
                                                                  </span>
                                                            }
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <button 
                                                                    onClick={() => openEditModal('user', u)}
                                                                    className="p-2 rounded-lg hover:bg-emerald-50 text-slate-300 hover:text-emerald-600 transition-all active:scale-90"
                                                                    title="Edit Driver"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                        {u._id !== user?.id ? (
                                                                            <button 
                                                                                onClick={() => handleDeleteUser(u._id)} 
                                                                                className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all active:scale-90"
                                                                                title="Delete Driver"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        ) : (
                                                                            <div className="p-2 text-slate-200 cursor-not-allowed" title="Current Session (Protected)">
                                                                                <ShieldAlert size={16} />
                                                                            </div>
                                                                        )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Hospitals Tab */}
                            {activeTab === 'hospitals' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                                <Building2 size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Infrastructure</h2>
                                                <p className="text-slate-400 text-xs font-bold uppercase mt-0.5">{hospitals.length} Units Registered</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => openEditModal('hospital')}
                                            className="btn-primary"
                                        >
                                            <Plus size={18} /> Add Hospital
                                        </button>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
                                        {hospitals.map(h => (
                                            <div key={h.id || h._id} className="glass-card p-6 flex flex-col hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => openEditModal('hospital', h)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><Edit2 size={16}/></button>
                                                        <button onClick={() => handleDeleteHospital(h._id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{h.name}</h3>
                                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest italic">{h.specialization || "General Utility"}</p>
                                                
                                                <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                                                    {(h.capabilities || []).slice(0, 4).map(cap => (
                                                        <span key={cap} className="px-2 py-1 text-[10px] bg-slate-50 text-slate-500 rounded-lg border border-slate-100 font-bold uppercase">{cap}</span>
                                                    ))}
                                                    {(h.capabilities && h.capabilities.length > 4) && <span className="px-2 py-1 text-[10px] bg-white text-slate-400 rounded-lg border border-slate-100 font-bold">+{h.capabilities.length - 4}</span>}
                                                </div>

                                                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                                                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                                                        <Building2 size={10} />
                                                    </div>
                                                    ICU Beds: {h.icu_beds_available || 0}+
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal - Modern Light Theme */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl p-0 overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center text-slate-900">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
                                    {editType === 'hospital' ? <Building2 size={20} /> : <Users size={20} />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight">
                                        {editType === 'hospital' 
                                            ? (editData._id || editData.id ? 'Refine Hub Data' : 'Initialize New Hub')
                                            : 'Edit Driver Profile'
                                        }
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                        {editType === 'hospital' ? 'Hospital Infrastructure' : 'User Account Details'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition shadow-sm active:scale-95">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                                {editType === 'hospital' ? (
                                    <>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Hospital Identity</label>
                                                    <input 
                                                        required
                                                        placeholder="Unit Name (e.g. City Central)"
                                                        className="premium-input" 
                                                        value={editData.name || ''} 
                                                        onChange={e => setEditData({...editData, name: e.target.value})} 
                                                    />
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Lat Axis</label>
                                                        <input 
                                                            type="number" step="any" required
                                                            className="premium-input font-mono text-xs" 
                                                            value={editData.lat || ''} 
                                                            onChange={e => setEditData({...editData, lat: parseFloat(e.target.value)})} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Lon Axis</label>
                                                        <input 
                                                            type="number" step="any" required
                                                            className="premium-input font-mono text-xs" 
                                                            value={editData.lon || ''} 
                                                            onChange={e => setEditData({...editData, lon: parseFloat(e.target.value)})} 
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">ICU Capacity Range</label>
                                                    <select 
                                                        className="premium-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                                                        value={editData.icu_beds_available || 0}
                                                        onChange={e => setEditData({...editData, icu_beds_available: parseInt(e.target.value)})}
                                                    >
                                                        {ICU_BED_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label} Beds Available</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Specialization</label>
                                                    <input 
                                                        placeholder="e.g. Multi-Specialty, Referral Hub"
                                                        className="premium-input" 
                                                        value={editData.specialization || ''} 
                                                        onChange={e => setEditData({...editData, specialization: e.target.value})} 
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                                    <span>Spatial Pinning</span>
                                                    <span className="text-[10px] lowercase italic font-medium">Click map to drop pin</span>
                                                </label>
                                                <div className="flex-1 min-h-[250px] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                                                    <MapContainer center={[9.9816, 76.2999]} zoom={12} style={{ height: '100%', width: '100%' }}>
                                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                        <LocationPicker pos={editData} setPos={setEditData} />
                                                    </MapContainer>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Service Capabilities</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {CAPABILITY_OPTIONS.map(cap => (
                                                    <label key={cap} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                                        (editData.capabilities || []).includes(cap) 
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                                                        : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                                                    }`}>
                                                        <input 
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={(editData.capabilities || []).includes(cap)}
                                                            onChange={e => {
                                                                const caps = [...(editData.capabilities || [])];
                                                                if (e.target.checked) caps.push(cap);
                                                                else {
                                                                    const idx = caps.indexOf(cap);
                                                                    if (idx > -1) caps.splice(idx, 1);
                                                                }
                                                                setEditData({...editData, capabilities: caps});
                                                            }}
                                                        />
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                                            (editData.capabilities || []).includes(cap) 
                                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                            : 'bg-white border-slate-200'
                                                        }`}>
                                                            {(editData.capabilities || []).includes(cap) && <CheckCircle size={12} />}
                                                        </div>
                                                        <span className="text-xs font-bold uppercase tracking-tight">{cap}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6 max-w-md mx-auto">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Driver Name</label>
                                            <input 
                                                required
                                                placeholder="Full Name"
                                                className="premium-input" 
                                                value={editData.name || ''} 
                                                onChange={e => setEditData({...editData, name: e.target.value})} 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                            <input 
                                                required
                                                type="email"
                                                placeholder="driver@example.com"
                                                className="premium-input" 
                                                value={editData.email || ''} 
                                                onChange={e => setEditData({...editData, email: e.target.value})} 
                                            />
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 italic text-blue-700 text-[11px] font-bold">
                                            <AlertCircle size={16} className="shrink-0" />
                                            <span>Note: Changing a driver's email will affect their login credentials. Please ensure the driver is notified of this update.</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-50">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditModalOpen(false)} 
                                        className="px-6 py-2.5 text-sm font-black text-slate-400 hover:text-slate-600 transition"
                                    >
                                        Discard Changes
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-primary"
                                    >
                                        {editType === 'hospital' ? 'Sync Infrastructure' : 'Update Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Confirmation Modal */}
            {confirmState.isOpen && (
                <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 mx-auto shadow-inner">
                            <ShieldAlert size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 text-center mb-2 tracking-tight">
                            {confirmState.title}
                        </h2>
                        <p className="text-slate-500 text-center text-sm font-medium leading-relaxed mb-8">
                            {confirmState.message}
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setConfirmState({ ...confirmState, isOpen: false })}
                                className="flex-1 px-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-sm transition border border-slate-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={executeDeletion}
                                className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition shadow-lg shadow-red-200 active:scale-95"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
