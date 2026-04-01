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

    const [additionalFields, setAdditionalFields] = useState<{ key: string, value: string }[]>([]);

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

        const parts = newName.trim().split(/\s+/).filter(Boolean);
        const newDetails: NameDetails = {
            prefix: '',
            firstName: '',
            middleName: '',
            lastName: '',
            suffix: '',
        };

        if (parts.length > 0) {
            const commonPrefixes = ['mr', 'mrs', 'ms', 'dr', 'prof', 'sir'];
            const commonSuffixes = ['jr', 'sr', 'ii', 'iii', 'iv', 'v', 'md', 'phd'];

            let startIdx = 0;
            let endIdx = parts.length;

            // Simple heuristic for prefix
            if (parts[0] && (parts[0].endsWith('.') || commonPrefixes.includes(parts[0].toLowerCase().replace('.', '')))) {
                newDetails.prefix = parts[0];
                startIdx = 1;
            }

            // Simple heuristic for suffix
            if (parts.length > startIdx + 1 && (parts[parts.length - 1].endsWith('.') || commonSuffixes.includes(parts[parts.length - 1].toLowerCase().replace('.', '')))) {
                newDetails.suffix = parts[parts.length - 1];
                endIdx = parts.length - 1;
            }

            const remaining = parts.slice(startIdx, endIdx);
            if (remaining.length === 1) {
                newDetails.firstName = remaining[0];
            } else if (remaining.length === 2) {
                newDetails.firstName = remaining[0];
                newDetails.lastName = remaining[1];
            } else if (remaining.length >= 3) {
                newDetails.firstName = remaining[0];
                newDetails.middleName = remaining[1];
                newDetails.lastName = remaining.slice(2).join(' ');
            }
        }
        
        setNameDetails(newDetails);
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

    const handleAddAdditionalField = () => {
        // Only allow adding if all existing fields are filled
        const canAdd = additionalFields.length === 0 || 
                      (additionalFields[additionalFields.length - 1].key && 
                       additionalFields[additionalFields.length - 1].value);
        
        if (canAdd) {
            setAdditionalFields([...additionalFields, { key: '', value: '' }]);
        }
    };

    const handleRemoveAdditionalField = (index: number) => {
        setAdditionalFields(additionalFields.filter((_, i) => i !== index));
    };

    const handleAdditionalFieldChange = (index: number, field: 'key' | 'value', value: string) => {
        if (field === 'key') {
            // Validation: only lowercase latin characters and numbers, must begin with latin character
            const regex = /^[a-z][a-z0-9]*$/;
            if (value !== '' && !regex.test(value)) {
                return; // Ignore invalid input
            }
        }
        
        const newFields = [...additionalFields];
        newFields[index][field] = value;
        setAdditionalFields(newFields);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Convert additional fields array to object
        const additionalInfo: { [key: string]: string } = {};
        additionalFields.forEach(f => {
            if (f.key) additionalInfo[f.key] = f.value;
        });

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
                additionalInfo: additionalInfo,
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

            {(isDetailed || formData.name.trim()) && (
                <div className="detailed-name-fields" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '1rem', 
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    background: isDetailed ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                    borderRadius: '12px',
                    border: isDetailed ? '1px solid var(--border-light)' : '1px dashed var(--border-light)',
                    opacity: isDetailed ? 1 : 0.8
                }}>
                    <div className="form-group">
                        <label className="sub-label">Prefix</label>
                        <input 
                            type="text" 
                            name="prefix" 
                            value={nameDetails.prefix} 
                            onChange={handleDetailChange} 
                            readOnly={!isDetailed}
                            placeholder={!isDetailed ? '—' : ''}
                            className="form-input-sub" 
                            style={{ 
                                background: isDetailed ? 'var(--bg-primary)' : 'transparent',
                                border: isDetailed ? '1px solid var(--border-light)' : '1px solid transparent',
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="sub-label">First Name</label>
                        <input 
                            type="text" 
                            name="firstName" 
                            value={nameDetails.firstName} 
                            onChange={handleDetailChange} 
                            readOnly={!isDetailed}
                            placeholder={!isDetailed ? '—' : ''}
                            className="form-input-sub" 
                            style={{ 
                                background: isDetailed ? 'var(--bg-primary)' : 'transparent',
                                border: isDetailed ? '1px solid var(--border-light)' : '1px solid transparent',
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="sub-label">Middle Name</label>
                        <input 
                            type="text" 
                            name="middleName" 
                            value={nameDetails.middleName} 
                            onChange={handleDetailChange} 
                            readOnly={!isDetailed}
                            placeholder={!isDetailed ? '—' : ''}
                            className="form-input-sub" 
                            style={{ 
                                background: isDetailed ? 'var(--bg-primary)' : 'transparent',
                                border: isDetailed ? '1px solid var(--border-light)' : '1px solid transparent',
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="sub-label">Last Name</label>
                        <input 
                            type="text" 
                            name="lastName" 
                            value={nameDetails.lastName} 
                            onChange={handleDetailChange} 
                            readOnly={!isDetailed}
                            placeholder={!isDetailed ? '—' : ''}
                            className="form-input-sub" 
                            style={{ 
                                background: isDetailed ? 'var(--bg-primary)' : 'transparent',
                                border: isDetailed ? '1px solid var(--border-light)' : '1px solid transparent',
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="sub-label">Suffix</label>
                        <input 
                            type="text" 
                            name="suffix" 
                            value={nameDetails.suffix} 
                            onChange={handleDetailChange} 
                            readOnly={!isDetailed}
                            placeholder={!isDetailed ? '—' : ''}
                            className="form-input-sub" 
                            style={{ 
                                background: isDetailed ? 'var(--bg-primary)' : 'transparent',
                                border: isDetailed ? '1px solid var(--border-light)' : '1px solid transparent',
                            }}
                        />
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

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
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

            <div className="additional-info-section" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Additional Info</label>
                </div>

                {additionalFields.map((field, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="sub-label">Key</label>
                            <input
                                type="text"
                                value={field.key}
                                onChange={(e) => handleAdditionalFieldChange(index, 'key', e.target.value)}
                                placeholder="e.g. twitter"
                                className="form-input-sub"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="sub-label">Value</label>
                            <input
                                type="text"
                                value={field.value}
                                onChange={(e) => handleAdditionalFieldChange(index, 'value', e.target.value)}
                                placeholder="Value..."
                                className="form-input-sub"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveAdditionalField(index)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={handleAddAdditionalField}
                    disabled={additionalFields.length > 0 && !(additionalFields[additionalFields.length - 1].key && additionalFields[additionalFields.length - 1].value)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1px dashed var(--border-light)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add a custom field
                </button>
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
