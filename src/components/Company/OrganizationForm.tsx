import React, { useState, useEffect } from 'react';
import { client } from '../../api/client';
import { Organization } from '../../gen/organization_pb';
import { protoInt64 } from '@bufbuild/protobuf';

const OrganizationForm: React.FC = () => {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const fetchOrganization = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await client.listOrganizations({ page: 1, limit: 1 });
            if (response.organizations && response.organizations.length > 0) {
                const org = response.organizations[0];
                setOrganization(org);
                setFormData({
                    name: org.name,
                    description: org.description,
                });
                setIsCreateMode(false);
            } else {
                setIsCreateMode(true);
                setOrganization(null);
                setFormData({ name: '', description: '' });
                // We don't set an error here, since it's a valid state now
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch organization data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganization();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            if (isCreateMode) {
                // For now using owner_id: 1. 
                // In a real app, this should be the current user's ID.
                await client.createOrganization({
                    ownerId: protoInt64.parse(1),
                    name: formData.name,
                    description: formData.description,
                });
                setMessage('Organization created successfully!');
            } else if (organization) {
                await client.updateOrganization({
                    id: organization.id,
                    name: formData.name,
                    description: formData.description,
                });
                setMessage('Organization updated successfully!');
            }
            fetchOrganization(); // Refresh data and switch mode if needed
        } catch (err: any) {
            setError(err.message || `Failed to ${isCreateMode ? 'create' : 'update'} organization`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-state">Loading organization data...</div>;
    }

    return (
        <div className="organization-form-container">
            <h3>{isCreateMode ? 'Create Organization' : 'Organization Settings'}</h3>

            {isCreateMode && !message && !error && (
                <div className="info-message" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', padding: '1rem', borderLeft: '4px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)' }}>
                    There is no organization, but you can add it now.
                </div>
            )}

            {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
            {message && <div className="success-message" style={{ color: '#10b981', marginBottom: '1rem' }}>{message}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        Organization Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-light)',
                            color: 'var(--text-primary)',
                            outline: 'none'
                        }}
                        value={formData.name}
                        onChange={handleChange}
                        disabled={saving}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-light)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            resize: 'vertical'
                        }}
                        value={formData.description}
                        onChange={handleChange}
                        disabled={saving}
                    />
                </div>

                <button
                    type="submit"
                    className={`submit-btn ${saving ? 'loading' : ''}`}
                    disabled={saving}
                    style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '8px',
                        background: 'var(--gradient-brand)',
                        color: 'white',
                        fontWeight: '600',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    {saving ? 'Saving...' : (isCreateMode ? 'Create Organization' : 'Save Changes')}
                </button>
            </form>
        </div>
    );
};

export default OrganizationForm;
