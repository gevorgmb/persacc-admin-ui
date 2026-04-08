import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../api/client';
import { ProductCategory } from '../gen/product_category_pb';
import ProductCategoryTable from '../components/Products/ProductCategoryTable';

const ProductCategories: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await client.listProductCategories({
                page: 1,
                limit: 100,
                name: searchTerm
            });
            setCategories(response.categories);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategories();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchCategories]);

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 className="text-gradient" style={{ fontSize: '2rem' }}>Product Categories</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your organization's product categories</p>
                </div>
                <button
                    onClick={() => navigate('/products/categories/new')}
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
                    New Category
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search categories by name..."
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

            {loading && categories.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading categories...</div>
            ) : (
                <ProductCategoryTable categories={categories} onRefresh={fetchCategories} />
            )}
        </div>
    );
};

export default ProductCategories;
