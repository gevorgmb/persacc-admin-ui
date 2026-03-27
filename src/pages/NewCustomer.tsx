import React from 'react';
import CustomerForm from '../components/Customers/CustomerForm';

const NewCustomer: React.FC = () => {
    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Add New Customer</h2>
                <CustomerForm />
            </div>
        </div>
    );
};

export default NewCustomer;
