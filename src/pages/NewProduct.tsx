import React from 'react';
import ProductForm from '../components/Products/ProductForm';

const NewProduct: React.FC = () => {
    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Add New Product</h2>
                <ProductForm />
            </div>
        </div>
    );
};

export default NewProduct;
