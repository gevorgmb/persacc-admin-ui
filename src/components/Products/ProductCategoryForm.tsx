import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../api/client';

interface Props {
    categoryId?: string;
}

const ProductCategoryForm: React.FC<Props> = ({ categoryId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    // Fetch category data if editing
    useEffect(() => {
        const fetchCategory = async () => {
            if (!categoryId) return;

            setFetching(true);
            setError(null);
            try {
                const response = await client.getProductCategory({ id: BigInt(categoryId) });
                const category = response.category;
                if (category) {
                    setFormData({
                        name: category.name,
                        description: category.description,
                    });
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch category data');
            } finally {
                setFetching(false);
            }
        };

        fetchCategory();
    }, [categoryId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (categoryId) {
                await client.updateProductCategory({
                    id: BigInt(categoryId),
                    name: formData.name,
                    description: formData.description,
                });
            } else {
                await client.createProductCategory({
                    name: formData.name,
                    description: formData.description,
                });
            }
            navigate('/products/categories');
        } catch (err: any) {
            setError(err.message || `Failed to ${categoryId ? 'update' : 'create'} category`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading category data...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="category-form">
            {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</div>}

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="E.g. Electronics"
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
                    placeholder="Category description..."
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
                    onClick={() => navigate('/products/categories')}
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
                    {loading ? 'Saving...' : (categoryId ? 'Update Category' : 'Create Category')}
                </button>
            </div>
        </form>
    );
};

export default ProductCategoryForm;
