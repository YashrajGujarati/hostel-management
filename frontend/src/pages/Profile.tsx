import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import API from '../apiConfig';

const Profile = () => {
  const { user, uploadPhoto } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');
  const [uploading, setUploading] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(`${API}/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      await axios.patch(`${API}/auth/profile`, { password: passwords.new }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Password changed successfully!");
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password change failed");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        await uploadPhoto(reader.result as string);
        toast.success("Photo uploaded!");
      } catch (err) {
        toast.error("Upload failed");
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleTheme = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    try {
      await axios.patch(`${API}/auth/profile`, { theme: newTheme }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch {}
  };

  return (
    <div className="profile-page" style={{ paddingTop: '8rem', minHeight: '100vh', background: 'var(--gradient-hero)' }}>
      <div className="section" style={{ maxWidth: '900px' }}>
        <motion.div 
          className="glass-card" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '0', overflow: 'hidden' }}
        >
          <div style={{ background: 'var(--gradient-accent)', height: '150px', position: 'relative' }}>
             <div 
               style={{ 
                 position: 'absolute', bottom: '-50px', left: '40px',
                 width: '120px', height: '120px', borderRadius: '50%',
                 border: '5px solid var(--bg-primary)', background: 'var(--gradient-primary)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 fontSize: '3rem', fontWeight: 800, color: 'white', overflow: 'hidden',
                 cursor: 'pointer', transition: '0.3s'
               }}
               onClick={() => fileInputRef.current?.click()}
             >
               {user.profilePhoto ? (
                 <img src={user.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 user.name.charAt(0).toUpperCase()
               )}
               <div className="avatar-overlay" style={{ opacity: uploading ? 1 : 0 }}>
                 {uploading ? <div className="spinner"></div> : '📷'}
               </div>
             </div>
             <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
          </div>

          <div style={{ padding: '70px 40px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{user.name}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', background: 'var(--bg-glass)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                    Role: <strong style={{ color: 'var(--accent-purple)' }}>{user.role.toUpperCase()}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', background: 'var(--bg-glass)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                    ID: <strong>#{user._id?.toString().slice(-6)}</strong>
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleTheme('light')}>☀️ Light</button>
                <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleTheme('dark')}>🌙 Dark</button>
              </div>
            </div>

            <div className="tabs" style={{ marginTop: '3rem', borderBottom: '1px solid var(--border-glass)', justifyContent: 'flex-start' }}>
              <button className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Personal Info</button>
              <button className={`tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security</button>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              {activeTab === 'settings' && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '1.5rem', maxWidth: '500px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={profileData.name} 
                      onChange={e => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={profileData.phone}
                      onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Save Changes</button>
                </motion.form>
              )}

              {activeTab === 'security' && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleChangePassword} style={{ display: 'grid', gap: '1.5rem', maxWidth: '500px' }}>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Enter new password"
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Repeat new password"
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Update Password</button>
                </motion.form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
