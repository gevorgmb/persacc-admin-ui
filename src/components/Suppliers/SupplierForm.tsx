import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../api/client';

interface Props {
    supplierId?: string;
}

const SupplierForm: React.FC<Props> = ({ supplierId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        phone: '',
        description: '',
    });

    // Fetch supplier data if editing
    useEffect(() => {
        const fetchSupplier = async () => {
            if (!supplierId) return;

            setFetching(true);
            setError(null);
            try {
                const response = await client.getSupplier({ id: BigInt(supplierId) });
                const supplier = response.supplier;
                if (supplier) {
                    setFormData({
                        name: supplier.name,
                        domain: supplier.domain,
                        phone: supplier.phone,
                        description: supplier.description,
                    });
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch supplier data');
            } finally {
                setFetching(false);
            }
        };

        fetchSupplier();
    }, [supplierId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (supplierId) {
                await client.updateSupplier({
                    id: BigInt(supplierId),
                    ...formData
                });
            } else {
                await client.createSupplier(formData);
            }
            navigate('/products/suppliers');
        } catch (err: any) {
            setError(err.message || `Failed to ${supplierId ? 'update' : 'create'} supplier`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading supplier data...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="supplier-form">
            {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Supplier Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="E.g. Logistics Plus"
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
                        placeholder="logistics.com"
                        className="form-input"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                    />
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="form-input"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Supplier description..."
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
                    onClick={() => navigate('/products/suppliers')}
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
                    {loading ? 'Saving...' : (supplierId ? 'Update Supplier' : 'Create Supplier')}
                </button>
            </div>
        </form>
    );
};

export default SupplierForm;
