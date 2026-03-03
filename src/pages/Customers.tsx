import React from 'react';

const Customers: React.FC = () => {
    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2>Customer Directory</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    This is a placeholder for the Customers management page. Here you will be able to view, search, and manage your customer base.
                </p>
            </div>
        </div>
    );
};

export default Customers;
