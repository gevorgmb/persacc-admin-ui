import React from 'react';
import ProductCategoryForm from '../components/Products/ProductCategoryForm';

const NewProductCategory: React.FC = () => {
    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Add New Category</h2>
                <ProductCategoryForm />
            </div>
        </div>
    );
};

export default NewProductCategory;
