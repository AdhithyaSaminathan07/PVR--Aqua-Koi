import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = ({ onLogin }) => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await login({ email: loginId, password });
            const { token, user } = response.data;
            const originalRole = response.data.role || 'STAFF';
            const role = originalRole.toUpperCase();

            // For internal logic, normalize key by removing spaces/underscores
            const roleKey = role.trim().replace(/[\s_]/g, '');

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('isAuthenticated', 'true');
            if (user?.allocatedModules) {
                localStorage.setItem('allocatedModules', JSON.stringify(user.allocatedModules));
            } else {
                localStorage.setItem('allocatedModules', JSON.stringify([]));
            }

            if (onLogin) onLogin(role, user?.allocatedModules || []);

            if (role === 'BOSS') {
                navigate('/boss-dashboard');
            } else if (roleKey.includes('KOI')) {
                navigate('/koi/dashboard');
            } else if (roleKey.includes('AQUA') || roleKey === 'ADMIN') {
                navigate('/aqua');
            } else if (roleKey === 'STAFF') {
                navigate('/staff/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert(err.response?.data?.message || 'Invalid credentials or server error');
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4 md:p-10 font-sans selection:bg-orange-100 overflow-hidden relative">
            {/* Main Split Card */}
            <div className="w-full max-w-[1100px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-500 min-h-[600px]">
                
                {/* Left Section - Image & Welcome */}
                <div className="w-full md:w-[45%] bg-[#FDF0D5] p-10 md:p-14 flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#EAA83A]/10 blur-xl"></div>
                    <div className="absolute bottom-20 right-10 w-20 h-20 rounded-full bg-[#EAA83A]/20"></div>
                    <div className="absolute top-1/3 left-10 w-6 h-6 rounded-full bg-white shadow-md"></div>
                    <div className="absolute top-1/4 right-20 w-4 h-4 rounded-full bg-[#EAA83A]/30"></div>

                    <div className="relative z-10">
                        <h2 className="text-[#2D3748] text-3xl md:text-4xl font-extrabold tracking-tight">Welcome to PVR</h2>
                        <p className="text-[#718096] text-sm mt-3 font-medium">For better experience with your systems!</p>
                    </div>

                    {/* Local Koi Fish Image */}
                    <div className="relative z-10 flex-grow flex items-center justify-center my-8">
                        <img 
                            src="/koi%20fish.avif" 
                            alt="Beautiful Koi Fish" 
                            className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover shadow-2xl border-4 border-white mx-auto transform hover:scale-105 transition-transform duration-500" 
                        />
                    </div>

                    <div className="relative z-10 text-xs text-[#A0AEC0] font-medium">
                        PVR Koi & Aqua Management System
                    </div>
                </div>

                {/* Right Section - Form */}
                <div className="w-full md:w-[55%] p-10 md:p-14 flex flex-col justify-center bg-white relative">
                    {/* Top Bar with Logo */}
                    <div className="absolute top-8 right-10 flex items-center gap-2">
                        <img src="/PVR.png" alt="PVR Logo" className="h-8 w-auto object-contain" />
                    </div>

                    <div className="max-w-[420px] w-full mx-auto">
                        <h1 className="text-[#2D3748] text-3xl font-bold mb-2">Sign In</h1>
                        <p className="text-[#A0AEC0] text-sm mb-10">Enter your credentials to continue.</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* User name or Email */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    className="w-full px-6 py-4 bg-[#F7F8FA] rounded-2xl outline-none border border-transparent focus:border-[#EAA83A] focus:bg-white text-[#2D3748] text-base font-medium placeholder-[#A0AEC0] transition-all"
                                    placeholder="User name or Email"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-6 py-4 bg-[#F7F8FA] rounded-2xl outline-none border border-transparent focus:border-[#EAA83A] focus:bg-white text-[#2D3748] text-base font-medium placeholder-[#A0AEC0] transition-all"
                                    placeholder="Password"
                                    required
                                />
                                <div className="flex justify-end mt-2">
                                    <button type="button" className="text-xs text-[#EAA83A] hover:underline font-semibold">Forgot password?</button>
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-[#EAA83A] hover:bg-[#D9962B] text-white font-bold rounded-2xl transition-all text-base shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>Let's Get Started!</span>
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center my-6">
                                <div className="flex-grow border-t border-[#EDF2F7]"></div>
                                <span className="px-4 text-xs text-[#A0AEC0] font-semibold uppercase tracking-wider">Authentication</span>
                                <div className="flex-grow border-t border-[#EDF2F7]"></div>
                            </div>

                            {/* Info Box */}
                            <div className="text-center text-xs text-[#718096] bg-[#FFF9F2] p-4 rounded-xl border border-[#FDF0D5]">
                                Secure login for authorized personnel only.
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
