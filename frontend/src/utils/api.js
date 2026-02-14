import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
console.log('VITE_API_URL:', apiUrl);

const api = axios.create({
    baseURL: apiUrl || 'http://127.0.0.1:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const token = JSON.parse(userInfo).token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
