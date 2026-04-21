import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Aqua/Dashboard';
import Login from './pages/Login';
import Customers from './pages/Aqua/Customers';
import Stock from './pages/Aqua/Stock';
import Complaints from './pages/Aqua/Complaints';
import Orders from './pages/Aqua/Orders';
import Tasks from './pages/Aqua/Tasks';
import Services from './pages/Aqua/Services';
import Employees from './pages/Aqua/Employees';
import Invoices from './pages/Aqua/Invoices';
import AquaLayout from './components/Aqua/AquaLayout';
import KoiLayout from './components/Koi/KoiLayout';
import KoiDashboard from './pages/Koi/KoiDashboard';
import KoiEnquiries from './pages/Koi/KoiEnquiries';
import KoiOrders from './pages/Koi/KoiOrders';
import KoiInvoices from './pages/Koi/KoiInvoices';
import KoiPayments from './pages/Koi/KoiPayments';
import KoiInventory from './pages/Koi/KoiInventory';
import KoiCustomers from './pages/Koi/KoiCustomers';
import StaffDashboard from './pages/Staff/StaffDashboard';



import React, { useState, useEffect } from 'react';
import BossDashboard from './pages/Boss/BossDashboard';
import BossLayout from './components/Boss/BossLayout';
import UserManagement from './pages/Boss/UserManagement';
import BossReports from './pages/Boss/Reports';

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
        if (userRole === 'STAFF') return "/staff/dashboard";
        return "/";
    };

    return (
        <Router>
            <Routes>
                {/* Public Route */}
                <Route 
                    path="/login" 
                    element={isAuthenticated ? <Navigate to={getHomePath(role)} /> : <Login onLogin={(userRole, userModules) => { 
                        setIsAuthenticated(true); 
                        setRole(userRole);
                        setAllocatedModules(userModules || []);
                    }} />} 
                />

                {/* Aqua Branch Experience */}
                <Route 
                    path="/" 
                    element={isAuthenticated && (role === 'admin' || role === 'STAFF' || role === 'BRANCH_MANAGER') ? <AquaLayout /> : (isAuthenticated && (role === 'BOSS' || role === 'MANAGER') ? <Navigate to="/boss-dashboard" /> : <Navigate to="/login" />)}
                >
                    <Route index element={<Dashboard />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="inventory" element={<Stock />} />
                    <Route path="complaints" element={<Complaints />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="services" element={<Services />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="invoices" element={<Invoices />} />
                </Route>

                {/* BOSS & MANAGER UNIFIED EXPERIENCE */}
                <Route 
                    element={isAuthenticated && (role === 'BOSS' || role === 'MANAGER') ? <BossLayout /> : <Navigate to="/login" />}
                >
                    <Route path="/boss-dashboard" element={<BossDashboard />} />
                    <Route path="/boss/users" element={<UserManagement />} />
                    <Route path="/boss/reports" element={<BossReports />} />
                    
                    {/* Unified Access to Branch Modules for Boss/GM */}
                    <Route path="/aqua-dashboard" element={<Dashboard />} />
                    <Route path="/boss/customers" element={<Customers />} />
                    <Route path="/boss/inventory" element={<Stock />} />
                    <Route path="/boss/complaints" element={<Complaints />} />
                    <Route path="/boss/orders" element={<Orders />} />
                    <Route path="/boss/tasks" element={<Tasks />} />
                    <Route path="/boss/services" element={<Services />} />
                    <Route path="/boss/employees" element={<Employees />} />
                    <Route path="/boss/invoices" element={<Invoices />} />
                    
                    <Route path="/boss/koi/dashboard" element={<KoiDashboard />} />
                    <Route path="/boss/koi/enquiries" element={<KoiEnquiries />} />
                    <Route path="/boss/koi/orders" element={<KoiOrders />} />
                    <Route path="/boss/koi/invoices" element={<KoiInvoices />} />
                    <Route path="/boss/koi/payments" element={<KoiPayments />} />
                    <Route path="/boss/koi/inventory" element={<KoiInventory />} />
                    <Route path="/boss/koi/customers" element={<KoiCustomers />} />
                </Route>

                {/* Koi Branch Experience */}
                <Route 
                    path="/koi" 
                    element={isAuthenticated && (role === 'KOI_MANAGER' || role === 'STAFF' || role === 'BRANCH_MANAGER') ? <KoiLayout /> : (isAuthenticated && (role === 'BOSS' || role === 'MANAGER') ? <Navigate to="/boss-dashboard" /> : <Navigate to="/login" />)}
                >
                    <Route path="dashboard" element={<KoiDashboard />} />
                    <Route path="enquiries" element={<KoiEnquiries />} />
                    <Route path="orders" element={<KoiOrders />} />
                    <Route path="invoices" element={<KoiInvoices />} />
                    <Route path="payments" element={<KoiPayments />} />
                    <Route path="inventory" element={<KoiInventory />} />
                    <Route path="customers" element={<KoiCustomers />} />
                </Route>

                {/* Staff Experience */}
                <Route 
                    path="/staff" 
                    element={isAuthenticated && role === 'STAFF' ? <AquaLayout /> : <Navigate to="/login" />}
                >
                    <Route path="dashboard" element={<StaffDashboard />} />
                </Route>

                {/* Redirect any unknown routes */}
                <Route path="*" element={<Navigate to={isAuthenticated ? getHomePath(role) : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;
