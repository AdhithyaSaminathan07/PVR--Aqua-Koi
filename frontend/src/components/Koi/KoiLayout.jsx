import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    MessageSquare,
    ShoppingCart,
    CheckSquare,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    Fish,
    FileText,
    CreditCard
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => (
    <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
            : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'group-hover:text-orange-600'} />
        {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
);

const KoiLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const getAllocatedModules = () => {
        try {
            return JSON.parse(localStorage.getItem('allocatedModules') || '[]');
        } catch (e) {
            return [];
        }
    };

    const role = localStorage.getItem('role');
    const allocatedModules = getAllocatedModules();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/koi/dashboard' },
        { icon: MessageSquare, label: 'Enquiries', path: '/koi/enquiries' },
        { icon: ShoppingCart, label: 'Orders', path: '/koi/orders' },
        { icon: FileText, label: 'Invoices', path: '/koi/invoices' },
        { icon: CreditCard, label: 'Payments', path: '/koi/payments' },
        { icon: Package, label: 'Inventory', path: '/koi/inventory' },
        { icon: Users, label: 'Customers', path: '/koi/customers' },
    ].filter(item => {
        if (role === 'BOSS' || role === 'MANAGER' || role === 'KOI_MANAGER' || role === 'BRANCH_MANAGER') return true;
        return allocatedModules.includes(`Koi:${item.label}`);
    });

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role');
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside
                className={`${collapsed ? 'w-20' : 'w-72'
                    } bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out z-30`}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Fish size={24} />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900 font-display italic">KOI CENTRE</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">MANAGEMENT</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                            collapsed={collapsed}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                    >
                        <LogOut size={20} />
                        {!collapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-20">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                        {collapsed ? <Menu size={20} /> : <X size={20} />}
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-full w-96">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Koi database..."
                                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 relative transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="h-8 w-px bg-gray-200"></div>

                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-semibold text-gray-900 leading-none">{role === 'BOSS' ? 'Boss' : (role === 'MANAGER' ? 'Gen. Manager' : 'Officer')}</span>
                                    <span className="text-[11px] text-gray-400 font-medium">{role === 'STAFF' ? 'Koi Staff' : 'Management'}</span>
                                </div>
                                <div className="h-10 w-10 bg-gradient-to-tr from-orange-500 to-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
                                    {role === 'BOSS' ? 'B' : (role === 'MANAGER' ? 'G' : 'S')}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default KoiLayout;
