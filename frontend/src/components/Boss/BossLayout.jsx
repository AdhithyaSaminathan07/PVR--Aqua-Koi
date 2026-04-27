import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useWindowSize from '../../hooks/useWindowSize';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Package,
    MessageSquare,
    ShoppingCart,
    CheckSquare,
    Wrench,
    LogOut,
    Bell,
    Clock,
    Search,
    Menu,
    X,
    Droplets,
    Fish,
    Contact,
    FileText,
    CreditCard,
    Shield,
    BarChart3,
    Calendar,
    ChevronRight,
    Plus,
    Settings,
    Settings2,
    ShieldCheck
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
                style={{ color: active ? color : (expanded ? color : '#64748B') }}
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
                        {active && <ChevronRight size={14} style={{ color: color }} />}
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

const BossLayout = ({ role: initialRole, allocatedModules: initialModules }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const role = (initialRole || localStorage.getItem('role') || '').toUpperCase();
    const [searchQuery, setSearchQuery] = useState('');
    const { width } = useWindowSize();

    const [activeModule, setActiveModule] = useState(() => {
        if (location.pathname.includes('/koi')) return 'KOI';
        if (['/boss-dashboard', '/boss/users', '/boss/reports', '/boss/modules', '/boss/roles', '/boss/personnel'].includes(location.pathname)) return 'MASTER';
        return 'AQUA';
    });

    useEffect(() => {
        if (location.pathname.includes('/koi')) {
            setActiveModule('KOI');
        } else if (['/boss-dashboard', '/boss/users', '/boss/reports', '/boss/modules', '/boss/roles', '/boss/personnel', '/staff/dashboard', '/staff/attendance'].includes(location.pathname)) {
            setActiveModule('MASTER');
        } else if (location.pathname === '/' || location.pathname.startsWith('/boss/')) {
            if (!['/boss-dashboard', '/boss/users', '/boss/reports', '/boss/modules', '/boss/roles', '/boss/personnel'].includes(location.pathname)) {
                setActiveModule('AQUA');
            }
        }
        setIsMobileMenuOpen(false); // Close mobile menu on route change
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role');
        window.location.reload();
    };

    const modules = {
        MASTER: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/boss-dashboard', color: '#3B82F6' },
            { icon: ShieldCheck, label: 'Staff & Access', path: '/boss/personnel', color: '#A855F7' },
            { icon: CheckSquare, label: 'Staff Portal View', path: '/staff/dashboard', color: '#10B981' },
            { icon: Shield, label: 'Module Allocation', path: '/boss/modules', color: '#EF4444' },
            { icon: BarChart3, label: 'Reports', path: '/boss/reports', color: '#0EA5E9' },
        ],
        AQUA: [
            { icon: LayoutDashboard, label: 'Stats', path: '/boss/aqua/dashboard', color: '#3B82F6' },
            { icon: Clock, label: 'Attendance', path: '/boss/aqua/attendance', color: '#8B5CF6' },
            { icon: Contact, label: 'Employees', path: '/boss/employees', color: '#10B981' },
            { icon: Users, label: 'Customers', path: '/boss/customers', color: '#F59E0B' },
            { icon: Package, label: 'Inventory', path: '/boss/inventory', color: '#EC4899' },
            { icon: MessageSquare, label: 'Complaints', path: '/boss/complaints', color: '#F43F5E' },
            { icon: ShoppingCart, label: 'Orders', path: '/boss/orders', color: '#06B6D4' },
            { icon: CheckSquare, label: 'Tasks', path: '/boss/tasks', color: '#6366F1' },
            { icon: Wrench, label: 'Services', path: '/boss/services', color: '#84CC16' },
            { icon: FileText, label: 'Invoices', path: '/boss/invoices', color: '#14B8A6' },
            { icon: Settings, label: 'Settings', path: '/boss/aqua/settings', color: '#64748B' },
        ],
        KOI: [
            { icon: Fish, label: 'Dashboard', path: '/boss/koi/dashboard', color: '#F97316' },
            { icon: Clock, label: 'Attendance', path: '/boss/koi/attendance', color: '#8B5CF6' },
            { icon: Contact, label: 'Employees', path: '/boss/koi/employees', color: '#10B981' },
            { icon: MessageSquare, label: 'Enquiries', path: '/boss/koi/enquiries', color: '#F43F5E' },
            { icon: ShoppingCart, label: 'Sales', path: '/boss/koi/orders', color: '#06B6D4' },
            { icon: CreditCard, label: 'Payments', path: '/boss/koi/payments', color: '#F97316' },
            { icon: Package, label: 'Inventory', path: '/boss/koi/inventory', color: '#EC4899' },
            { icon: Users, label: 'Customers', path: '/boss/koi/customers', color: '#F59E0B' },
            { icon: FileText, label: 'Invoices', path: '/boss/koi/invoices', color: '#14B8A6' },
            { icon: Settings, label: 'Settings', path: '/boss/koi/settings', color: '#64748B' },
        ]

    };

    const currentItems = modules[activeModule];

    return (
        <div className="flex h-screen bg-[#F0F7FF] overflow-hidden font-sans relative">
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

            {/* Sidebar (Modern White Design) */}
            <motion.aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={false}
                animate={{
                    width: (isHovered || isMobileMenuOpen) ? 260 : 88,
                    x: isMobileMenuOpen ? 0 : (width < 1024 ? -260 : 0)
                }}
                transition={{ duration: 1.0, ease: [0.32, 0.72, 0, 1] }}
                className={`fixed lg:relative bg-white flex flex-col items-center py-6 z-[70] border-r border-[#F1F5F9] no-print h-full ${isMobileMenuOpen ? 'w-[260px]' : ''}`}
            >
                {/* Logo Section */}
                <div className="w-full flex flex-col items-center justify-center mb-10 h-auto overflow-hidden transition-all duration-300">
                    <Link to="/boss-dashboard" className="shrink-0 transition-transform duration-300 hover:scale-110 mb-2">
                        <img
                            src="/PVR.png"
                            alt="PVR"
                            className="w-14 h-14 object-contain"
                        />
                    </Link>
                    <AnimatePresence mode="wait">
                        {(isHovered || isMobileMenuOpen) && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                                className="flex flex-col items-center min-w-0"
                            >
                                <span
                                    className="font-black text-xl tracking-tighter truncate bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage: activeModule === 'MASTER'
                                            ? 'linear-gradient(to right, #ef4444, #991b1b)'
                                            : activeModule === 'AQUA'
                                                ? 'linear-gradient(to right, #3b82f6, #1d4ed8)'
                                                : 'linear-gradient(to right, #f97316, #c2410c)',
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                    }}
                                >
                                    PVR {activeModule === 'MASTER' ? 'BOSS' : activeModule}
                                </span>
                                <div
                                    className="h-1 w-12 rounded-full mt-1"
                                    style={{
                                        background: activeModule === 'MASTER'
                                            ? 'linear-gradient(to right, #ef4444, #991b1b)'
                                            : activeModule === 'AQUA'
                                                ? 'linear-gradient(to right, #3b82f6, #1d4ed8)'
                                                : 'linear-gradient(to right, #f97316, #c2410c)'
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 w-full overflow-y-auto custom-scrollbar no-print">
                    <div className="space-y-4">
                        <div>
                            {(isHovered || isMobileMenuOpen) && (
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] mb-4 px-8"
                                >
                                    {activeModule}
                                </motion.h3>
                            )}
                            <div className="flex flex-col">
                                {currentItems.map((item, idx) => (
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
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="w-full px-4 pt-4 mt-auto border-t border-[#F8FAFC]">
                    <div className={`flex items-center ${(isHovered || isMobileMenuOpen) ? 'px-2 gap-3' : 'justify-center'} h-16 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer relative group`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0 border-2 border-white ${activeModule === 'KOI' ? 'bg-[#F97316]' : 'bg-[#2988FF]'}`}>
                            {role?.charAt(0) || 'B'}
                        </div>
                        <AnimatePresence>
                            {(isHovered || isMobileMenuOpen) && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                                    className="flex-1 flex items-center justify-between overflow-hidden"
                                >
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-[#0F172A] font-bold text-[13px] leading-tight truncate">
                                            {role === 'BOSS' ? 'PVR Boss' : 'Admin'}
                                        </p>
                                        <p className="text-[#94A3B8] text-[11px] truncate">
                                            {role?.toLowerCase()}@pvr.systems
                                        </p>
                                    </div>
                                    <button onClick={handleLogout} title="Logout">
                                        <LogOut size={16} className="text-[#94A3B8] hover:text-[#F43F5E] transition-colors" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex bg-[#F0F7FF] relative overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white m-0 lg:m-4 lg:rounded-2xl shadow-xl shadow-blue-900/5 relative">
                    {/* Top Header */}
                    <header className="h-20 flex items-center px-4 md:px-8 lg:px-12 gap-4 no-print border-b border-gray-50">
                        {/* Mobile Menu Toggle (Left Side) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex-1 relative max-w-xl group hidden md:block">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors ${activeModule === 'KOI' ? 'group-focus-within:text-[#F97316]' : 'group-focus-within:text-[#2988FF]'}`} size={20} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className={`w-full bg-[#F5F9FC] border-none rounded-2xl py-3 pl-12 pr-6 transition-all text-sm font-medium ${activeModule === 'KOI' ? 'focus:ring-2 focus:ring-[#F97316]/50' : 'focus:ring-2 focus:ring-[#2988FF]/50'}`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Module Toggler (Moved to Header) */}
                        <div className="flex bg-[#F5F9FC] p-1 rounded-full shadow-inner border border-gray-100/50 scale-90 sm:scale-100">
                            {[
                                { id: 'MASTER', icon: Shield, label: 'Master', path: '/boss-dashboard' },
                                { id: 'AQUA', icon: Droplets, label: 'Aqua', path: '/boss/aqua/dashboard' },
                                { id: 'KOI', icon: Fish, label: 'Koi', path: '/boss/koi/dashboard' }
                            ].map((mod) => (
                                <button
                                    key={mod.id}
                                    onClick={() => { setActiveModule(mod.id); navigate(mod.path); }}
                                    className={`flex items-center gap-2 px-3 sm:px-6 py-2 rounded-full transition-all duration-300 ${activeModule === mod.id ? `bg-white shadow-sm ${activeModule === 'KOI' ? 'text-[#F97316]' : 'text-[#2988FF]'}` : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <mod.icon size={18} />
                                    <span className={`text-[10px] sm:text-xs font-bold ${activeModule === mod.id ? 'block' : 'hidden lg:block'}`}>{mod.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Profile Info */}
                        <div className="flex items-center gap-2 sm:gap-4 pl-4 border-l border-gray-100 ml-auto">
                            <div className="flex flex-col items-end hidden xs:flex">
                                <p className="text-xs lg:text-sm font-bold text-gray-900 leading-tight whitespace-nowrap">{role === 'BOSS' ? 'PVR Boss' : 'General Manager'}</p>
                                <p className="text-[10px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-widest">{role}</p>
                            </div>
                            <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white text-xs lg:text-sm font-bold shadow-sm shrink-0 ${activeModule === 'KOI' ? 'bg-[#F97316]' : 'bg-[#2988FF]'}`}>
                                {role?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Content */}
                    <main className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 lg:px-12 pb-8 sm:pb-12">
                        <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${activeModule === 'KOI' ? 'border-[#F97316]' : 'border-[#2988FF]'}`}></div></div>}>
                            <Outlet />
                        </React.Suspense>
                    </main>
                </div>
            </div>

            {/* Persistent Mobile Toggle Button (Right Side) */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`fixed top-1/2 right-0 -translate-y-1/2 text-white p-4 rounded-l-2xl shadow-2xl z-[100] lg:hidden active:scale-95 transition-all duration-300 flex items-center justify-center border-l border-t border-b border-white/20 no-print ${activeModule === 'KOI' ? 'bg-[#F97316]' : 'bg-[#2988FF]'}`}
            >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>
    );
};

export default BossLayout;
