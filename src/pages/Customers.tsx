import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerTable from '../components/Customers/CustomerTable';

const Customers: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="text-gradient" style={{ margin: 0 }}>Customer Directory</h2>
                    <button 
                        onClick={() => navigate('/customers/new')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            background: 'var(--gradient-brand)',
                            color: 'white',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Customer
                    </button>
                </div>
                
                <CustomerTable />
            </div>
        </div>
    );
};

export default Customers;
