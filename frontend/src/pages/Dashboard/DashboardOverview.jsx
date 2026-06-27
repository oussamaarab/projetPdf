import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaDownload, FaClock, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card, Badge } from '../../components/UI';
import toolService from '../../services/toolService';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalConversions: 0,
    thisMonth: 0,
    bytesSaved: 0,
    avgTime: 0,
  });
  const [recentConversions, setRecentConversions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch recent conversion history
      const historyData = await toolService.getHistory(1, 5);
      setRecentConversions(historyData.data || []);
      
      // Mock stats (replace with actual API call)
      setStats({
        totalConversions: historyData.total || 0,
        thisMonth: 12,
        bytesSaved: 245000000, // bytes
        avgTime: 3.5, // seconds
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      icon: FaFileAlt,
      label: 'Total Conversions',
      value: stats.totalConversions,
      color: 'purple',
    },
    {
      icon: FaChartLine,
      label: 'This Month',
      value: stats.thisMonth,
      color: 'blue',
    },
    {
      icon: FaDownload,
      label: 'Data Saved',
      value: `${(stats.bytesSaved / 1000000).toFixed(1)} MB`,
      color: 'green',
    },
    {
      icon: FaClock,
      label: 'Avg. Time',
      value: `${stats.avgTime}s`,
      color: 'orange',
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back! Here's your conversion activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-600/20 flex items-center justify-center`}>
                  <stat.icon className={`text-xl text-${stat.color}-400`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Conversions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Conversions</h2>
          <Link to="/history" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
            View All →
          </Link>
        </div>

        {recentConversions.length > 0 ? (
          <div className="space-y-4">
            {recentConversions.map((conversion) => (
              <div
                key={conversion.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <FaFileAlt className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{conversion.filename}</p>
                    <p className="text-slate-400 text-sm">{conversion.tool_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={conversion.status === 'completed' ? 'success' : 'warning'}>
                    {conversion.status}
                  </Badge>
                  <p className="text-slate-400 text-xs mt-1">
                    {formatDate(conversion.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaFileAlt className="text-4xl text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No conversions yet</p>
            <Link
              to="/all-tools"
              className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Start Converting
            </Link>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/tool/pdf-to-word"
            className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition text-center"
          >
            <div className="text-3xl mb-2">📄</div>
            <p className="text-white font-medium">PDF to Word</p>
          </Link>
          <Link
            to="/tool/compress-pdf"
            className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition text-center"
          >
            <div className="text-3xl mb-2">🗜️</div>
            <p className="text-white font-medium">Compress PDF</p>
          </Link>
          <Link
            to="/tool/jpg-to-png"
            className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition text-center"
          >
            <div className="text-3xl mb-2">🖼️</div>
            <p className="text-white font-medium">JPG to PNG</p>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default DashboardOverview;
