import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    accessToken: string | null;
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

    useEffect(() => {
        console.log('AuthContext: State updated', { accessToken, isAuthenticated });
    }, [accessToken, isAuthenticated]);

    const login = (token: string, refresh: string) => {
        console.log('AuthContext: Logging in', { token });
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refresh);
        setAccessToken(token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        console.log('AuthContext: Logging out');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAccessToken(null);
        setIsAuthenticated(false);
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
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, accessToken }}>
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
