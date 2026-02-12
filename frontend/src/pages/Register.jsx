import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api'; // Direct API usage if needed or via context
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await register({ name, email, password, role });
            // Redirect based on role
            if (role === 'student') navigate('/');
            else if (role === 'clubAdmin') navigate('/club-dashboard');
            else navigate('/admin-dashboard'); // Super Admin
        } catch (err) {
            console.error('Registration Error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            setError(errorMessage === 'Network Error' ? 'Server is unreachable. Is the backend running?' : errorMessage);
        }
    };

    return (
        <div style={styles.container}>
            <div className="card" style={styles.card}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-color)' }}>Register</h2>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
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
                    <div style={styles.formGroup}>
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>I am a...</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={styles.input}
                        >
                            <option value="student">Student</option>
                            <option value="clubAdmin">Club Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">Register</button>
                </form>
                <p style={{ marginTop: '15px', textAlign: 'center' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login</Link>
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
        minHeight: '80vh',
        padding: '20px 0'
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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

export default Register;
