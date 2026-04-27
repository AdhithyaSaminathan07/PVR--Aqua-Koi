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
        <div className="min-h-screen bg-[url('/koi.png')] bg-cover bg-center flex items-center justify-center md:justify-end p-4 md:pr-20 lg:pr-32 font-sans selection:bg-blue-100 overflow-hidden relative">
            {/* Minimalist Card with lightly sharp corners, positioned to the right */}
            <div className="w-full max-w-[400px] bg-white rounded-2xl p-10 md:p-14 shadow-2xl flex flex-col items-center z-10 transition-all duration-500">

                {/* Brand Logo - Styled like the 'Lovebirds' script */}
                <div className="mb-12">
                    <img src="/PVR.png" alt="PVR Logo" className="h-24 w-auto object-contain" />
                </div>

                {/* Welcome Text */}
                <h2 className="text-[#1a365d] text-xl font-bold mb-12 uppercase tracking-tight">Welcome to PVR Systems</h2>

                <form onSubmit={handleLogin} className="w-full space-y-10">
                    {/* Access ID - Underline Style */}
                    <div className="relative">
                        <label className="text-[10px] text-[#1a365d] font-bold absolute -top-5 left-0 uppercase tracking-widest">Users name or Email</label>
                        <input
                            type="text"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="w-full py-2 bg-transparent border-b border-[#EEEEEE] focus:border-[#1a365d] outline-none transition-all text-[#1a365d] text-lg font-medium placeholder:text-[#1a365d]/40"
                            placeholder="Manager ID"
                            required
                        />
                    </div>

                    {/* Password - Underline Style */}
                    <div className="relative">
                        <label className="text-[10px] text-[#1a365d] font-bold absolute -top-5 left-0 uppercase tracking-widest">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full py-2 bg-transparent border-b border-[#EEEEEE] focus:border-[#1a365d] outline-none transition-all text-[#1a365d] text-lg font-medium placeholder:text-[#1a365d]/40"
                            placeholder="********"
                            required
                        />
                        <div className="flex justify-end mt-2">
                            <button type="button" className="text-[10px] text-[#2988FF] hover:underline font-bold">Forgot password?</button>
                        </div>
                    </div>

                    {/* Sign In Button - Charcoal Rounded Style */}
                    <div className="pt-4 flex justify-center">
                        <button
                            type="submit"
                            className="w-full max-w-[200px] py-4 bg-[#1a365d] hover:bg-[#60A7FF] text-white font-bold rounded-xl transition-all text-lg shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-widest"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
