import { useState } from 'react';
import { FaUser, FaSearch, FaBan, FaCheck, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../../components/UI';

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', conversions: 145, joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', conversions: 89, joined: '2024-01-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'admin', status: 'active', conversions: 234, joined: '2024-01-10' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'user', status: 'suspended', conversions: 12, joined: '2024-02-01' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', status: 'active', conversions: 67, joined: '2024-01-25' },
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSuspendUser = (userId) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
        : user
    ));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">Manage and monitor all user accounts</p>
        </div>
        <Button variant="primary" icon={<FaUser />}>
          Add New User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <p className="text-slate-400 text-sm mb-1">Total Users</p>
          <p className="text-3xl font-bold text-white">{users.length}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm mb-1">Active Users</p>
          <p className="text-3xl font-bold text-green-400">
            {users.filter(u => u.status === 'active').length}
          </p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm mb-1">Suspended</p>
          <p className="text-3xl font-bold text-red-400">
            {users.filter(u => u.status === 'suspended').length}
          </p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm mb-1">Admins</p>
          <p className="text-3xl font-bold text-purple-400">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">User</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Role</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Conversions</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Joined</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-400 font-bold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.role === 'admin' ? 'primary' : 'default'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{user.conversions}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {new Date(user.joined).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleSuspendUser(user.id)}
                        className={`p-2 rounded transition ${
                          user.status === 'active'
                            ? 'text-yellow-400 hover:bg-yellow-400/10'
                            : 'text-green-400 hover:bg-green-400/10'
                        }`}
                        title={user.status === 'active' ? 'Suspend' : 'Activate'}
                      >
                        {user.status === 'active' ? <FaBan /> : <FaCheck />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded transition"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;
