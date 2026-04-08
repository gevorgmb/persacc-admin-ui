import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCategory } from '../../gen/product_category_pb';
import { client } from '../../api/client';

interface Props {
    categories: ProductCategory[];
    onRefresh: () => void;
}

const ProductCategoryTable: React.FC<Props> = ({ categories, onRefresh }) => {
    const navigate = useNavigate();

    const handleDelete = async (id: bigint) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await client.deleteProductCategory({ id });
                onRefresh();
            } catch (err: any) {
                alert(err.message || 'Failed to delete category');
            }
        }
    };

    return (
        <div className="table-container">
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Created At</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                                    No categories found.
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category.id.toString()}>
                                    <td>
                                        <div className="fw-500">{category.name}</div>
                                    </td>
                                    <td>
                                        <div className="text-secondary" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {category.description || '-'}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                        {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => navigate(`/products/categories/${category.id}`)}
                                                title="Edit Category"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(category.id)}
                                                title="Delete Category"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductCategoryTable;
