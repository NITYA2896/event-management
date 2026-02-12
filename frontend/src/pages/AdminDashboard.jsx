import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [analyticsRes, clubsRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/clubs/admin/all')
            ]);
            setAnalytics(analyticsRes.data);
            setClubs(clubsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveClub = async (id, status) => {
        try {
            await api.put(`/clubs/${id}/approve`, { approved: status === 'approve' });
            setClubs(clubs.map(club => club._id === id ? { ...club, approved: status === 'approve' } : club));
        } catch (error) {
            alert('Action failed');
        }
    };

    if (loading) return <div className="container" style={{ padding: '50px' }}>Loading...</div>;

    const pieData = analytics?.eventsByCategory.map(item => ({
        name: item._id,
        value: item.count
    })) || [];

    return (
        <div className="container">
            <h1 style={{ marginBottom: '30px', color: 'var(--primary-color)' }}>Super Admin Dashboard</h1>

            {/* Stats Overview */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <h3>Total Users</h3>
                    <p style={styles.statValue}>{analytics?.totalUsers}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Total Clubs</h3>
                    <p style={styles.statValue}>{analytics?.totalClubs}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Total Events</h3>
                    <p style={styles.statValue}>{analytics?.totalEvents}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Most Active Club</h3>
                    <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>{analytics?.mostActiveClub?.name || 'N/A'}</p>
                    <small>{analytics?.mostActiveClub?.eventCount || 0} events</small>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '40px' }}>
                {/* Chart */}
                <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Events per Category</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Club Management */}
            <h2 style={{ marginBottom: '20px' }}>Club Management</h2>
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Club Name</th>
                            <th>Created By</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clubs.map((club) => (
                            <tr key={club._id}>
                                <td>{club.name}</td>
                                <td>{club.createdBy?.name} ({club.createdBy?.email})</td>
                                <td>
                                    <span style={styles.status(club.approved)}>
                                        {club.approved ? 'Approved' : 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    {!club.approved ? (
                                        <button onClick={() => handleApproveClub(club._id, 'approve')} style={{ ...styles.btn, color: 'green' }} title="Approve">
                                            <FaCheck />
                                        </button>
                                    ) : (
                                        <button onClick={() => handleApproveClub(club._id, 'reject')} style={{ ...styles.btn, color: 'orange' }} title="Revoke">
                                            <FaTimes />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
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
    status: (approved) => ({
        padding: '5px 10px',
        borderRadius: '15px',
        fontSize: '0.8rem',
        backgroundColor: approved ? '#d1e7dd' : '#fff3cd',
        color: approved ? '#0f5132' : '#856404'
    }),
    btn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        marginRight: '10px'
    }
};

export default AdminDashboard;
