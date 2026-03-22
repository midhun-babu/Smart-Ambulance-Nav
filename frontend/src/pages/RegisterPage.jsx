import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, UserCheck, ShieldPlus, Ambulance, Hospital as HospitalIcon } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        role: 'driver',
        password: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 border-t-4 border-emerald-600">
            <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-emerald-600/20 rounded-xl border border-emerald-500/30">
                            <ShieldPlus className="w-10 h-10 text-emerald-500" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-white mb-2">Create Account</h2>
                    <p className="text-slate-400 text-center mb-8 font-sans">Join the emergency navigation network</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm font-sans">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 mb-4 font-sans">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'hospital' })}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${formData.role === 'hospital'
                                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'
                                    }`}
                            >
                                <HospitalIcon className="w-5 h-5" />
                                <span className="text-sm font-bold">Hospital</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'driver' })}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${formData.role === 'driver'
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'
                                    }`}
                            >
                                <Ambulance className="w-5 h-5" />
                                <span className="text-sm font-bold">Driver</span>
                            </button>
                        </div>

                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full ${formData.role === 'hospital' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'} text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-6`}
                        >
                            <UserPlus className="w-5 h-5" />
                            Create {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Account
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-sans">
                            Already have an account?{' '}
                            <Link to="/login" className="text-slate-300 font-bold hover:text-white transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
