import React from 'react';
import OrganizationForm from '../components/Company/OrganizationForm';

const Company: React.FC = () => {
    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Company Management</h2>
                <OrganizationForm />
            </div>
        </div>
    );
};

export default Company;
