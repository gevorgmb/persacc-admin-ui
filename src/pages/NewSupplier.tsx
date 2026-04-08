import React from 'react';
import SupplierForm from '../components/Suppliers/SupplierForm';

const NewSupplier: React.FC = () => {
    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Add New Supplier</h2>
                <SupplierForm />
            </div>
        </div>
    );
};

export default NewSupplier;
