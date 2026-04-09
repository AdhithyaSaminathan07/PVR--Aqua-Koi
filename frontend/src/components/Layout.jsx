import React, { useState } from 'react';
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
    Contact,
    FileText
} from 'lucide-react';



const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => (
    <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
            : 'text-gray-500 hover:bg-primary-50 hover:text-primary-600'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'group-hover:text-primary-600'} />
        {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
);

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Customers', path: '/customers' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: MessageSquare, label: 'Complaints', path: '/complaints' },
        { icon: ShoppingCart, label: 'Enquiry & Orders', path: '/orders' },
        { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
        { icon: Wrench, label: 'Services', path: '/services' },
        { icon: Contact, label: 'Employees', path: '/employees' },
        { icon: FileText, label: 'Invoices', path: '/invoices' },
    ];





    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside
                className={`${collapsed ? 'w-20' : 'w-72'
                    } bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out z-30`}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Droplets size={24} />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900 font-display italic">AQUA MANAGER</span>
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
                        onClick={() => {
                            localStorage.removeItem('isAuthenticated');
                            window.location.reload();
                        }}
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
                                placeholder="Search everything..."
                                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 relative transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="h-8 w-px bg-gray-200"></div>

                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-semibold text-gray-900 leading-none">Admin User</span>
                                    <span className="text-[11px] text-gray-400 font-medium">Super Admin</span>
                                </div>
                                <div className="h-10 w-10 bg-gradient-to-tr from-primary-500 to-aqua-500 rounded-full border-2 border-white shadow-md"></div>
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

export default Layout;
