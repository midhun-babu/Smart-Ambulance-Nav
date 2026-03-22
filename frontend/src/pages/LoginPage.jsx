import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ShieldCheck, Ambulance, Hospital as HospitalIcon } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans border-t-4 border-blue-600">
            <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                            <ShieldCheck className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400 text-center mb-8">Access the Intelligent Ambulance Network</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">Don't have an account?</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <Link to="/register" className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all border border-slate-700 hover:border-slate-500 group">
                                <HospitalIcon className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs text-slate-300 font-medium font-sans">Hospital</span>
                            </Link>
                            <Link to="/register" className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all border border-slate-700 hover:border-slate-500 group">
                                <Ambulance className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs text-slate-300 font-medium font-sans">Driver</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
