import { FaUsers, FaFileAlt, FaServer, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card, Badge } from '../../components/UI';

const AdminDashboard = () => {
  const stats = [
    { icon: FaUsers, label: 'Total Users', value: '2,543', change: '+12%', color: 'blue' },
    { icon: FaFileAlt, label: 'Total Conversions', value: '45.2K', change: '+8%', color: 'green' },
    { icon: FaServer, label: 'Storage Used', value: '1.2 TB', change: '+5%', color: 'purple' },
    { icon: FaChartLine, label: 'API Requests', value: '128K', change: '+15%', color: 'orange' },
  ];

  const recentActivity = [
    { user: 'john@example.com', action: 'Converted PDF to Word', time: '2 minutes ago' },
    { user: 'jane@example.com', action: 'Compressed image', time: '5 minutes ago' },
    { user: 'bob@example.com', action: 'Merged PDFs', time: '10 minutes ago' },
    { user: 'alice@example.com', action: 'Split PDF', time: '15 minutes ago' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">System overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-600/20 flex items-center justify-center`}>
                  <stat.icon className={`text-xl text-${stat.color}-400`} />
                </div>
                <Badge variant="success">{stat.change}</Badge>
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{activity.user}</p>
                <p className="text-slate-400 text-sm">{activity.action}</p>
              </div>
              <span className="text-slate-500 text-sm">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* System Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Server Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">API Server</span>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Database</span>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Storage</span>
              <Badge variant="success">Online</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Users (24h)</span>
              <span className="text-white font-medium">1,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Conversions (24h)</span>
              <span className="text-white font-medium">8,456</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Response Time</span>
              <span className="text-white font-medium">245ms</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
