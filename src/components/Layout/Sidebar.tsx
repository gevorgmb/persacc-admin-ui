import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './MainLayout.css';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const [productsOpen, setProductsOpen] = useState(location.pathname.startsWith('/products'));

    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-logo">
                <h2 className="text-gradient">Admin Panel</h2>
            </div>
            <nav className="sidebar-nav">
                <NavLink
                    to="/company"
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                    <span className="nav-icon">🏢</span>
                    Company
                </NavLink>
                <NavLink
                    to="/customers"
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                    <span className="nav-icon">👥</span>
                    Customers
                </NavLink>

                <div className="nav-group">
                    <div
                        className={`nav-link has-submenu ${productsOpen ? 'open' : ''} ${location.pathname.startsWith('/products') ? 'active' : ''}`}
                        onClick={() => setProductsOpen(!productsOpen)}
                    >
                        <span className="nav-icon">📦</span>
                        Products
                        <span className="chevron">▶</span>
                    </div>

                    {productsOpen && (
                        <div className="submenu">
                            <NavLink
                                to="/products"
                                end
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            >
                                <span className="nav-icon" style={{ fontSize: '1rem' }}>📋</span>
                                Manage Products
                            </NavLink>
                            <NavLink
                                to="/products/categories"
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            >
                                <span className="nav-icon" style={{ fontSize: '1rem' }}>🏷️</span>
                                Categories
                            </NavLink>
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
