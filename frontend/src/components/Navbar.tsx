import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, uploadPhoto } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '' });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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

    // Validate size (limit to 2MB for base64 storage)
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
    { path: '/rooms', label: 'Rooms' },
    { path: '/facilities', label: 'Facilities' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/rules', label: 'Rules' },
    { path: '/contact', label: 'Contact' },
  ];

  if (user) {
    if (user.role === 'admin') {
      navLinks.push({ path: '/admin', label: 'Dashboard' });
    } else {
      navLinks.push({ path: '/dashboard', label: 'Dashboard' });
      navLinks.push({ path: '/complaints', label: 'Complaints' });
    }
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password changed successfully! 🔐");
    setShowPasswordChange(false);
    setPasswords({ old: '', new: '' });
  };

  return (
    <motion.nav
      className="navbar"
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
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>
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
            {/* Notifications */}
            <div className="profile-menu-container" ref={notifRef}>
              <div 
                className="profile-avatar-btn" 
                style={{ fontSize: '1rem', background: 'transparent', border: '1px solid var(--border-glass)' }}
                onClick={() => setNotifOpen(!notifOpen)}
              >
                🔔
                {(user.notifications?.filter((n: any) => !n.read).length || 0) > 0 && (
                  <span style={{ 
                    position: 'absolute', top: '-5px', right: '-5px', 
                    background: 'var(--accent-rose)', color: 'white', 
                    fontSize: '0.6rem', padding: '2px 5px', borderRadius: '10px', fontWeight: 800 
                  }}>
                    {user.notifications?.filter((n: any) => !n.read).length}
                  </span>
                )}
              </div>
              
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    className="profile-dropdown"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    style={{ width: '280px', right: 0 }}
                  >
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-glass)', fontWeight: 800, fontSize: '0.9rem' }}>
                      Notifications
                    </div>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {(!user.notifications || user.notifications.length === 0) ? (
                        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No new updates</div>
                      ) : (
                        user.notifications.slice().reverse().map((n: any) => (
                          <div key={n.id} style={{ 
                            padding: '1.25rem', 
                            borderBottom: '1px solid var(--border-glass)',
                            background: n.read ? 'transparent' : 'rgba(255,255,255,0.03)'
                          }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{n.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
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

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="profile-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{ width: '300px' }}
                  >
                    <div className="profile-dropdown-header" style={{ padding: '1.5rem' }}>
                      <div 
                        className={`profile-avatar-large ${uploading ? 'uploading' : ''}`}
                        onClick={handlePhotoClick}
                        title="Click to change photo"
                        style={{ width: '70px', height: '70px', fontSize: '1.8rem' }}
                      >
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt="Profile" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                        <div className="avatar-overlay">📷</div>
                      </div>
                      <div className="profile-dropdown-info">
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{user.name}</h4>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                           ID: {user._id.substring(user._id.length - 8).toUpperCase()}
                        </div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{user.email}</p>
                      </div>
                    </div>

                    <div className="profile-dropdown-body" style={{ padding: '0 1rem 1rem' }}>
                      {/* Theme Switcher */}
                      <div className="theme-switcher">
                        <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>🌙 Dark</button>
                        <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>☀️ Light</button>
                      </div>

                      {user.role !== 'admin' ? (
                        <Link to="/dashboard" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                          📊 My Dashboard
                        </Link>
                      ) : (
                        <Link to="/admin" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                          🏨 Admin Panel
                        </Link>
                      )}

                      <button className="profile-dropdown-item" onClick={() => setShowPasswordChange(!showPasswordChange)}>
                        🔐 Change Password
                      </button>

                      <AnimatePresence>
                        {showPasswordChange && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <form className="password-form" onSubmit={handlePasswordChange}>
                              <input type="password" placeholder="Old Password" className="form-input" style={{ fontSize: '0.8rem', padding: '8px' }} required value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} />
                              <input type="password" placeholder="New Password" className="form-input" style={{ fontSize: '0.8rem', padding: '8px' }} required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                              <button type="submit" className="btn btn-primary btn-sm">Update</button>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '0.5rem 0' }} />
                      
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
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        )}
      </div>

      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span style={menuOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
        <span style={menuOpen ? { opacity: 0 } : {}} />
        <span style={menuOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
      </div>
    </motion.nav>
  );
};

export default Navbar;
