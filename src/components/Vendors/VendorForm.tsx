import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../api/client';

interface Props {
    vendorId?: string;
}

const VendorForm: React.FC<Props> = ({ vendorId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        description: '',
    });

    // Fetch vendor data if editing
    useEffect(() => {
        const fetchVendor = async () => {
            if (!vendorId) return;

            setFetching(true);
            setError(null);
            try {
                const response = await client.getVendor({ id: BigInt(vendorId) });
                const vendor = response.vendor;
                if (vendor) {
                    setFormData({
                        name: vendor.name,
                        domain: vendor.domain,
                        description: vendor.description,
                    });
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch vendor data');
            } finally {
                setFetching(false);
            }
        };

        fetchVendor();
    }, [vendorId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (vendorId) {
                await client.updateVendor({
                    id: BigInt(vendorId),
                    ...formData
                });
            } else {
                await client.createVendor(formData);
            }
            navigate('/products/vendors');
        } catch (err: any) {
            setError(err.message || `Failed to ${vendorId ? 'update' : 'create'} vendor`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading vendor data...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="vendor-form">
            {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Vendor Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="E.g. Acme Corp"
                        required
                        className="form-input"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                    />
                </div>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Domain</label>
                    <input
                        type="text"
                        name="domain"
                        value={formData.domain}
                        onChange={handleChange}
                        placeholder="acme.com"
                        className="form-input"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                    />
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Vendor description..."
                    className="form-input"
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)',
                        minHeight: '120px',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={() => navigate('/products/vendors')}
                    className="btn-secondary"
                    style={{ padding: '0.75rem 2rem', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '8px',
                        background: 'var(--gradient-brand)',
                        color: 'white',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Saving...' : (vendorId ? 'Update Vendor' : 'Create Vendor')}
                </button>
            </div>
        </form>
    );
};

export default VendorForm;
