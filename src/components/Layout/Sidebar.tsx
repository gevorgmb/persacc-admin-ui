import React from 'react';
import { NavLink } from 'react-router-dom';
import './MainLayout.css';

const Sidebar: React.FC = () => {
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
                <NavLink
                    to="/products"
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                    <span className="nav-icon">📦</span>
                    Products
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
