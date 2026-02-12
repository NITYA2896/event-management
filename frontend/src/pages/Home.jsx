import { useState, useEffect } from 'react';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import { FaSearch, FaFilter } from 'react-icons/fa';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('date_asc');

    const [announcements, setAnnouncements] = useState([]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/events', {
                params: {
                    page,
                    limit: 9,
                    search,
                    category,
                    sort
                }
            });
            setEvents(data.events);
            setTotalPages(data.totalPages);

            // Fetch announcements
            const annRes = await api.get('/announcements');
            setAnnouncements(annRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [page, category, sort]);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1); // Reset to page 1 on search
            fetchEvents();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setPage(1);
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
        setPage(1);
    };

    return (
        <div className="container">
            {/* Announcements Section */}
            {announcements.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    {announcements.map(ann => (
                        <div key={ann._id} style={{
                            padding: '15px',
                            marginBottom: '10px',
                            borderRadius: '8px',
                            background: ann.priority === 'high' ? '#fff3cd' : '#d1e7dd',
                            borderLeft: `5px solid ${ann.priority === 'high' ? '#ffc107' : '#198754'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{ann.title} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#666' }}>from {ann.clubId?.name}</span></h4>
                                <p style={{ margin: 0, color: '#444' }}>{ann.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>Discover Campus Events</h1>
                <p style={styles.heroSubtitle}>Join clubs, attend workshops, and participate in activities.</p>

                <div style={styles.searchBar}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search events, clubs, or keywords..."
                        value={search}
                        onChange={handleSearchChange}
                        style={styles.searchInput}
                    />
                </div>
            </div>

            <div style={styles.filters}>
                <div style={styles.filterGroup}>
                    <FaFilter style={{ color: '#6c757d' }} />
                    <select value={category} onChange={handleCategoryChange} style={styles.select}>
                        <option value="">All Categories</option>
                        <option value="Technical">Technical</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Sports">Sports</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Other">Other</option>
                    </select>

                    <select value={sort} onChange={handleSortChange} style={styles.select}>
                        <option value="date_asc">Upcoming First</option>
                        <option value="date_desc">Past First</option>
                        <option value="created_desc">Newest Added</option>
                        <option value="deadline">Registration Deadline</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Loading events...</div>
            ) : (
                <>
                    {events.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#6c757d' }}>
                            No events found matching your criteria.
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {events.map(event => (
                                <EventCard key={event._id} event={event} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div style={styles.pagination}>
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                style={{ ...styles.pageBtn, opacity: page === 1 ? 0.5 : 1 }}
                            >
                                Previous
                            </button>
                            <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.5 : 1 }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const styles = {
    hero: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '16px',
        marginBottom: '40px',
        marginTop: '20px'
    },
    heroTitle: {
        fontSize: '2.5rem',
        color: 'var(--primary-color)',
        marginBottom: '10px'
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        color: '#555',
        marginBottom: '30px'
    },
    searchBar: {
        maxWidth: '600px',
        margin: '0 auto',
        position: 'relative'
    },
    searchInput: {
        width: '100%',
        padding: '15px 20px 15px 45px',
        borderRadius: '30px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        outline: 'none'
    },
    searchIcon: {
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#adb5bd'
    },
    filters: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    select: {
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        backgroundColor: 'white',
        color: '#495057',
        cursor: 'pointer',
        outline: 'none'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '30px'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '50px',
        gap: '20px'
    },
    pageBtn: {
        padding: '8px 16px',
        borderRadius: '6px',
        border: '1px solid #dee2e6',
        backgroundColor: 'white',
        cursor: 'pointer',
        color: '#007bff'
    },
    pageInfo: {
        color: '#6c757d'
    }
};

export default Home;
