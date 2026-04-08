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

    const [additionalFields, setAdditionalFields] = useState<{ key: string; value: string }[]>([]);


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

                    if (product.additionalDetails) {
                        const fields = Object.entries(product.additionalDetails).map(([key, value]) => ({
                            key,
                            value
                        }));
                        setAdditionalFields(fields);
                    }
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

    const handleAddAdditionalField = () => {
        const canAdd = additionalFields.length === 0 ||
            (additionalFields[additionalFields.length - 1].key &&
                additionalFields[additionalFields.length - 1].value);

        if (canAdd) {
            setAdditionalFields([...additionalFields, { key: '', value: '' }]);
        }
    };

    const handleRemoveAdditionalField = (index: number) => {
        setAdditionalFields(additionalFields.filter((_, i) => i !== index));
    };

    const handleAdditionalFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        if (field === 'key') {
            const regex = /^[a-z][a-z0-9]*$/;
            if (value !== '' && !regex.test(value)) {
                return;
            }
        }

        const newFields = [...additionalFields];
        newFields[index][field] = value;
        setAdditionalFields(newFields);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Convert additional fields array to object
        const additionalDetails: { [key: string]: string } = {};
        additionalFields.forEach(f => {
            if (f.key) additionalDetails[f.key] = f.value;
        });

        try {
            if (productId) {
                await client.updateProduct({
                    id: BigInt(productId),
                    sku: formData.sku,
                    name: formData.name,
                    description: formData.description,
                    additionalDetails: additionalDetails,
                });
            } else {
                await client.createProduct({
                    sku: formData.sku,
                    name: formData.name,
                    description: formData.description,
                    additionalDetails: additionalDetails,
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

            <div className="additional-info-section" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Additional Details</label>
                </div>

                {additionalFields.map((field, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="sub-label">Key</label>
                            <input
                                type="text"
                                value={field.key}
                                onChange={(e) => handleAdditionalFieldChange(index, 'key', e.target.value)}
                                placeholder="e.g. weight"
                                className="form-input-sub"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="sub-label">Value</label>
                            <input
                                type="text"
                                value={field.value}
                                onChange={(e) => handleAdditionalFieldChange(index, 'value', e.target.value)}
                                placeholder="Value..."
                                className="form-input-sub"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveAdditionalField(index)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={handleAddAdditionalField}
                    disabled={additionalFields.length > 0 && !(additionalFields[additionalFields.length - 1].key && additionalFields[additionalFields.length - 1].value)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1px dashed var(--border-light)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add a detail field
                </button>
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
