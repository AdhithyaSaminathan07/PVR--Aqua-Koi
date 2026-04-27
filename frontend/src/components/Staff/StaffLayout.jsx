import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useWindowSize from '../../hooks/useWindowSize';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    CheckSquare,
    AlertCircle,
    MessageSquare,
    ShoppingCart,
    LogOut,
    Bell,
    Menu,
    X,
    User,
    ArrowLeft,
    ClipboardList
} from 'lucide-react';

const SidebarIcon = ({ icon: Icon, path, label, active, onClick, expanded, color }) => (
    <Link
        to={path}
        onClick={onClick}
        className="relative group flex items-center h-12 w-full px-5 mb-1 no-underline transition-colors duration-500"
    >
        <div
            className={`
                flex items-center h-12 w-12 shrink-0 justify-center rounded-xl transition-all duration-700
                ${active
                    ? 'shadow-sm'
                    : 'hover:bg-[#F8FAFC]'}
            `}
            style={{
                backgroundColor: active ? `${color}15` : 'transparent',
                color: active ? color : '#64748B'
            }}
        >
            <Icon
                size={20}
                strokeWidth={active ? 2.5 : 2}
                className="shrink-0 transition-colors duration-300"
                style={{ color: active ? color : '#64748B' }}
            />
        </div>

        <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                        className="flex items-center justify-between ml-4"
                    >
                        <span
                            className="text-[13px] font-semibold whitespace-nowrap transition-colors duration-300"
                            style={{ color: active ? '#0F172A' : '#64748B' }}
                        >
                            {label}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {active && (
            <motion.div
                layoutId="activeIndicator"
                className="absolute right-0 w-1.5 h-6 rounded-l-full"
                style={{ backgroundColor: color }}
            />
        )}
    </Link>
);

const StaffLayout = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const role = (localStorage.getItem('role') || '').toUpperCase();
    const { width } = useWindowSize();

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/staff/dashboard', color: '#3B82F6' },
        { icon: ClipboardList, label: 'Tasks', path: '/staff/tasks', color: '#6366F1' },
        { icon: CheckSquare, label: 'Attendance', path: '/staff/attendance', color: '#10B981' },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans relative">
            {/* Mobile Menu Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={false}
                animate={{
                    width: (isHovered || isMobileMenuOpen) ? 260 : 88,
                    x: isMobileMenuOpen ? 0 : (width < 1024 ? -260 : 0)
                }}
                transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                className={`fixed lg:relative bg-white flex flex-col items-center py-6 z-[70] border-r border-[#F1F5F9] h-full ${isMobileMenuOpen ? 'w-[260px]' : ''}`}
            >
                <div className="mb-10 w-full flex items-center justify-center">
                    <img src="/PVR.png" alt="PVR" className="w-12 h-12 object-contain" />
                </div>

                <div className="flex-1 w-full overflow-y-auto">
                    <div className="space-y-1">
                        {menuItems.map((item, idx) => (
                            <SidebarIcon
                                key={idx}
                                icon={item.icon}
                                path={item.path}
                                label={item.label}
                                color={item.color}
                                active={location.pathname === item.path}
                                expanded={isHovered || isMobileMenuOpen}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        ))}
                    </div>
                </div>

                <div className="w-full px-4 pt-4 border-t border-[#F8FAFC]">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full h-12 px-5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors font-bold text-sm">
                        <LogOut size={20} />
                        {(isHovered || isMobileMenuOpen) && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500 bg-gray-50 rounded-xl">
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Staff Portal</h2>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{role}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {['BOSS', 'MANAGER', 'ADMIN'].includes(role) && (
                            <button onClick={() => navigate('/boss-dashboard')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all">
                                <ArrowLeft size={16} />
                                <span>Exit to Boss</span>
                            </button>
                        )}
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm">
                            {role.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;
