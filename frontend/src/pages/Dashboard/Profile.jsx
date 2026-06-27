import { useState } from 'react';
import { FaUser, FaEnvelope, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card, Input, Button } from '../../components/UI';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await authService.updateProfile(formData);
      updateUser(result.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authService.changePassword(passwordData);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Password change failed' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account information</p>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/50 text-green-400'
              : 'bg-red-500/10 border border-red-500/50 text-red-400'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Profile Information */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleProfileChange}
            icon={<FaUser />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleProfileChange}
            icon={<FaEnvelope />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={<FaSave />}
          >
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <Input
            label="Current Password"
            type="password"
            name="current_password"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            placeholder="Enter current password"
            required
          />

          <Input
            label="New Password"
            type="password"
            name="new_password"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            name="new_password_confirmation"
            value={passwordData.new_password_confirmation}
            onChange={handlePasswordChange}
            placeholder="Confirm new password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={passwordLoading}
          >
            Update Password
          </Button>
        </form>
      </Card>

      {/* Account Stats */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-6">Account Details</h2>
        <div className="space-y-4 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Account Type:</span>
            <span className="font-medium">{user?.role || 'User'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Member Since:</span>
            <span className="font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Email Verified:</span>
            <span className="font-medium">
              {user?.email_verified_at ? '✓ Verified' : '✗ Not Verified'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
