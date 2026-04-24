import React, { useState } from 'react';
import { Users, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = ({ onLogin }) => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await login({ email: loginId, password });
            const { token, role, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('isAuthenticated', 'true');
            if (user?.allocatedModules) {
                localStorage.setItem('allocatedModules', JSON.stringify(user.allocatedModules));
            } else {
                localStorage.setItem('allocatedModules', JSON.stringify([]));
            }

            if (onLogin) onLogin(role, user?.allocatedModules || []);

            // Role-based redirection
            if (role === 'BOSS') {
                navigate('/boss-dashboard');
            } else if (role === 'KOI_MANAGER') {
                navigate('/koi/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert(err.response?.data?.message || 'Invalid credentials or server error');
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4 font-sans selection:bg-blue-100 italic-none overflow-hidden">
            {/* Main Rounded Container - Responsive Adjustments */}
            <div className="w-full max-w-6xl h-fit md:h-[650px] bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-[0_50px_100px_rgba(41,136,255,0.1)] overflow-hidden flex flex-col md:flex-row relative mx-auto">

                {/* Left Side: Video (Full Display) - Hidden on small screens for better responsiveness */}
                <div className="hidden md:flex md:w-[45%] bg-[#A5B4FC] relative overflow-hidden">
                    {/* Video Background */}
                    <div className="absolute inset-0 z-0">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <source src="/koi.mp4" type="video/mp4" />
                        </video>
                        {/* Soft brand-aligned overlay */}
                        <div className="absolute inset-0 bg-[#A5B4FC]/20 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#A5B4FC]/30 via-transparent to-transparent"></div>
                    </div>
                </div>

                {/* Right Side: Login Form - Centered on Mobile, Curved on Desktop */}
                <div className="flex-1 bg-white relative p-6 md:p-14 lg:p-16 flex flex-col justify-center items-center md:-ml-24 md:rounded-l-[5rem] z-20 shadow-[-40px_0_80px_rgba(0,0,0,0.03)] border-l border-white/5 overflow-hidden">
                    <div className="max-w-md w-full">
                        {/* PVR Logo - Centered Focal Point */}
                        <div className="flex justify-center mb-12 transition-all duration-500 hover:scale-105 select-none pt-4">
                            <img src="/PVR.png" alt="PVR Logo" className="h-32 md:h-40 w-auto object-contain drop-shadow-2xl" />
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Manager Access ID</label>
                                <div className="relative group">
                                    <Users className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A5B4FC] transition-colors" size={22} />
                                    <input
                                        type="text"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                        className="w-full pl-14 md:pl-16 pr-6 py-4 md:py-5.5 bg-gray-50/50 border-2 border-transparent rounded-[1.5rem] md:rounded-[2rem] focus:border-[#A5B4FC]/30 focus:bg-white outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-300 text-base md:text-lg shadow-inner"
                                        placeholder="Enter your ID"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A5B4FC] transition-colors" size={22} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-14 md:pl-16 pr-14 md:pr-16 py-4 md:py-5.5 bg-gray-50/50 border-2 border-transparent rounded-[1.5rem] md:rounded-[2rem] focus:border-[#A5B4FC]/30 focus:bg-white outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-300 text-base md:text-lg shadow-inner"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#A5B4FC] transition-colors p-2"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 md:py-6 bg-[#A5B4FC] hover:bg-[#91A1FA] text-white font-black rounded-[1.5rem] md:rounded-[2rem] transition-all shadow-xl hover:shadow-[#A5B4FC]/30 active:scale-[0.98] mt-4 md:mt-6 flex items-center justify-center gap-3 md:gap-4 text-base md:text-xl tracking-tight"
                            >
                                Sign In
                                <ArrowRight size={22} />
                            </button>
                        </form>

                        <div className="mt-10 md:mt-12 text-center border-t border-gray-100 pt-6 md:pt-8">
                            <p className="text-[9px] md:text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">
                                Powered & Secured by <span className="text-gray-900">PVR Systems India</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Atmosphere */}
            <div className="fixed top-[-15%] right-[-5%] w-[50%] h-[50%] bg-[#A5B4FC]/10 rounded-full blur-[160px] -z-10"></div>
            <div className="fixed bottom-[-15%] left-[-5%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[160px] -z-10"></div>
        </div>
    );
};

export default Login;
