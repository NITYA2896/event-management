import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

const CreateEvent = () => {
    const { id } = useParams(); // If ID exists, we are editing
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Technical',
        eventDate: '',
        registrationDeadline: '',
        maxParticipants: '',
        teamSize: 1,
        posterImage: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            const fetchEvent = async () => {
                const { data } = await api.get(`/events/${id}`);
                setFormData({
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    eventDate: data.eventDate.substring(0, 16), // Format for datetime-local
                    registrationDeadline: data.registrationDeadline.substring(0, 16),
                    maxParticipants: data.maxParticipants,
                    teamSize: data.teamSize || 1,
                    posterImage: data.posterImage
                });
            };
            fetchEvent();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                await api.put(`/events/${id}`, formData);
            } else {
                await api.post('/events', formData);
            }
            navigate('/club-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '20px' }}>{isEditMode ? 'Edit Event' : 'Create New Event'}</h2>
                {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label>Event Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required style={styles.input} />
                    </div>

                    <div style={styles.formGroup}>
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required style={{ ...styles.input, height: '100px' }} />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} style={styles.input}>
                                <option value="Technical">Technical</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Sports">Sports</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={styles.col}>
                            <label>Max Participants</label>
                            <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} required style={styles.input} />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label>Event Date & Time</label>
                            <input type="datetime-local" name="eventDate" value={formData.eventDate} onChange={handleChange} required style={styles.input} />
                        </div>
                        <div style={styles.col}>
                            <label>Registration Deadline</label>
                            <input type="datetime-local" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} required style={styles.input} />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label>Team Size (1 for Individual)</label>
                            <input type="number" name="teamSize" value={formData.teamSize || 1} min="1" onChange={handleChange} required style={styles.input} />
                        </div>
                        <div style={styles.col}>
                            {/* Spacer */}
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label>Poster Image URL</label>
                        <input type="text" name="posterImage" value={formData.posterImage} onChange={handleChange} placeholder="https://example.com/image.jpg" style={styles.input} />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    formGroup: { marginBottom: '20px' },
    input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ced4da', marginTop: '5px' },
    row: { display: 'flex', gap: '20px', marginBottom: '20px' },
    col: { flex: 1 }
};

export default CreateEvent;
