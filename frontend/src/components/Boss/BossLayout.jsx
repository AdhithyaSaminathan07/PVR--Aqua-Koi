import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
    Plus
} from 'lucide-react';

const SidebarIcon = ({ icon: Icon, path, label, active, onClick, expanded }) => (
    <Link
        to={path}
        onClick={onClick}
        className={`relative group flex items-center ${expanded ? 'justify-start px-4 gap-4 w-[90%]' : 'justify-center w-12'} h-12 rounded-2xl transition-all duration-300 ${active
            ? 'bg-white text-[#2988FF] shadow-lg'
            : 'text-white hover:bg-white/10'} border-transparent`}
    >
        <Icon size={24} strokeWidth={2} className="shrink-0" />
        <AnimatePresence>
            {expanded && (
                <motion.span
                    initial={{ opacity: 0, width: 0, x: -10 }}
                    animate={{ opacity: 1, width: 'auto', x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-bold whitespace-nowrap overflow-hidden"
                >
                    {label}
                </motion.span>
            )}
        </AnimatePresence>
        {active && !expanded && (
            <motion.div
                layoutId="activeSide"
                className="absolute -right-4 w-1.5 h-8 bg-white rounded-l-full"
            />
        )}
    </Link>
);

const BossLayout = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const [searchQuery, setSearchQuery] = useState('');

    const [activeModule, setActiveModule] = useState(() => {
        if (location.pathname.includes('/koi')) return 'KOI';
        if (['/boss-dashboard', '/boss/users', '/boss/reports'].includes(location.pathname)) return 'MASTER';
        return 'AQUA';
    });

    useEffect(() => {
        if (location.pathname.includes('/koi')) {
            setActiveModule('KOI');
        } else if (['/boss-dashboard', '/boss/users', '/boss/reports'].includes(location.pathname)) {
            setActiveModule('MASTER');
        } else if (location.pathname === '/' || location.pathname.startsWith('/boss/')) {
            if (!['/boss/users', '/boss/reports'].includes(location.pathname)) {
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
            { icon: Shield, label: 'Dashboard', path: '/boss-dashboard' },
            { icon: Users, label: 'Users', path: '/boss/users' },
            { icon: BarChart3, label: 'Reports', path: '/boss/reports' },
        ],
        AQUA: [
            { icon: LayoutDashboard, label: 'Stats', path: '/aqua-dashboard' },
            { icon: Users, label: 'Customers', path: '/boss/customers' },
            { icon: Package, label: 'Inventory', path: '/boss/inventory' },
            { icon: MessageSquare, label: 'Complaints', path: '/boss/complaints' },
            { icon: ShoppingCart, label: 'Orders', path: '/boss/orders' },
            { icon: CheckSquare, label: 'Tasks', path: '/boss/tasks' },
            { icon: Wrench, label: 'Services', path: '/boss/services' },
            { icon: Contact, label: 'Employees', path: '/boss/employees' },
            { icon: FileText, label: 'Invoices', path: '/boss/invoices' },
        ],
        KOI: [
            { icon: Fish, label: 'Dashboard', path: '/boss/koi/dashboard' },
            { icon: MessageSquare, label: 'Enquiries', path: '/boss/koi/enquiries' },
            { icon: ShoppingCart, label: 'Sales', path: '/boss/koi/orders' },
            { icon: CreditCard, label: 'Payments', path: '/boss/koi/payments' },
            { icon: Package, label: 'Inventory', path: '/boss/koi/inventory' },
            { icon: Users, label: 'Customers', path: '/boss/koi/customers' },
            { icon: FileText, label: 'Invoices', path: '/boss/koi/invoices' },
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

            {/* Sidebar (Expandable Blue Bar) */}
            <motion.aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={false}
                animate={{
                    width: (isHovered || isMobileMenuOpen) ? 240 : 96,
                    x: isMobileMenuOpen ? 0 : (window.innerWidth < 1024 ? -240 : 0)
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`fixed lg:relative bg-[#2988FF] flex flex-col items-center py-8 gap-8 z-[70] shadow-2xl no-print h-full ${isMobileMenuOpen ? 'w-[240px]' : ''}`}
            >
                <motion.div
                    layout
                    className="flex flex-col items-center gap-4 transition-all duration-300 relative group"
                >
                    <div className={`
                        ${(isHovered || isMobileMenuOpen) ? 'w-24 h-24' : 'w-16 h-16'} 
                        bg-white rounded-full p-3 flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 relative
                    `}>
                        <div className="logo-gradient-ring"></div>
                        <img src="/PVR.png" alt="PVR" className="w-full h-full object-contain relative z-10" />
                    </div>

                    <AnimatePresence>
                        {(isHovered || isMobileMenuOpen) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center"
                            >
                                <span className="text-white font-black tracking-[0.2em] text-lg uppercase text-center">
                                    {activeModule === 'MASTER' ? 'BOSS' : activeModule}
                                </span>
                                <span className="text-white text-[10px] font-bold tracking-[0.3em] uppercase">
                                    Panel
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>


                <div className="flex-1 flex flex-col items-center gap-2 w-full overflow-y-auto custom-scrollbar px-2">
                    {currentItems.map((item, idx) => (
                        <SidebarIcon
                            key={idx}
                            icon={item.icon}
                            path={item.path}
                            label={item.label}
                            active={location.pathname === item.path}
                            expanded={isHovered || isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    ))}
                </div>

                <button
                    onClick={handleLogout}
                    className={`flex items-center ${(isHovered || isMobileMenuOpen) ? 'justify-start px-6 gap-4 w-[85%]' : 'justify-center w-12'} h-12 rounded-2xl text-white hover:bg-white/10 transition-all mb-4`}
                >
                    <LogOut size={24} className="shrink-0" />
                    <AnimatePresence>
                        {(isHovered || isMobileMenuOpen) && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-sm font-bold overflow-hidden"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </motion.aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex bg-[#F0F7FF] relative overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white m-0 lg:m-4 lg:rounded-[3rem] shadow-xl shadow-blue-900/5 relative">
                    {/* Top Header */}
                    <header className="h-20 flex items-center px-4 lg:px-12 gap-4 lg:gap-8 no-print border-b border-gray-50">
                        <div className="flex-1 relative max-w-xl group hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2988FF] transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full bg-[#F5F9FC] border-none rounded-2xl py-3 pl-12 pr-6 focus:ring-2 focus:ring-[#2988FF]/50 transition-all text-sm font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Module Toggler (Moved to Header) */}
                        <div className="flex bg-[#F5F9FC] p-1 rounded-full shadow-inner border border-gray-100/50 scale-90 sm:scale-100">
                            {[
                                { id: 'MASTER', icon: Shield, label: 'Master', path: '/boss-dashboard' },
                                { id: 'AQUA', icon: Droplets, label: 'Aqua', path: '/aqua-dashboard' },
                                { id: 'KOI', icon: Fish, label: 'Koi', path: '/boss/koi/dashboard' }
                            ].map((mod) => (
                                <button
                                    key={mod.id}
                                    onClick={() => { setActiveModule(mod.id); navigate(mod.path); }}
                                    className={`flex items-center gap-2 px-3 sm:px-6 py-2 rounded-full transition-all duration-300 ${activeModule === mod.id ? 'bg-white text-[#2988FF] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <mod.icon size={18} />
                                    <span className={`text-[10px] sm:text-xs font-bold ${activeModule === mod.id ? 'block' : 'hidden lg:block'}`}>{mod.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Profile Info */}
                        <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 border-l border-gray-100 ml-auto">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <p className="text-xs lg:text-sm font-bold text-gray-900 leading-tight whitespace-nowrap">{role === 'BOSS' ? 'PVR Boss' : 'General Manager'}</p>
                                <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-widest">{role}</p>
                            </div>
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#2988FF] flex items-center justify-center text-white text-xs lg:text-sm font-bold shadow-sm shrink-0">
                                {role?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Content */}
                    <main className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 lg:px-12 pb-8 sm:pb-12">
                        <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2988FF]"></div></div>}>
                            <Outlet />
                        </React.Suspense>
                    </main>
                </div>
            </div>

            {/* Persistent Mobile Toggle Button (Right Side) */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="fixed top-1/2 right-0 -translate-y-1/2 bg-[#2988FF] text-white p-4 rounded-l-2xl shadow-2xl z-[100] lg:hidden active:scale-95 transition-all duration-300 flex items-center justify-center border-l border-t border-b border-white/20 no-print"
            >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>
    );
};

export default BossLayout;
