import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout, uploadPhoto } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        await uploadPhoto(reader.result as string);
        setProfileOpen(false);
      } catch (err) {
        console.error("Photo upload failed", err);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/facilities', label: 'Facilities' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/rules', label: 'Rules' },
    { path: '/contact', label: 'Contact' },
  ];

  if (user) {
    navLinks.push({ path: '/rooms', label: 'Rooms' });
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Link to="/" className="navbar-brand">
        <Logo size={32} />
        <span>Hostel Sphere</span>
      </Link>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {menuOpen && (
          <div className="navbar-auth-mobile">
            {user ? (
              <>
                <div className="mobile-welcome">
                  👋 {user.name}
                </div>
                <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>

      <div className="navbar-auth">
        {user ? (
          <>
            <div className="profile-menu-container" ref={notifRef}>
              <div 
                className="profile-avatar-btn notif-btn" 
                onClick={() => setNotifOpen(!notifOpen)}
              >
                🔔
                {(user.notifications?.filter((n: any) => !n.read)?.length || 0) > 0 && (
                  <span className="notif-badge">
                    {user.notifications?.filter((n: any) => !n.read)?.length}
                  </span>
                )}
              </div>
              
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    className="profile-dropdown notif-dropdown"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  >
                    <div className="dropdown-header-title">
                      Notifications
                    </div>
                    <div className="notif-list">
                      {(!user.notifications || user.notifications.length === 0) ? (
                        <div className="empty-state">No new updates</div>
                      ) : (
                        user.notifications.slice().reverse().map((n: any) => (
                          <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-desc">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="profile-menu-container" ref={profileRef}>
              <div
                className="profile-avatar-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="profile-img-small" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>

              <label htmlFor="profile-photo-upload" className="hidden-file-input">Upload Profile Photo</label>
              <input
                id="profile-photo-upload"
                type="file"
                ref={fileInputRef}
                className="hidden-file-input"
                accept="image/*"
                onChange={handleFileChange}
                title="Upload Profile Photo"
              />

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="profile-dropdown profile-menu"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="profile-dropdown-header p-1-5">
                      <div 
                        className={`profile-avatar-large avatar-xl ${uploading ? 'uploading' : ''}`}
                        onClick={handlePhotoClick}
                        title="Click to change photo"
                      >
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt="Profile" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                        <div className="avatar-overlay">📷</div>
                      </div>
                      <div className="profile-dropdown-info">
                        <h4 className="profile-name">{user.name}</h4>
                        <div className="profile-id">
                           ID: {user._id?.toString().slice(-8).toUpperCase()}
                        </div>
                        <p className="profile-email">{user.email}</p>
                      </div>
                    </div>

                    <div className="profile-dropdown-body dropdown-body-padded">
                      <Link to="/profile" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                        👤 My Profile
                      </Link>

                      {user.role !== 'admin' ? (
                        <Link to="/dashboard" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                          📊 My Dashboard
                        </Link>
                      ) : (
                        <Link to="/admin" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                          🏨 Admin Panel
                        </Link>
                      )}

                      <hr className="dropdown-divider" />
                      
                      <button className="profile-dropdown-item text-danger" onClick={handleLogout}>
                        🚪 Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        )}
      </div>

      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span className={menuOpen ? 'hamburger-line open-1' : 'hamburger-line'} />
        <span className={menuOpen ? 'hamburger-line open-2' : 'hamburger-line'} />
        <span className={menuOpen ? 'hamburger-line open-3' : 'hamburger-line'} />
      </div>
    </motion.nav>
  );
};

export default Navbar;
