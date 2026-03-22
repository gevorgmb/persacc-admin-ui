import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './MainLayout.css';
import { useAuth } from '../../context/AuthContext';

const MainLayout: React.FC = () => {
    const { organizations, activeOrganizationId, setActiveOrganizationId, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if user has 0 orgs and hasn't navigated to company page yet
    useEffect(() => {
        if (isAuthenticated && user && organizations.length === 0 && !location.pathname.includes('company')) {
            navigate('/company');
        }
    }, [user, organizations, location, navigate, isAuthenticated]);

    // If there is more than 1 org and no active org is selected, we must show a modal.
    // Also ensuring organizations.length checks out.
    const needsToSelectOrg = isAuthenticated && user && organizations.length > 1 && !activeOrganizationId;

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">
                <Topbar />
                <main className="page-content" style={{ position: 'relative' }}>
                    {needsToSelectOrg && (
                        <div className="org-selector-overlay" style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                            background: 'rgba(10,10,12,0.85)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                            borderRadius: '16px'
                        }}>
                            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', minWidth: '400px' }}>
                                <h3 className="text-gradient" style={{ marginBottom: '1rem' }}>Select Organization</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You belong to multiple organizations. Please select one to continue.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {organizations.map(org => (
                                        <button 
                                            key={org.id.toString()}
                                            onClick={() => setActiveOrganizationId(org.id.toString())}
                                            style={{
                                                padding: '1rem', borderRadius: '8px',
                                                background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
                                                color: 'var(--text-primary)', cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                fontWeight: '600',
                                                fontSize: '1rem'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                                e.currentTarget.style.color = 'var(--accent-primary)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'var(--bg-tertiary)';
                                                e.currentTarget.style.borderColor = 'var(--border-light)';
                                                e.currentTarget.style.color = 'var(--text-primary)';
                                            }}
                                        >
                                            {org.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Only render outlet if they don't need to select an org, or they are on the company page so they can create one */}
                    {(!needsToSelectOrg || location.pathname.includes('company')) && <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
