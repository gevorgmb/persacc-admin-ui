import React from 'react';
import { useParams } from 'react-router-dom';
import VendorForm from '../components/Vendors/VendorForm';

const EditVendor: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Edit Vendor</h2>
                <VendorForm vendorId={id} />
            </div>
        </div>
    );
};

export default EditVendor;
