import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaDownload } from 'react-icons/fa';
import { format } from 'date-fns';

const ClubDashboard = () => {
    const { user, updateUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [createClubData, setCreateClubData] = useState({ name: '', description: '', logo: '' });

    const fetchDashboardData = async () => {
        try {
            if (!user.clubId) {
                setLoading(false);
                return;
            }

            // Fetch club stats
            const statsRes = await api.get('/clubs/stats');
            setStats(statsRes.data);

            const eventsRes = await api.get(`/events?clubId=${user.clubId}&limit=100`);
            setEvents(eventsRes.data.events);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const [announcement, setAnnouncement] = useState({ title: '', message: '', priority: 'medium', expiryDate: '' });
    const [announcementSuccess, setAnnouncementSuccess] = useState(false);

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements', announcement);
            setAnnouncement({ title: '', message: '', priority: 'medium', expiryDate: '' });
            setAnnouncementSuccess(true);
            setTimeout(() => setAnnouncementSuccess(false), 3000);
        } catch (error) {
            alert('Failed to post announcement');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                setEvents(events.filter(e => e._id !== id));
            } catch (error) {
                alert('Failed to delete event');
            }
        }
    };

    const handleCreateClub = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/clubs', createClubData);
            const updatedUser = { ...user, clubId: data._id };
            updateUser(updatedUser);
            alert('Club created successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create club');
        }
    };

    if (loading) return <div className="container" style={{ padding: '50px' }}>Loading...</div>;

    if (!user?.clubId) {
        return (
            <div className="container" style={{ maxWidth: '600px', marginTop: '50px' }}>
                <div className="card" style={{ padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-color)' }}>Setup Your Club</h2>
                    <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
                        You are registered as a Club Admin, but you haven't created a club yet.
                    </p>
                    <form onSubmit={handleCreateClub}>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Club Name</label>
                            <input
                                type="text"
                                value={createClubData.name}
                                onChange={(e) => setCreateClubData({ ...createClubData, name: e.target.value })}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Description</label>
                            <textarea
                                value={createClubData.description}
                                onChange={(e) => setCreateClubData({ ...createClubData, description: e.target.value })}
                                required
                                style={{ ...styles.input, height: '100px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Logo URL (Optional)</label>
                            <input
                                type="text"
                                value={createClubData.logo}
                                onChange={(e) => setCreateClubData({ ...createClubData, logo: e.target.value })}
                                placeholder="https://..."
                                style={styles.input}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Club</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={styles.header}>
                <h1>Club Dashboard</h1>
                <Link to="/create-event" className="btn btn-primary">
                    <FaPlus /> Create Event
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <h3>Total Events</h3>
                        <p style={styles.statValue}>{stats.totalEvents}</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>Total Registrations</h3>
                        <p style={styles.statValue}>{stats.totalRegistrations}</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>Most Popular</h3>
                        <p style={{ fontSize: '1.2rem' }}>{stats.mostPopularEvent?.title || 'N/A'}</p>
                        <small>{stats.mostPopularEvent?.count || 0} registrations</small>
                    </div>
                </div>
            )}
            {/* Announcement Section */}
            <div style={{ marginBottom: '40px', padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginBottom: '20px' }}>Post New Announcement</h3>
                <form onSubmit={handleAnnouncementSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                        <input
                            placeholder="Announcement Title"
                            value={announcement.title}
                            onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                            required
                            style={styles.input}
                        />
                        <select
                            value={announcement.priority}
                            onChange={(e) => setAnnouncement({ ...announcement, priority: e.target.value })}
                            style={styles.input}
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                    <textarea
                        placeholder="Message"
                        value={announcement.message}
                        onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                        required
                        style={{ ...styles.input, height: '80px', marginBottom: '15px' }}
                    />
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Expiry Date</label>
                        <input
                            type="date"
                            value={announcement.expiryDate}
                            onChange={(e) => setAnnouncement({ ...announcement, expiryDate: e.target.value })}
                            required
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Post Announcement</button>
                    {announcementSuccess && <span style={{ marginLeft: '15px', color: 'green' }}>Posted!</span>}
                </form>
            </div>

            <h2 style={{ marginBottom: '20px' }}>Your Events</h2>
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event._id}>
                                <td>{event.title}</td>
                                <td>{format(new Date(event.eventDate), 'PPP')}</td>
                                <td>
                                    <span style={styles.status(event.status)}>{event.status}</span>
                                </td>
                                <td>
                                    <div style={styles.actions}>
                                        <Link to={`/events/edit/${event._id}`} style={styles.iconBtn} title="Edit">
                                            <FaEdit />
                                        </Link>
                                        <Link to={`/event-registrations/${event._id}`} style={{ ...styles.iconBtn, color: '#17a2b8' }} title="Registrations">
                                            <FaUsers />
                                        </Link>
                                        <button onClick={() => handleDelete(event._id)} style={{ ...styles.iconBtn, color: '#dc3545', border: 'none', background: 'none' }} title="Delete">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {events.length === 0 && <p style={{ textAlign: 'center', padding: '20px' }}>No events created yet.</p>}
            </div>
        </div>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
    },
    statCard: {
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        textAlign: 'center'
    },
    statValue: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: 'var(--primary-color)',
        margin: '10px 0'
    },
    tableContainer: {
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    status: (status) => ({
        padding: '5px 10px',
        borderRadius: '15px',
        fontSize: '0.8rem',
        backgroundColor: status === 'upcoming' ? '#d1e7dd' : '#f8f9fa',
        color: status === 'upcoming' ? '#0f5132' : '#6c757d'
    }),
    actions: {
        display: 'flex',
        gap: '10px'
    },
    iconBtn: {
        cursor: 'pointer',
        color: 'var(--primary-color)',
        fontSize: '1.1rem'
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ced4da'
    }
};

export default ClubDashboard;
