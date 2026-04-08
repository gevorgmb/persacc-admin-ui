import React from 'react';
import VendorForm from '../components/Vendors/VendorForm';

const NewVendor: React.FC = () => {
    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Add New Vendor</h2>
                <VendorForm />
            </div>
        </div>
    );
};

export default NewVendor;
