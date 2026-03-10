import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MainLayout.css';

const Topbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('company')) return 'Company Management';
        if (path.includes('customers')) return 'Customer Directory';
        return 'Dashboard';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <header className="topbar glass-panel">
            <div className="topbar-left">
                <h1>{getPageTitle()}</h1>
                <div className="page-info">
                    <span className="time-info">{currentTime.toLocaleTimeString()}</span>
                    <span className="date-info">{currentTime.toLocaleDateString()}</span>
                </div>
            </div>
            <div className="topbar-right">
                <div className="user-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <span className="username">{user?.name || 'Loading...'}</span>
                    <div className="user-avatar">{user ? getInitials(user.name) : '??'}</div>
                    {dropdownOpen && (
                        <div className="user-dropdown glass-panel">
                            {user && <div className="user-email">{user.email}</div>}
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
