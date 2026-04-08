import React from 'react';
import { useParams } from 'react-router-dom';
import SupplierForm from '../components/Suppliers/SupplierForm';

const EditSupplier: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Edit Supplier</h2>
                <SupplierForm supplierId={id} />
            </div>
        </div>
    );
};

export default EditSupplier;
