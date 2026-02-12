import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await login(email, password);
            if (userData.role === 'student') navigate('/');
            else if (userData.role === 'clubAdmin') navigate('/club-dashboard');
            else if (userData.role === 'superAdmin') navigate('/admin-dashboard');
        } catch (err) {
            console.error('Login Error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMessage === 'Network Error' ? 'Server is unreachable. Is the backend running?' : errorMessage);
        }
    };

    return (
        <div style={styles.container}>
            <div className="card" style={styles.card}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-color)' }}>Login</h2>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Login</button>
                </form>
                <p style={{ marginTop: '15px', textAlign: 'center' }}>
                    New User? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Register Here</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh'
    },
    card: {
        width: '100%',
        maxWidth: '400px'
    },
    formGroup: {
        marginBottom: '15px'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginTop: '5px'
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '4px',
        textAlign: 'center'
    }
};

export default Login;
