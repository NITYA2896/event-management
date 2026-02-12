import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const MyRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const { data } = await api.get('/registrations/my');
                setRegistrations(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, []);

    if (loading) return <div className="container" style={{ padding: '50px' }}>Loading...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: '#007bff' }}>My Registrations</h1>
                <Link to="/" className="btn btn-outline-primary" style={{ textDecoration: 'none', padding: '8px 16px', border: '1px solid #007bff', borderRadius: '4px', color: '#007bff' }}>
                    Back to Dashboard
                </Link>
            </div>

            {registrations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '10px' }}>
                    <h3>You haven't registered for any events yet.</h3>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Events</Link>
                </div>
            ) : (
                <div style={styles.list}>
                    {registrations.map(reg => (
                        <div key={reg._id} style={styles.item}>
                            <div style={styles.info}>
                                <h3 style={styles.title}>
                                    <Link to={`/events/${reg.eventId._id}`}>{reg.eventId.title}</Link>
                                </h3>
                                <p style={styles.date}>{format(new Date(reg.eventId.eventDate), 'PPP p')}</p>
                            </div>
                            <div style={styles.status(reg.status)}>
                                {reg.status}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    item: {
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        margin: '0 0 5px 0',
        fontSize: '1.2rem'
    },
    date: {
        color: '#6c757d',
        margin: 0
    },
    status: (status) => ({
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        backgroundColor: status === 'registered' ? '#d1e7dd' : '#f8d7da',
        color: status === 'registered' ? '#0f5132' : '#721c24'
    })
};

export default MyRegistrations;
