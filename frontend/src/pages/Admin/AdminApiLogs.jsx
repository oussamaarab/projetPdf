import { useState } from 'react';
import { FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card, Badge } from '../../components/UI';

const AdminApiLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const logs = [
    { id: 1, method: 'POST', endpoint: '/api/convert', user: 'john@example.com', status: 200, responseTime: 234, timestamp: '2024-01-20 14:30:22' },
    { id: 2, method: 'GET', endpoint: '/api/tools', user: 'jane@example.com', status: 200, responseTime: 45, timestamp: '2024-01-20 14:30:15' },
    { id: 3, method: 'POST', endpoint: '/api/convert', user: 'bob@example.com', status: 500, responseTime: 1234, timestamp: '2024-01-20 14:29:58' },
    { id: 4, method: 'GET', endpoint: '/api/conversions/123', user: 'alice@example.com', status: 404, responseTime: 89, timestamp: '2024-01-20 14:29:45' },
    { id: 5, method: 'DELETE', endpoint: '/api/conversions/456', user: 'charlie@example.com', status: 200, responseTime: 156, timestamp: '2024-01-20 14:29:30' },
    { id: 6, method: 'POST', endpoint: '/api/login', user: 'anonymous', status: 401, responseTime: 234, timestamp: '2024-01-20 14:28:12' },
    { id: 7, method: 'GET', endpoint: '/api/user', user: 'john@example.com', status: 200, responseTime: 67, timestamp: '2024-01-20 14:27:45' },
    { id: 8, method: 'PUT', endpoint: '/api/user/profile', user: 'jane@example.com', status: 200, responseTime: 198, timestamp: '2024-01-20 14:27:22' },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'success' && log.status >= 200 && log.status < 300) ||
                         (filterStatus === 'error' && (log.status >= 400 || log.status >= 500));
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) return { variant: 'success', label: status };
    if (status >= 400 && status < 500) return { variant: 'warning', label: status };
    if (status >= 500) return { variant: 'danger', label: status };
    return { variant: 'default', label: status };
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'text-blue-400';
      case 'POST': return 'text-green-400';
      case 'PUT': return 'text-yellow-400';
      case 'DELETE': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status >= 200 && l.status < 300).length,
    errors: logs.filter(l => l.status >= 400).length,
    avgResponseTime: Math.round(logs.reduce((acc, l) => acc + l.responseTime, 0) / logs.length),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Logs</h1>
          <p className="text-slate-400">Monitor API requests and system activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <p className="text-slate-400 text-sm mb-1">Total Requests</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm mb-1">Successful</p>
          <p className="text-3xl font-bold text-green-400">{stats.success}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm mb-1">Errors</p>
          <p className="text-3xl font-bold text-red-400">{stats.errors}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm mb-1">Avg Response</p>
          <p className="text-3xl font-bold text-purple-400">{stats.avgResponseTime}ms</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="success">Success (2xx)</option>
          <option value="error">Errors (4xx, 5xx)</option>
        </select>
      </div>

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Method</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Endpoint</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">User</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Time (ms)</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-3 px-4">
                    <span className={`font-mono font-bold ${getMethodColor(log.method)}`}>
                      {log.method}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <code className="text-slate-300 text-sm">{log.endpoint}</code>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{log.user}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusBadge(log.status).variant}>
                      {getStatusBadge(log.status).label}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className={log.responseTime > 1000 ? 'text-red-400' : 'text-slate-300'}>
                      {log.responseTime}
                      {log.responseTime > 1000 && (
                        <FaExclamationTriangle className="inline ml-2 text-yellow-400" />
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-sm">{log.timestamp}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Error Alert */}
      {stats.errors > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-400 text-xl mt-1" />
            <div>
              <h3 className="text-red-400 font-bold mb-1">Error Detection</h3>
              <p className="text-slate-300 text-sm">
                {stats.errors} error{stats.errors !== 1 ? 's' : ''} detected in recent requests. 
                Please review and address any critical issues.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminApiLogs;
