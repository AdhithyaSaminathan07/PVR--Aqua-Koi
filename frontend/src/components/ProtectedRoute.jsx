import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ 
    isAuthenticated, 
    role, 
    allowedRoles, 
    children,
    fallbackPath = "/login"
}) => {
    if (!isAuthenticated) {
        return <Navigate to={fallbackPath} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Instead of redirecting to login (which might redirect back here),
        // we show a simple "Access Denied" message or a button to go to a safe place.
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
                <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11 3a9 9 0 11-18 0 9 9 0 0118 0zM12 5v4m0 0V5m0 4h.01" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-slate-400 mb-8">
                        Your account (Role: <span className="text-cyan-400 font-mono">{role}</span>) 
                        does not have permission to access this module.
                    </p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-900/20"
                    >
                        Return to Safe Zone
                    </button>
                    <button 
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/login';
                        }}
                        className="mt-4 text-slate-500 hover:text-rose-400 text-sm font-bold uppercase tracking-widest transition-colors"
                    >
                        Logout & Switch Account
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
