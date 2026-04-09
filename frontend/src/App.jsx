import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Stock from './pages/Stock';
import Complaints from './pages/Complaints';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Services from './pages/Services';
import Employees from './pages/Employees';
import Invoices from './pages/Invoices';
import Layout from './components/Layout';





import React, { useState, useEffect } from 'react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('isAuthenticated') === 'true'
    );

    // Listen for storage changes to handle login/logout across tabs
    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <Router>
            <Routes>
                {/* Public Route */}
                <Route 
                    path="/login" 
                    element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={() => setIsAuthenticated(true)} />} 
                />

                {/* Protected Routes */}
                <Route 
                    path="/" 
                    element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
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

                {/* Redirect any unknown routes */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
