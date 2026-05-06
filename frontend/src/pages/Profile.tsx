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
    <div className="profile-page pt-32 min-h-screen hero-bg">
      <div className="section max-w-900">
        <motion.div 
          className="glass-card p-0 overflow-hidden" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-banner">
             <div 
               className="profile-avatar"
               onClick={() => fileInputRef.current?.click()}
             >
               {user.profilePhoto ? (
                 <img src={user.profilePhoto} alt="User Profile" title="User Profile" className="w-full h-full object-cover" />
               ) : (
                 user.name.charAt(0).toUpperCase()
               )}
               <div className={`avatar-overlay ${uploading ? 'opacity-100' : 'opacity-0'}`}>
                 {uploading ? <div className="spinner"></div> : '📷'}
               </div>
             </div>
             <label htmlFor="profile-photo-upload" className="hidden-file-input">Upload Profile Photo</label>
             <input id="profile-photo-upload" title="Upload Profile Photo" type="file" ref={fileInputRef} className="hidden-file-input" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="profile-content">
            <div className="flex-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl mb-1">{user.name}</h1>
                <p className="text-secondary">{user.email}</p>
                <div className="flex gap-4 mt-4">
                  <span className="badge-glass">
                    Role: <strong className="text-purple">{user.role.toUpperCase()}</strong>
                  </span>
                  <span className="badge-glass">
                    ID: <strong>#{user._id?.toString().slice(-6)}</strong>
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleTheme('light')}>☀️ Light</button>
                <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleTheme('dark')}>🌙 Dark</button>
              </div>
            </div>

            <div className="tabs mt-12 border-b-glass flex-start">
              <button className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Personal Info</button>
              <button className={`tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security</button>
            </div>

            <div className="mt-10">
              {activeTab === 'settings' && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleUpdateProfile} className="grid-gap-6 max-w-500">
                  <div className="form-group">
                    <label htmlFor="profile-name">Full Name</label>
                    <input 
                      id="profile-name" title="Full Name" placeholder="Your Name"
                      type="text" 
                      className="form-input" 
                      value={profileData.name} 
                      onChange={e => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile-phone">Phone Number</label>
                    <input 
                      id="profile-phone" title="Phone Number" placeholder="Your Phone Number"
                      type="text" 
                      className="form-input" 
                      value={profileData.phone}
                      onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-fit">Save Changes</button>
                </motion.form>
              )}

              {activeTab === 'security' && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleChangePassword} className="grid-gap-6 max-w-500">
                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input 
                      id="new-password" title="New Password"
                      type="password" 
                      className="form-input" 
                      placeholder="Enter new password"
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <input 
                      id="confirm-password" title="Confirm New Password"
                      type="password" 
                      className="form-input" 
                      placeholder="Repeat new password"
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-fit">Update Password</button>
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
