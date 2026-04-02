import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../api/client';

import { Customer } from '../../gen/customer_pb';

interface Filters {
    name?: string;
    email?: string;
    phone?: string;
    additionalInfo?: string;
}

interface Props {
    filters?: Filters;
    onLoad?: () => void;
}

const CustomerTable: React.FC<Props> = ({ filters, onLoad }) => {


    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch first page of customers with a generous limit for now
                        const response = await client.listCustomers({ 
                page: 1, 
                limit: 50,
                name: filters?.name || '',
                email: filters?.email || '',
                phone: filters?.phone || '',
                additionalInfo: filters?.additionalInfo || '',
            });
            setCustomers(response.customers);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch customer data');

            // For UI testing if the backend is not fully hooked up in this view yet,
            // we could theoretically use mock data here based on the proto definition,
            // but for now let's just show the error.
        } finally {
            setLoading(false);
            if (onLoad) onLoad();
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [filters]);


    const handleEdit = (customer: Customer) => {
        navigate(`/customers/${customer.id}`);
    };

    const handleDelete = async (customer: Customer) => {
        if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
            setDeletingId(customer.id.toString());
            try {
                await client.deleteCustomer({ id: customer.id });
                // Refresh list
                await fetchCustomers();
            } catch (err: any) {
                alert(`Failed to delete customer: ${err.message}`);
            } finally {
                setDeletingId(null);
            }
        }
    };


    if (loading) {
        return <div className="loading-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading customers...</div>;
    }

    if (error && customers.length === 0) {
        return (
            <div className="error-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-secondary)' }}>
                <p>{error}</p>
                <button
                    onClick={fetchCustomers}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="table-container">
            {customers.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No customers found.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Birthday</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id.toString()}>
                                    <td>
                                        <div className="fw-500" style={{ color: 'var(--text-primary)' }}>{customer.name}</div>
                                        {customer.additionalInfo && Object.keys(customer.additionalInfo).length > 0 && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                                {Object.entries(customer.additionalInfo).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                            </div>
                                        )}
                                    </td>
                                    <td>{customer.phone || '-'}</td>
                                    <td>{customer.email || '-'}</td>
                                    <td>{customer.birthday || '-'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => handleEdit(customer)}
                                                title="Edit"
                                                disabled={deletingId === customer.id.toString()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(customer)}
                                                title="Delete"
                                                disabled={deletingId === customer.id.toString()}
                                                style={{
                                                    opacity: deletingId === customer.id.toString() ? 0.5 : 1,
                                                    cursor: deletingId === customer.id.toString() ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {deletingId === customer.id.toString() ? (
                                                    <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CustomerTable;
