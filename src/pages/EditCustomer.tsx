import React from 'react';
import { useParams } from 'react-router-dom';
import CustomerForm from '../components/Customers/CustomerForm';

const EditCustomer: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Edit Customer</h2>
                <CustomerForm customerId={id} />
            </div>
        </div>
    );
};

export default EditCustomer;
