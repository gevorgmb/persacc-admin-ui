import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();

    console.log('ProtectedRoute: Checking authentication', { isAuthenticated, path: window.location.pathname });

    if (!isAuthenticated) {
        console.warn('ProtectedRoute: Not authenticated, redirecting to /login');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
