import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../api/client';
import { Vendor } from '../gen/vendor_pb';
import VendorTable from '../components/Vendors/VendorTable';

const Vendors: React.FC = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await client.listVendors({
                page: 1,
                limit: 100,
                name: searchTerm
            });
            setVendors(response.vendors);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch vendors');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVendors();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchVendors]);

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 className="text-gradient" style={{ fontSize: '2rem' }}>Vendors</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage product vendors and brands</p>
                </div>
                <button
                    onClick={() => navigate('/products/vendors/new')}
                    className="btn-primary"
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        background: 'var(--gradient-brand)',
                        color: 'white',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New Vendor
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search vendors by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '10px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </div>

            {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</div>}

            {loading && vendors.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading vendors...</div>
            ) : (
                <VendorTable vendors={vendors} onRefresh={fetchVendors} />
            )}
        </div>
    );
};

export default Vendors;
