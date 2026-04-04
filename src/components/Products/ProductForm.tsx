import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../api/client';

interface Props {
    productId?: string;
}

const ProductForm: React.FC<Props> = ({ productId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
    });

    // Fetch product data if editing
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;

            setFetching(true);
            setError(null);
            try {
                const response = await client.getProduct({ id: BigInt(productId) });
                const product = response.product;
                if (product) {
                    setFormData({
                        sku: product.sku,
                        name: product.name,
                        description: product.description,
                    });
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch product data');
            } finally {
                setFetching(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (productId) {
                await client.updateProduct({
                    id: BigInt(productId),
                    sku: formData.sku,
                    name: formData.name,
                    description: formData.description,
                });
            } else {
                await client.createProduct({
                    sku: formData.sku,
                    name: formData.name,
                    description: formData.description,
                });
            }
            navigate('/products');
        } catch (err: any) {
            setError(err.message || `Failed to ${productId ? 'update' : 'create'} product`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading product data...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="product-form">
            {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</div>}

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>SKU</label>
                <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="PROD-001"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Product Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Gourmet Coffee Beans"
                    required
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
                    placeholder="Premium roasted Arabica beans..."
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
                    onClick={() => navigate('/products')}
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
                    {loading ? 'Saving...' : (productId ? 'Update Product' : 'Create Product')}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
