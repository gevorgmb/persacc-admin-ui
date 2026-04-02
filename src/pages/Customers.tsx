import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerTable from '../components/Customers/CustomerTable';

const Customers: React.FC = () => {
    const navigate = useNavigate();

    const [inputFilters, setInputFilters] = React.useState({
        name: '',
        email: '',
        phone: '',
        additionalInfo: '',
    });

    const [activeFilters, setActiveFilters] = React.useState(inputFilters);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);


    const updateActiveFilters = React.useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }

        // Only update if filters actually changed to avoid redundant API calls
        setActiveFilters(prev => {
            if (JSON.stringify(prev) === JSON.stringify(inputFilters)) return prev;
            setIsUpdating(true);
            return { ...inputFilters };
        });
    }, [inputFilters]);

    // Debounce effect (5 seconds)
    React.useEffect(() => {
        if (JSON.stringify(inputFilters) === JSON.stringify(activeFilters)) return;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            updateActiveFilters();
        }, 5000);

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [inputFilters, activeFilters, updateActiveFilters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            updateActiveFilters();
        }
    };

    const handleBlur = () => {
        updateActiveFilters();
    };

    const clearFilters = () => {
        const resetFilters = {
            name: '',
            email: '',
            phone: '',
            additionalInfo: '',
        };
        setInputFilters(resetFilters);
        setActiveFilters(resetFilters);
        setIsUpdating(true);
    };

    // Reset isUpdating when CustomerTable finished fetching (simulated by a small delay or we could pass a prop)
    // Actually, we can use the filters prop change in CustomerTable as a trigger.
    // For now, let's just clear isUpdating after a moment or better yet, pass a callback.
    const handleTableLoaded = () => {
        setIsUpdating(false);
    };

    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 className="text-gradient" style={{ margin: 0 }}>Customer Directory</h2>
                        {isUpdating && (
                            <div className="spinner" style={{
                                width: '20px',
                                height: '20px',
                                border: '2px solid rgba(99, 102, 241, 0.2)',
                                borderTop: '2px solid var(--accent-primary)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }}></div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/customers/new')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            background: 'var(--gradient-brand)',
                            color: 'white',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Customer
                    </button>
                </div>

                <div className="filters-section" style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '1rem',
                    marginBottom: '2rem',
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    flexWrap: 'wrap',
                    position: 'relative'
                }}>
                    <div className="filter-group" style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={inputFilters.name}
                            onChange={handleFilterChange}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            placeholder="Filter by name..."
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group" style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={inputFilters.phone}
                            onChange={handleFilterChange}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            placeholder="Filter by phone..."
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group" style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                        <input
                            type="text"
                            name="email"
                            value={inputFilters.email}
                            onChange={handleFilterChange}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            placeholder="Filter by email..."
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group" style={{ flex: 1.5, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Additional Info</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                name="additionalInfo"
                                value={inputFilters.additionalInfo}
                                onChange={handleFilterChange}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                placeholder="Search keyword..."
                                className="filter-input"
                                style={{ flex: 1 }}
                            />
                            <button
                                onClick={clearFilters}
                                title="Clear Filters"
                                style={{
                                    height: '38px',
                                    padding: '0 0.85rem',
                                    borderRadius: '8px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-light)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--accent-secondary)';
                                    e.currentTarget.style.color = 'var(--accent-secondary)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-light)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>


                <CustomerTable filters={activeFilters} onLoad={handleTableLoaded} />



                <style>{`
                    .filter-input {
                        width: 100%;
                        padding: 0.6rem 0.75rem;
                        border-radius: 8px;
                        background: var(--bg-tertiary);
                        border: 1px solid var(--border-light);
                        color: var(--text-primary);
                        font-size: 0.9rem;
                        outline: none;
                        transition: border-color 0.2s ease;
                    }
                    .filter-input:focus {
                        border-color: var(--accent-primary);
                    }
                `}</style>

            </div>
        </div>
    );
};

export default Customers;
