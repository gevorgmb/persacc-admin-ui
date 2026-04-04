import React from 'react';
import { useParams } from 'react-router-dom';
import ProductForm from '../components/Products/ProductForm';

const EditProduct: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Edit Product</h2>
                <ProductForm productId={id} />
            </div>
        </div>
    );
};

export default EditProduct;
