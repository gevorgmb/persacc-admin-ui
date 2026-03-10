import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { client } from '../api/client';

export interface User {
    email: string;
    name: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    accessToken: string | null;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(() => {
        const token = localStorage.getItem('access_token');
        // Handle cases where token might be "null" or "undefined" as strings
        if (token === 'null' || token === 'undefined' || !token) return null;
        return token;
    });
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!accessToken);
    const [user, setUser] = useState<User | null>(null);

    const refreshUser = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await client.oAuthVerify({ accessToken: token });
            if (response.valid) {
                setUser({
                    email: response.email,
                    name: response.name,
                });
            } else {
                // If token is invalid according to server, logout
                logout();
            }
        } catch (error) {
            console.error('AuthContext: Failed to verify token', error);
            // Don't automatically logout on network error, only on invalid token
        }
    };

    useEffect(() => {
        if (isAuthenticated && !user) {
            refreshUser();
        }
        console.log('AuthContext: State updated', { accessToken, isAuthenticated, user });
    }, [accessToken, isAuthenticated, user]);

    const login = (token: string, refresh: string) => {
        console.log('AuthContext: Logging in', { token });
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refresh);
        setAccessToken(token);
        setIsAuthenticated(true);
        // user will be fetched by useEffect
    };

    const logout = () => {
        console.log('AuthContext: Logging out');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAccessToken(null);
        setIsAuthenticated(false);
        setUser(null);
    };

    // Keep state in sync with localStorage window level events (e.g. from other tabs)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'access_token') {
                const token = e.newValue;
                const sanitizedToken = (token === 'null' || token === 'undefined' || !token) ? null : token;
                console.log('AuthContext: Storage event detected', { sanitizedToken });
                setAccessToken(sanitizedToken);
                setIsAuthenticated(!!sanitizedToken);
                if (!sanitizedToken) setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, accessToken, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
