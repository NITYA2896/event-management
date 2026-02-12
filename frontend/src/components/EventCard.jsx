import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const EventCard = ({ event }) => {
    return (
        <div style={styles.card}>
            <div style={styles.imageContainer}>
                {event.posterImage ? (
                    <img src={event.posterImage} alt={event.title} style={styles.image} />
                ) : (
                    <div style={styles.placeholderImage}>
                        <span>{event.category}</span>
                    </div>
                )}
            </div>
            <div style={styles.content}>
                <div style={styles.header}>
                    <span style={styles.category}>{event.category}</span>
                    <span style={styles.status(event.status)}>{event.status}</span>
                </div>
                <h3 style={styles.title}>{event.title}</h3>
                <p style={styles.club}>By {event.clubId?.name || 'Unknown Club'}</p>

                <div style={styles.details}>
                    <div style={styles.detailItem}>
                        <FaCalendarAlt style={styles.icon} />
                        <span>{format(new Date(event.eventDate), 'PPP p')}</span>
                    </div>
                </div>

                <Link to={`/events/${event._id}`} style={styles.button}>
                    View Details
                </Link>
            </div>
        </div>
    );
};

const styles = {
    card: {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
    },
    imageContainer: {
        height: '180px',
        backgroundColor: '#e9ecef',
        position: 'relative'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e3f2fd',
        color: '#007bff',
        fontWeight: 'bold',
        fontSize: '1.2rem'
    },
    content: {
        padding: '20px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        fontSize: '0.85rem'
    },
    category: {
        color: '#6c757d',
        textTransform: 'uppercase',
        fontWeight: '600',
        fontSize: '0.75rem',
        letterSpacing: '0.5px'
    },
    status: (status) => ({
        color: status === 'upcoming' ? '#28a745' : status === 'ongoing' ? '#ffc107' : '#dc3545',
        fontWeight: '600',
        textTransform: 'capitalize'
    }),
    title: {
        margin: '0 0 5px 0',
        fontSize: '1.25rem',
        color: '#333',
        lineHeight: '1.4'
    },
    club: {
        color: 'var(--primary-color)',
        fontSize: '0.9rem',
        marginBottom: '15px'
    },
    details: {
        marginBottom: '20px',
        color: '#555',
        fontSize: '0.9rem'
    },
    detailItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '5px'
    },
    icon: {
        color: '#adb5bd'
    },
    button: {
        marginTop: 'auto',
        display: 'block',
        textAlign: 'center',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        padding: '10px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'background 0.2s'
    }
};

export default EventCard;
