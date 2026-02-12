import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { FaDownload } from 'react-icons/fa';

const EventRegistrations = () => {
    const { id } = useParams();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const { data } = await api.get(`/registrations/event/${id}`);
                setRegistrations(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, [id]);

    const handleExport = async () => {
        try {
            const response = await api.get(`/registrations/export/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `registrations-${id}.csv`); // Filename from backend response header ideally
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert('Export failed');
        }
    };

    if (loading) return <div className="container" style={{ padding: '50px' }}>Loading...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Event Registrations</h1>
                <button onClick={handleExport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaDownload /> Export CSV
                </button>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                            <th style={{ padding: '10px' }}>Name</th>
                            <th style={{ padding: '10px' }}>Email</th>
                            <th style={{ padding: '10px' }}>Registration Date</th>
                            <th style={{ padding: '10px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.map(reg => (
                            <tr key={reg._id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                <td style={{ padding: '10px' }}>{reg.userId.name}</td>
                                <td style={{ padding: '10px' }}>{reg.userId.email}</td>
                                <td style={{ padding: '10px' }}>{new Date(reg.registeredAt).toLocaleString()}</td>
                                <td style={{ padding: '10px' }}>{reg.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {registrations.length === 0 && <p style={{ padding: '20px', textAlign: 'center' }}>No registrations yet.</p>}
            </div>
        </div>
    );
};

export default EventRegistrations;
