import React, { useState } from 'react';
import { Droplets, Mail, Lock, ArrowRight, ShieldCheck, Users, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = ({ onLogin }) => {
        const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Hardcoded credentials as requested by user
        if (loginId === 'Aqua' && password === 'Aqua@1234') {
            localStorage.setItem('isAuthenticated', 'true');
            if (onLogin) onLogin();
            navigate('/');
        } else {
            alert('Invalid credentials. Hint: use Aqua / Aqua@1234');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-sans relative overflow-hidden">
            {/* Decorative Orbs */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-aqua-100/50 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
                <div className="glass-card p-10 rounded-[2rem]">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-primary-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary-200 mb-6 rotate-3">
                            <Droplets size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 font-display uppercase tracking-tighter">AQUA MANAGER LOGIN</h1>
                        <p className="text-gray-400 font-medium mt-2 italic">Access the Management System</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 italic">Admin ID</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 shadow-sm"
                                    placeholder="admin"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 italic">Security Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 shadow-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded-md border-gray-200 text-primary-600 focus:ring-primary-500" />
                                <span className="text-xs font-bold text-gray-400 uppercase italic">Remember Device</span>
                            </div>
                            <a href="#" className="text-xs font-bold text-primary-600 uppercase italic hover:underline">Forgot Access?</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 group hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 duration-200"
                        >
                            <span>ENTER WORKSPACE</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-10 flex items-center justify-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] italic">
                        <ShieldCheck size={14} />
                        <span>Secure Enterprise Access</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
