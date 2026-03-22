import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { client } from '../api/client';

import { Organization } from '../gen/organization_pb';

export interface User {
    email: string;
    name: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    organizations: Organization[];
    activeOrganizationId: string | null;
    setActiveOrganizationId: (id: string | null) => void;
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
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(() => {
        return localStorage.getItem('active_organization_id');
    });
    const [lastActivity, setLastActivity] = useState<number>(Date.now());

    // Track user activity for token refresh
    useEffect(() => {
        const updateActivity = () => setLastActivity(Date.now());
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);
        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
        };
    }, []);

    const loadOrganizations = async () => {
        try {
            const res = await client.listOrganizations({ page: 1, limit: 100 });
            setOrganizations(res.organizations);
            const savedOrgId = localStorage.getItem('active_organization_id');
            
            if (res.organizations.length === 0) {
                setActiveOrganizationId(null);
                localStorage.removeItem('active_organization_id');
            } else if (res.organizations.length === 1) {
                const orgIdStr = res.organizations[0].id.toString();
                setActiveOrganizationId(orgIdStr);
                localStorage.setItem('active_organization_id', orgIdStr);
            } else {
                if (savedOrgId && res.organizations.some(o => o.id.toString() === savedOrgId)) {
                    setActiveOrganizationId(savedOrgId);
                } else {
                    setActiveOrganizationId(null);
                    localStorage.removeItem('active_organization_id');
                }
            }
        } catch (error) {
            console.error('AuthContext: Failed to load organizations', error);
        }
    };

    // Background token refresh
    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;

        const checkToken = async () => {
            try {
                const base64Url = accessToken.split('.')[1];
                if (!base64Url) return;
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                
                const exp = payload.exp * 1000;
                const now = Date.now();
                // Refresh if token expires in < 5 mins and user was active in last 10 mins
                if (exp - now < 300000 && now - lastActivity < 600000) {
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (refreshToken) {
                        const res = await client.oAuthRefresh({ refreshToken });
                        login(res.accessToken, res.refreshToken);
                    }
                }
            } catch (e) {
                console.error("AuthContext: Token refresh check failed", e);
            }
        };

        const interval = setInterval(checkToken, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [isAuthenticated, accessToken, lastActivity]);

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
                await loadOrganizations();
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
        localStorage.removeItem('active_organization_id');
        setAccessToken(null);
        setIsAuthenticated(false);
        setUser(null);
        setOrganizations([]);
        setActiveOrganizationId(null);
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
            if (e.key === 'active_organization_id') {
                setActiveOrganizationId(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleSetActiveOrganizationId = (id: string | null) => {
        setActiveOrganizationId(id);
        if (id) {
            localStorage.setItem('active_organization_id', id);
        } else {
            localStorage.removeItem('active_organization_id');
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, organizations, activeOrganizationId, setActiveOrganizationId: handleSetActiveOrganizationId, login, logout, accessToken, refreshUser }}>
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
