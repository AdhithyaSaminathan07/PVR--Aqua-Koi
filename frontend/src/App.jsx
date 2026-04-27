import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopLoadingBar from './components/TopLoadingBar';

// Lazy load layout components
const AquaLayout = lazy(() => import('./components/Aqua/AquaLayout'));
const KoiLayout = lazy(() => import('./components/Koi/KoiLayout'));
const BossLayout = lazy(() => import('./components/Boss/BossLayout'));

// Lazy load Aqua pages
const Dashboard = lazy(() => import('./pages/Aqua/Dashboard'));
const Customers = lazy(() => import('./pages/Aqua/Customers'));
const Stock = lazy(() => import('./pages/Aqua/Stock'));
const Complaints = lazy(() => import('./pages/Aqua/Complaints'));
const Orders = lazy(() => import('./pages/Aqua/Orders'));
const Tasks = lazy(() => import('./pages/Aqua/Tasks'));
const Services = lazy(() => import('./pages/Aqua/Services'));
const Employees = lazy(() => import('./pages/Aqua/Employees'));
const Invoices = lazy(() => import('./pages/Aqua/Invoices'));

// Lazy load Koi pages
const KoiDashboard = lazy(() => import('./pages/Koi/KoiDashboard'));
const KoiEnquiries = lazy(() => import('./pages/Koi/KoiEnquiries'));
const KoiSales = lazy(() => import('./pages/Koi/KoiSales'));
const KoiPayments = lazy(() => import('./pages/Koi/KoiPayments'));
const KoiInventory = lazy(() => import('./pages/Koi/KoiInventory'));
const KoiCustomers = lazy(() => import('./pages/Koi/KoiCustomers'));
const KoiInvoices = lazy(() => import('./pages/Koi/KoiInvoices'));

// Lazy load Shared pages
const Attendance = lazy(() => import('./pages/Shared/Attendance'));
const Settings = lazy(() => import('./components/Settings/Settings'));



// Lazy load other pages
const Login = lazy(() => import('./pages/Login'));
const StaffDashboard = lazy(() => import('./pages/Staff/StaffDashboard'));
const BossDashboard = lazy(() => import('./pages/Boss/BossDashboard'));
const UserManagement = lazy(() => import('./pages/Boss/UserManagement'));
const ModuleAllocation = lazy(() => import('./pages/Boss/ModuleAllocation'));
const BossReports = lazy(() => import('./pages/Boss/Reports'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
);

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('isAuthenticated') === 'true'
    );
    const [role, setRole] = useState(localStorage.getItem('role') || 'admin');
    const [allocatedModules, setAllocatedModules] = useState(
        JSON.parse(localStorage.getItem('allocatedModules') || '[]')
    );

    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
            setRole(localStorage.getItem('role') || 'admin');
            setAllocatedModules(JSON.parse(localStorage.getItem('allocatedModules') || '[]'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Helper for redirection mapping
    const getHomePath = (userRole) => {
        if (userRole === 'BOSS' || userRole === 'MANAGER') return "/boss-dashboard";
        if (userRole === 'KOI_MANAGER') return "/koi/dashboard";
        if (userRole === 'STAFF') return "/aqua";
        return "/aqua";
    };

    return (
        <Router>
            <TopLoadingBar />
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {/* Root Redirector */}
                    <Route
                        path="/"
                        element={<Navigate to={isAuthenticated ? getHomePath(role) : "/login"} replace />}
                    />

                    {/* Public Route */}
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to={getHomePath(role)} /> : <Login onLogin={(userRole, userModules) => {
                            setIsAuthenticated(true);
                            setRole(userRole);
                            setAllocatedModules(userModules || []);
                        }} />}
                    />

                    {/* Koi Branch Experience */}
                    <Route
                        path="/koi"
                        element={isAuthenticated && (role === 'admin' || role === 'KOI_MANAGER' || role === 'STAFF' || role === 'BRANCH_MANAGER') ? <KoiLayout role={role} allocatedModules={allocatedModules} /> : (isAuthenticated && (role === 'BOSS' || role === 'MANAGER') ? <Navigate to="/boss-dashboard" /> : <Navigate to="/login" />)}
                    >
                        <Route path="dashboard" element={<KoiDashboard />} />
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="employees" element={<Employees />} />
                        <Route path="enquiries" element={<KoiEnquiries />} />
                        <Route path="orders" element={<KoiSales />} />
                        <Route path="invoices" element={<KoiInvoices />} />

                        <Route path="payments" element={<KoiPayments />} />
                        <Route path="inventory" element={<KoiInventory />} />
                        <Route path="customers" element={<KoiCustomers />} />
                        <Route path="settings" element={<Settings type="Koi" />} />
                    </Route>

                    {/* Aqua Branch Experience */}
                    <Route
                        path="/aqua"
                        element={isAuthenticated && (role === 'admin' || role === 'STAFF' || role === 'BRANCH_MANAGER') ? <AquaLayout role={role} allocatedModules={allocatedModules} /> : (isAuthenticated && (role === 'BOSS' || role === 'MANAGER') ? <Navigate to="/boss-dashboard" /> : <Navigate to="/login" />)}
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="inventory" element={<Stock />} />
                        <Route path="complaints" element={<Complaints />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="services" element={<Services />} />
                        <Route path="employees" element={<Employees />} />
                        <Route path="invoices" element={<Invoices />} />
                        <Route path="settings" element={<Settings type="Aqua" />} />
                    </Route>


                    {/* BOSS & MANAGER UNIFIED EXPERIENCE */}
                    <Route
                        element={isAuthenticated && (role === 'BOSS' || role === 'MANAGER') ? <BossLayout role={role} allocatedModules={allocatedModules} /> : <Navigate to="/login" />}
                    >
                        <Route path="/boss-dashboard" element={<BossDashboard />} />
                        <Route path="/boss/users" element={<UserManagement />} />
                        <Route path="/boss/modules" element={<ModuleAllocation />} />
                        <Route path="/boss/reports" element={<BossReports />} />

                        {/* Unified Access to Branch Modules for Boss/GM */}
                        <Route path="/boss/aqua/dashboard" element={<Dashboard />} />
                        <Route path="/boss/aqua/attendance" element={<Attendance />} />
                        <Route path="/boss/attendance" element={<Attendance />} />{/* Keep for legacy if needed */}
                        <Route path="/boss/customers" element={<Customers />} />
                        <Route path="/boss/inventory" element={<Stock />} />
                        <Route path="/boss/complaints" element={<Complaints />} />
                        <Route path="/boss/orders" element={<Orders />} />
                        <Route path="/boss/tasks" element={<Tasks />} />
                        <Route path="/boss/services" element={<Services />} />
                        <Route path="/boss/employees" element={<Employees />} />
                        <Route path="/boss/invoices" element={<Invoices />} />
                        <Route path="/boss/aqua/settings" element={<Settings type="Aqua" />} />

                        <Route path="/boss/koi/dashboard" element={<KoiDashboard />} />
                        <Route path="/boss/koi/attendance" element={<Attendance />} />
                        <Route path="/boss/koi/employees" element={<Employees />} />
                        <Route path="/boss/koi/enquiries" element={<KoiEnquiries />} />
                        <Route path="/boss/koi/orders" element={<KoiSales />} />
                        <Route path="/boss/koi/invoices" element={<KoiInvoices />} />

                        <Route path="/boss/koi/payments" element={<KoiPayments />} />
                        <Route path="/boss/koi/inventory" element={<KoiInventory />} />
                        <Route path="/boss/koi/customers" element={<KoiCustomers />} />
                        <Route path="/boss/koi/settings" element={<Settings type="Koi" />} />
                    </Route>


                    {/* Staff Experience */}
                    <Route
                        path="/staff"
                        element={isAuthenticated && role === 'STAFF' ? <AquaLayout role={role} allocatedModules={allocatedModules} /> : <Navigate to="/login" />}
                    >
                        <Route path="dashboard" element={<StaffDashboard />} />
                    </Route>

                    {/* Redirect any unknown routes */}
                    <Route path="*" element={<Navigate to={isAuthenticated ? getHomePath(role) : "/login"} />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
