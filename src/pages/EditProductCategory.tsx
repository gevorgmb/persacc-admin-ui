import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCategoryForm from '../components/Products/ProductCategoryForm';

const EditProductCategory: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Edit Category</h2>
                <ProductCategoryForm categoryId={id} />
            </div>
        </div>
    );
};

export default EditProductCategory;
