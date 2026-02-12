import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder pages (will be implemented next)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import MyRegistrations from './pages/MyRegistrations';
import ClubDashboard from './pages/ClubDashboard';
import CreateEvent from './pages/CreateEvent';
import EventRegistrations from './pages/EventRegistrations';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="container" style={{ padding: '20px 0' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Student/Common Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/events/:id" element={<EventDetails />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/my-registrations" element={<MyRegistrations />} />
            </Route>

            {/* Club Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['clubAdmin']} />}>
              <Route path="/club-dashboard" element={<ClubDashboard />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/events/edit/:id" element={<CreateEvent />} />
              <Route path="/event-registrations/:id" element={<EventRegistrations />} />
            </Route>

            {/* Super Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['superAdmin']} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>

          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;
