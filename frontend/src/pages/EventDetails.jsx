import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrations, setRegistrations] = useState([]);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationCount, setRegistrationCount] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchEventDetails = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/events/${id}`);
            setEvent(data);

            // If user is logged in, check if they are registered
            if (user && user.role === 'student') {
                const regs = await api.get('/registrations/my');
                const myReg = regs.data.find(r => r.eventId._id === id && r.status === 'registered');
                setIsRegistered(!!myReg);
            }

            // Get registration count (This endpoint might need to be public or we assume maxParticipants is enough context, 
            // but ideally we want to show 'X spots left'. 
            // I'll skip accurate count fetch for public for now unless I add a specific public endpoint for stats.
            // Wait, I can't easily get count without an endpoint.
            // Let's rely on backend validation for "Full" but UI might not show precise number if not admin.
            // Actually, let's just use a dummy progress or hide it if we can't get it. 
            // OR I can update the Get Event endpoint to return registration count!
            // I didn't update the backend for that. I'll skip the progress bar generic count for now and focus on status.)

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [id, user]);

    const [teamMembers, setTeamMembers] = useState([]);
    const [showTeamForm, setShowTeamForm] = useState(false);

    useEffect(() => {
        if (event && event.teamSize > 1) {
            // Initialize team members array with empty objects for members 2 to N
            // Use Array.from for safety and explicit number conversion
            const size = Math.max(0, Number(event.teamSize) - 1);
            setTeamMembers(Array.from({ length: size }, () => ({ name: '', email: '', regNo: '', mobile: '' })));
        }
    }, [event]);

    const handleTeamMemberChange = (index, field, value) => {
        const updatedMembers = [...teamMembers];
        updatedMembers[index] = { ...updatedMembers[index], [field]: value };
        setTeamMembers(updatedMembers);
    };

    const handleRegister = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        // If team event and form not shown, show it first
        if (event.teamSize > 1 && !showTeamForm) {
            setShowTeamForm(true);
            return;
        }

        try {
            // Filter out empty members (optional members)
            const filledMembers = teamMembers.filter(m => m.name.trim() !== '' || m.email.trim() !== '');

            await api.post('/registrations', {
                eventId: id,
                teamMembers: filledMembers
            });
            setSuccess('Successfully registered!');
            setIsRegistered(true);
            setError('');
            setShowTeamForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleCancel = async () => {
        try {
            const regs = await api.get('/registrations/my');
            const myReg = regs.data.find(r => r.eventId._id === id && r.status === 'registered');

            if (myReg) {
                await api.put(`/registrations/cancel/${myReg._id}`);
                setSuccess('Registration cancelled.');
                setIsRegistered(false);
            }
        } catch (err) {
            setError('Failed to cancel registration');
        }
    };

    if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
    if (!event) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>Event not found</div>;

    const isFull = event.maxParticipants > 0 && registrationCount >= event.maxParticipants;
    const isPastDeadline = new Date() > new Date(event.registrationDeadline);
    const isEventPast = new Date() > new Date(event.eventDate);

    return (
        <div className="container" style={{ marginTop: '30px' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={styles.headerImage}>
                    {event.posterImage ? (
                        <img src={event.posterImage} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={styles.placeholder}>
                            {event.category}
                        </div>
                    )}
                </div>

                <div style={styles.content}>
                    <div style={styles.meta}>
                        <span style={styles.badge}>{event.category}</span>
                        {isEventPast ?
                            <span style={styles.badgeDanger}>Completed</span> :
                            <span style={styles.badgeSuccess}>{event.status}</span>
                        }
                        {event.teamSize > 1 && <span style={{ ...styles.badge, background: '#e2e3e5', color: '#383d41' }}>Team Size: {event.teamSize}</span>}
                    </div>

                    <h1 style={styles.title}>{event.title}</h1>
                    <p style={styles.club}>Organized by {event.clubId?.name}</p>

                    <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                            <FaCalendarAlt style={styles.icon} />
                            <div>
                                <strong>Date & Time</strong>
                                <p>{format(new Date(event.eventDate), 'PPP p')}</p>
                            </div>
                        </div>
                        <div style={styles.infoItem}>
                            <FaClock style={styles.icon} />
                            <div>
                                <strong>Registration Deadline</strong>
                                <p>{format(new Date(event.registrationDeadline), 'PPP p')}</p>
                            </div>
                        </div>
                    </div>

                    <div style={styles.description}>
                        <h3>About this Event</h3>
                        <p>{event.description}</p>
                    </div>

                    {showTeamForm && (
                        <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <h4>Team Registration (Remaining members optional)</h4>
                            <p style={{ marginBottom: '10px' }}><strong>Member 1 (Team Lead):</strong> {user.name} ({user.email}) - <em>Already included</em></p>

                            {teamMembers.map((member, index) => (
                                <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                    <h5 style={{ marginBottom: '10px' }}>Member {index + 2}</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <input
                                            placeholder="Name"
                                            value={member.name}
                                            onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                            style={styles.input}
                                        />
                                        <input
                                            placeholder="Email"
                                            value={member.email}
                                            onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                                            style={styles.input}
                                        />
                                        <input
                                            placeholder="Reg No"
                                            value={member.regNo}
                                            onChange={(e) => handleTeamMemberChange(index, 'regNo', e.target.value)}
                                            style={styles.input}
                                        />
                                        <input
                                            placeholder="Mobile"
                                            value={member.mobile}
                                            onChange={(e) => handleTeamMemberChange(index, 'mobile', e.target.value)}
                                            style={styles.input}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={styles.actionArea}>
                        {error && <div style={styles.error}>{error}</div>}
                        {success && <div style={styles.success}>{success}</div>}

                        {user?.role === 'student' ? (
                            <>
                                {isRegistered ? (
                                    <div style={styles.registeredBox}>
                                        <FaCheckCircle /> You are registered!
                                        {!isEventPast && (
                                            <button onClick={handleCancel} style={styles.cancelLink}>
                                                Cancel Registration
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {isEventPast ? (
                                            <button disabled style={styles.btnDisabled}>Event Completed</button>
                                        ) : isPastDeadline ? (
                                            <button disabled style={styles.btnDisabled}>Registration Closed</button>
                                        ) : (
                                            <button onClick={handleRegister} style={styles.btnRegister}>
                                                {event.teamSize > 1 && !showTeamForm ? 'Enter Team Details' : 'Confirm Registration'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        ) : user?.role === 'clubAdmin' ? (
                            <div style={styles.adminMsg}>
                                You are logged in as a Club Admin. <br />
                                <button onClick={() => navigate('/login')} style={{ ...styles.cancelLink, marginTop: '10px' }}>
                                    Login as Student
                                </button> to register.
                            </div>
                        ) : !user ? (
                            <button onClick={() => navigate('/login')} style={styles.btnRegister}>
                                Login to Register
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    headerImage: {
        height: '300px',
        backgroundColor: '#e9ecef'
    },
    placeholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        color: '#dee2e6',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    content: {
        padding: '30px'
    },
    meta: {
        display: 'flex',
        gap: '10px',
        marginBottom: '15px'
    },
    badge: {
        backgroundColor: '#e3f2fd',
        color: '#0d6efd',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600'
    },
    badgeSuccess: {
        backgroundColor: '#d1e7dd',
        color: '#0f5132',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600'
    },
    badgeDanger: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600'
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '5px',
        color: '#333'
    },
    club: {
        color: '#6c757d',
        fontSize: '1.1rem',
        marginBottom: '30px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    icon: {
        fontSize: '24px',
        color: 'var(--primary-color)'
    },
    description: {
        marginBottom: '40px',
        lineHeight: '1.8',
        color: '#444'
    },
    actionArea: {
        borderTop: '1px solid #dee2e6',
        paddingTop: '30px',
        textAlign: 'center'
    },
    btnRegister: {
        padding: '15px 40px',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.2rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s',
        boxShadow: '0 4px 6px rgba(0,123,255,0.3)'
    },
    btnDisabled: {
        padding: '15px 40px',
        backgroundColor: '#e9ecef',
        color: '#6c757d',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.2rem',
        fontWeight: '600',
        cursor: 'not-allowed'
    },
    registeredBox: {
        backgroundColor: '#d1e7dd',
        color: '#0f5132',
        padding: '20px',
        borderRadius: '8px',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        fontSize: '1.2rem',
        fontWeight: '600'
    },
    cancelLink: {
        background: 'none',
        border: 'none',
        color: '#dc3545',
        textDecoration: 'underline',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    error: {
        color: '#dc3545',
        marginBottom: '10px'
    },
    success: {
        color: '#28a745',
        marginBottom: '10px'
    },
    input: {
        width: '100%',
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #dee2e6'
    },
    adminMsg: {
        padding: '15px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        borderRadius: '8px',
        border: '1px solid #ffeeba',
        textAlign: 'center'
    }
};

export default EventDetails;
