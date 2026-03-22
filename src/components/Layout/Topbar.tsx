import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MainLayout.css';

const Topbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, organizations, activeOrganizationId, setActiveOrganizationId } = useAuth();
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

    const activeOrg = organizations.find(o => o.id.toString() === activeOrganizationId);

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
                <div className="user-profile">
                    <span className="org-name" style={{ 
                        marginRight: '1rem', 
                        color: 'var(--accent-primary)', 
                        fontWeight: '600',
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '16px',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        {activeOrg ? activeOrg.name : 'No Organization'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <span className="username" style={{ marginRight: '0.75rem' }}>{user?.name || 'Loading...'}</span>
                        <div className="user-avatar">{user ? getInitials(user.name) : '??'}</div>
                    </div>
                    
                    {dropdownOpen && (
                        <div className="user-dropdown glass-panel" style={{ top: '100%', right: '0', position: 'absolute', marginTop: '1rem' }}>
                            {user && <div className="user-email" style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-light)' }}>{user.email}</div>}
                            
                            {/* Organization Switcher if > 1 orgs */}
                            {organizations.length > 1 && (
                                <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                                    <div style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Switch Organization</div>
                                    {organizations.map(org => (
                                        <button 
                                            key={org.id.toString()}
                                            onClick={() => { setActiveOrganizationId(org.id.toString()); setDropdownOpen(false); }}
                                            style={{
                                                display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem',
                                                background: activeOrganizationId === org.id.toString() ? 'var(--bg-tertiary)' : 'transparent',
                                                color: activeOrganizationId === org.id.toString() ? 'var(--accent-primary)' : 'var(--text-primary)',
                                            }}
                                        >
                                            {org.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button onClick={handleLogout} className="logout-btn" style={{ padding: '0.75rem 1rem', width: '100%', textAlign: 'left', color: 'var(--accent-secondary)' }}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
