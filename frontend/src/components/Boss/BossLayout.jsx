import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
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
    BarChart3
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed, colorClass }) => (
    <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${active
            ? `${colorClass} text-white shadow-lg`
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
    >
        <Icon size={18} className={active ? 'text-white' : 'group-hover:text-gray-900'} />
        {!collapsed && <span className="font-medium text-sm">{label}</span>}
    </Link>
);

const BossLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const role = localStorage.getItem('role');

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
            // Check if it's an aqua path (excluding users/reports which are MASTER)
            if (!['/boss/users', '/boss/reports'].includes(location.pathname)) {
                setActiveModule('AQUA');
            }
        }
    }, [location.pathname]);

    const sections = [
        {
            id: 'MASTER',
            title: 'Master Control',
            items: [
                { icon: Shield, label: 'Boss Dashboard', path: '/boss-dashboard', color: 'bg-indigo-600' },
                { icon: Users, label: 'User Management', path: '/boss/users', color: 'bg-indigo-600' },
                { icon: BarChart3, label: 'Global Reports', path: '/boss/reports', color: 'bg-indigo-600' },
            ]
        },
        {
            id: 'AQUA',
            title: 'Aqua Management',
            items: [
                { icon: LayoutDashboard, label: 'Aqua Stats', path: '/aqua-dashboard', color: 'bg-primary-600' },
                { icon: Users, label: 'Customers', path: '/boss/customers', color: 'bg-primary-600' },
                { icon: Package, label: 'Inventory', path: '/boss/inventory', color: 'bg-primary-600' },
                { icon: MessageSquare, label: 'Complaints', path: '/boss/complaints', color: 'bg-primary-600' },
                { icon: ShoppingCart, label: 'Orders', path: '/boss/orders', color: 'bg-primary-600' },
                { icon: CheckSquare, label: 'Tasks', path: '/boss/tasks', color: 'bg-primary-600' },
                { icon: Wrench, label: 'Services', path: '/boss/services', color: 'bg-primary-600' },
                { icon: Contact, label: 'Employees', path: '/boss/employees', color: 'bg-primary-600' },
                { icon: FileText, label: 'Invoices', path: '/boss/invoices', color: 'bg-primary-600' },
            ]
        },
        {
            id: 'KOI',
            title: 'Koi Centre',
            items: [
                { icon: Fish, label: 'Koi Dashboard', path: '/boss/koi/dashboard', color: 'bg-orange-600' },
                { icon: MessageSquare, label: 'Enquiries', path: '/boss/koi/enquiries', color: 'bg-orange-600' },
                { icon: ShoppingCart, label: 'Koi Orders', path: '/boss/koi/orders', color: 'bg-orange-600' },
                { icon: FileText, label: 'Invoices', path: '/boss/koi/invoices', color: 'bg-orange-600' },
                { icon: CreditCard, label: 'Payments', path: '/boss/koi/payments', color: 'bg-orange-600' },
                { icon: Package, label: 'Inventory', path: '/boss/koi/inventory', color: 'bg-orange-600' },
                { icon: Users, label: 'Customers', path: '/boss/koi/customers', color: 'bg-orange-600' },
            ]
        }
    ];

    const filteredSections = sections.filter(section => section.id === activeModule);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role');
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out z-30`}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Shield size={24} />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900 italic">{role === 'BOSS' ? 'BOSS PANEL' : 'GM PANEL'}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{role === 'BOSS' ? 'SUPER ADMIN' : 'GENERAL MANAGER'}</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto custom-scrollbar">
                    {filteredSections.map((section, idx) => (
                        <div key={idx} className="space-y-2">
                            {!collapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-4">{section.title}</p>}
                            {section.items.map((item) => (
                                <SidebarItem
                                    key={item.path}
                                    {...item}
                                    colorClass={item.color}
                                    active={location.pathname === item.path}
                                    collapsed={collapsed}
                                />
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200">
                        <LogOut size={20} />
                        {!collapsed && <span className="font-medium">Logout System</span>}
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-20">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            {collapsed ? <Menu size={20} /> : <X size={20} />}
                        </button>

                        <div className="hidden md:flex items-center gap-2 bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
                            <button
                                onClick={() => setActiveModule('MASTER')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${activeModule === 'MASTER'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <Shield size={16} />
                                <span className="font-bold text-xs">MASTER</span>
                            </button>
                            <button
                                onClick={() => setActiveModule('AQUA')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${activeModule === 'AQUA'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <Droplets size={16} />
                                <span className="font-bold text-xs">AQUA</span>
                            </button>
                            <button
                                onClick={() => setActiveModule('KOI')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${activeModule === 'KOI'
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <Fish size={16} />
                                <span className="font-bold text-xs">KOI</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900 leading-none">{role === 'BOSS' ? 'The Boss' : 'General Manager'}</span>
                            <span className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider">{role === 'BOSS' ? 'Master MD' : 'Assoc. MD'}</span>
                        </div>
                        <div className="h-10 w-10 bg-indigo-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold">{role === 'BOSS' ? 'B' : 'G'}</div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BossLayout;
