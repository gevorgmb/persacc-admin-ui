import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { client } from '../api/client';
import '../styles/auth.css';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        birthday: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await client.oAuthRegister({
                email: formData.email,
                password: formData.password,
                fullName: formData.name,
                phone: formData.phone,
                birthday: formData.birthday,
            });

            if (response.ok) {
                navigate('/login');
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            minLength={3}
                            maxLength={150}
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="birthday">Birthday (Optional)</label>
                        <input
                            type="date"
                            id="birthday"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone (Optional)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            maxLength={20}
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? '' : 'Register'}
                    </button>
                </form>
                <div className="auth-footer">
                    If you already registered <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
