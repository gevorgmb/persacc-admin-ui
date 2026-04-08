import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Vendor } from '../../gen/vendor_pb';
import { client } from '../../api/client';

interface Props {
    vendors: Vendor[];
    onRefresh: () => void;
}

const VendorTable: React.FC<Props> = ({ vendors, onRefresh }) => {
    const navigate = useNavigate();

    const handleDelete = async (id: bigint) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            try {
                await client.deleteVendor({ id });
                onRefresh();
            } catch (err: any) {
                alert(err.message || 'Failed to delete vendor');
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
                            <th>Domain</th>
                            <th>Description</th>
                            <th>Created At</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                                    No vendors found.
                                </td>
                            </tr>
                        ) : (
                            vendors.map((vendor) => (
                                <tr key={vendor.id.toString()}>
                                    <td>
                                        <div className="fw-600">{vendor.name}</div>
                                    </td>
                                    <td>
                                        <div className="text-accent">{vendor.domain || '-'}</div>
                                    </td>
                                    <td>
                                        <div className="text-secondary" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {vendor.description || '-'}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                        {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => navigate(`/products/vendors/${vendor.id}`)}
                                                title="Edit Vendor"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(vendor.id)}
                                                title="Delete Vendor"
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

export default VendorTable;
