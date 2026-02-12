import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={styles.navbar}>
            <div className="container" style={styles.container}>
                <Link to="/" style={styles.logo}>CampusHub</Link>
                <div style={styles.links}>


                    {user ? (
                        <>
                            {user.role === 'student' && (
                                <>
                                    <Link to="/" style={styles.link}>Events</Link>
                                    <Link to="/my-registrations" style={styles.link}>My Registrations</Link>
                                </>
                            )}
                            {user.role === 'clubAdmin' && (
                                <>
                                    <Link to="/club-dashboard" style={styles.link}>Dashboard</Link>
                                    <Link to="/create-event" style={styles.link}>Create Event</Link>
                                </>
                            )}
                            {user.role === 'superAdmin' && (
                                <Link to="/admin-dashboard" style={styles.link}>Admin Dashboard</Link>
                            )}
                            <div style={styles.userMenu}>
                                <span style={styles.userName}><FaUserCircle /> {user.name}</span>
                                <button onClick={handleLogout} style={styles.logoutBtn}><FaSignOutAlt /> Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>Login</Link>
                            <Link to="/register" style={styles.registerBtn}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        padding: '1rem 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'white',
        textDecoration: 'none'
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
        opacity: 0.9,
        transition: 'opacity 0.2s'
    },
    registerBtn: {
        backgroundColor: 'white',
        color: 'var(--primary-color)',
        padding: '8px 16px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: '500'
    },
    userMenu: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        borderLeft: '1px solid rgba(255,255,255,0.3)',
        paddingLeft: '15px'
    },
    userName: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    logoutBtn: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: 0,
        fontSize: '14px'
    }
};

export default Navbar;
