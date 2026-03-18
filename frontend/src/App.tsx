import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Rooms from './pages/Rooms';
import FoodMenu from './pages/FoodMenu';
import StudentDashboard from './pages/StudentDashboard';
import Complaints from './pages/Complaints';
import FeePayment from './pages/FeePayment';
import AdminDashboard from './pages/AdminDashboard';
import AboutUs from './pages/AboutUs';
import Facilities from './pages/Facilities';
import Gallery from './pages/Gallery';
import ContactUs from './pages/ContactUs';
import Booking from './pages/Booking';
import Rules from './pages/Rules';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import './index.css';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/facilities" element={<Facilities />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/book" element={<Booking />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
      <Route path="/food-menu" element={<FoodMenu />} />
      <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
      <Route path="/pay-fees" element={<ProtectedRoute><FeePayment /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};



function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Navbar />
        <AppRoutes />
        <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#111827', color: '#fff', border: '1px solid var(--border-glass)' } }} />
      </AuthProvider>
    </Router>
  );
}

export default App;
