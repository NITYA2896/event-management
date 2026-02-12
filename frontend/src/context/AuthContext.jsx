import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                // We'll need an endpoint to get the current user profile based on the cookie
                // For now, let's assume valid session if we can hit a protected route or have a stored user in local storage (though cookie is better)
                // Actually, a dedicated /api/auth/profile or /me endpoint is best.
                // Since I haven't created one, I'll quickly add one or rely on localStorage for initial state, but localStorage + httponly cookie is weird.
                // Best practice: /api/auth/me to validate session on load.
                // I'll add a checkUser endpoint or similar.
                // For now, I'll skip the auto-check on mount logic until I add that endpoint, or just check localStorage if I saved user data there (I didn't in login controller, I just sent it back).
                // Let's safe user info to localStorage on login for persistence across refreshes, even if cookies handle the auth.

                const storedUser = localStorage.getItem('userInfo');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        // Also save token separately if needed for interceptor, but usually it's inside data?
        // Let's check authController.js... it doesn't return the token in the JSON body, only cookie.
        // We need to update authController to return token in body too for this fallback to work!
        return data;
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
