import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { client } from '../api/client';
import '../styles/auth.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await client.oAuthToken({
                email: formData.email,
                password: formData.password,
            });

            if (response.accessToken) {
                localStorage.setItem('access_token', response.accessToken);
                localStorage.setItem('refresh_token', response.refreshToken);
                navigate('/company');
            } else {
                setError('Invalid credentials or missing token');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
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
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? '' : 'Login'}
                    </button>
                </form>
                <div className="auth-footer">
                    If you don't have an account <Link to="/register">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
