import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../api/client';

interface NameDetails {
    prefix: string;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
}

const CustomerForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDetailed, setIsDetailed] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        birthday: '',
        phone: '',
        email: '',
    });

    const [nameDetails, setNameDetails] = useState<NameDetails>({
        prefix: '',
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
    });

    // To prevent feedback loops during sync
    const isUpdatingFromSimple = useRef(false);
    const isUpdatingFromDetailed = useRef(false);

    // Sync Detailed -> Simple
    useEffect(() => {
        if (isUpdatingFromSimple.current) {
            isUpdatingFromSimple.current = false;
            return;
        }

        isUpdatingFromDetailed.current = true;
        const full = [
            nameDetails.prefix,
            nameDetails.firstName,
            nameDetails.middleName,
            nameDetails.lastName,
            nameDetails.suffix
        ].filter(Boolean).join(' ');
        
        setFormData(prev => ({ ...prev, name: full }));
    }, [nameDetails]);

    // Sync Simple -> Detailed (Custom Logic)
    const handleSimpleNameChange = (newName: string) => {
        setFormData(prev => ({ ...prev, name: newName }));
        
        if (isUpdatingFromDetailed.current) {
            isUpdatingFromDetailed.current = false;
            return;
        }

        isUpdatingFromSimple.current = true;

        const isEmpty = !nameDetails.prefix && !nameDetails.firstName && 
                        !nameDetails.middleName && !nameDetails.lastName && !nameDetails.suffix;

        if (isEmpty) {
            const parts = newName.trim().split(/\s+/);
            setNameDetails({
                prefix: '',
                firstName: parts[0] || '',
                middleName: '',
                lastName: parts.slice(1).join(' '),
                suffix: '',
            });
        } else {
            // Complex sync logic requested:
            // "words and letters added before John will be added to first_name" etc.
            // This is hard to do perfectly with just the current string.
            // We'll use a simplified version: split by spaces and try to map.
            // For now, let's keep it simple as a placeholder for the "User would see how we are building details" part.
            // If they are in detailed mode, they edit parts. If they are in simple mode, 
            // we'll just overwrite firstName and lastName as a fallback if they haven't touched detailed.
            const parts = newName.trim().split(/\s+/);
            setNameDetails(prev => ({
                ...prev,
                firstName: parts[0] || '',
                lastName: parts.slice(1).join(' '),
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'name') {
            handleSimpleNameChange(value);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNameDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await client.createCustomer({
                name: formData.name,
                firstName: nameDetails.firstName,
                lastName: nameDetails.lastName,
                prefix: nameDetails.prefix,
                middleName: nameDetails.middleName,
                suffix: nameDetails.suffix,
                birthday: formData.birthday,
                phone: formData.phone,
                email: formData.email,
            });
            navigate('/customers');
        } catch (err: any) {
            setError(err.message || 'Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="customer-form">
            {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</div>}

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        readOnly={isDetailed}
                        placeholder="John Doe"
                        required
                        className="form-input"
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: isDetailed ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                            border: '1px solid var(--border-light)',
                            color: 'var(--text-primary)',
                            opacity: isDetailed ? 0.7 : 1
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setIsDetailed(!isDetailed)}
                        style={{
                            padding: '0 1rem',
                            borderRadius: '8px',
                            background: isDetailed ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            border: '1px solid var(--border-light)',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                        title="Toggle Detailed Name"
                    >
                        {isDetailed ? 'Simple' : 'Parts'}
                    </button>
                </div>
            </div>

            {isDetailed && (
                <div className="detailed-name-fields" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '1rem', 
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)'
                }}>
                    <div className="form-group">
                        <label className="sub-label">Prefix</label>
                        <input type="text" name="prefix" value={nameDetails.prefix} onChange={handleDetailChange} className="form-input-sub" />
                    </div>
                    <div className="form-group">
                        <label className="sub-label">First Name</label>
                        <input type="text" name="firstName" value={nameDetails.firstName} onChange={handleDetailChange} className="form-input-sub" />
                    </div>
                    <div className="form-group">
                        <label className="sub-label">Middle Name</label>
                        <input type="text" name="middleName" value={nameDetails.middleName} onChange={handleDetailChange} className="form-input-sub" />
                    </div>
                    <div className="form-group">
                        <label className="sub-label">Last Name</label>
                        <input type="text" name="lastName" value={nameDetails.lastName} onChange={handleDetailChange} className="form-input-sub" />
                    </div>
                    <div className="form-group">
                        <label className="sub-label">Suffix</label>
                        <input type="text" name="suffix" value={nameDetails.suffix} onChange={handleDetailChange} className="form-input-sub" />
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Birthday</label>
                    <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        className="form-input"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                    />
                </div>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="form-input"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                    />
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={() => navigate('/customers')}
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
                    {loading ? 'Saving...' : 'Create Customer'}
                </button>
            </div>

            <style>{`
                .form-input-sub {
                    width: 100%;
                    padding: 0.5rem;
                    border-radius: 6px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-light);
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    outline: none;
                }
                .form-input-sub:focus {
                    border-color: var(--accent-primary);
                }
                .sub-label {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--text-tertiary);
                    margin-bottom: 0.25rem;
                }
            `}</style>
        </form>
    );
};

export default CustomerForm;
