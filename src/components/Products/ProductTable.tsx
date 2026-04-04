import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../api/client';
import { Product } from '../../gen/product_pb';

interface Filters {
    name?: string;
    sku?: string;
    description?: string;
}

interface Props {
    filters?: Filters;
    onLoad?: () => void;
}

const ProductTable: React.FC<Props> = ({ filters, onLoad }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await client.listProducts({
                page: 1,
                limit: 50,
                name: filters?.name || '',
                sku: filters?.sku || '',
                description: filters?.description || '',
            });
            setProducts(response.products);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch product data');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
            if (onLoad) onLoad();
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const handleEdit = (product: Product) => {
        navigate(`/products/${product.id}`);
    };

    const handleDelete = async (product: Product) => {
        if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
            setDeletingId(product.id.toString());
            try {
                await client.deleteProduct({ id: product.id });
                await fetchProducts();
            } catch (err: any) {
                alert(`Failed to delete product: ${err.message}`);
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (loading) {
        return <div className="loading-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading products...</div>;
    }

    if (error && products.length === 0) {
        return (
            <div className="error-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-secondary)' }}>
                <p>{error}</p>
                <button
                    onClick={fetchProducts}
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
            {products.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No products found.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>SKU</th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id.toString()}>
                                    <td>
                                        <div className="fw-500" style={{ color: 'var(--text-primary)' }}>{product.name}</div>
                                    </td>
                                    <td>{product.sku || '-'}</td>
                                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {product.description || '-'}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => handleEdit(product)}
                                                title="Edit"
                                                disabled={deletingId === product.id.toString()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(product)}
                                                title="Delete"
                                                disabled={deletingId === product.id.toString()}
                                                style={{
                                                    opacity: deletingId === product.id.toString() ? 0.5 : 1,
                                                    cursor: deletingId === product.id.toString() ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {deletingId === product.id.toString() ? (
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

export default ProductTable;
