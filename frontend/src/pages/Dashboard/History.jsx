import { useCallback, useEffect, useState } from 'react';
import { FaFileAlt, FaDownload, FaTrash, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card, Badge } from '../../components/UI';
import toolService from '../../services/toolService';

const History = () => {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await toolService.getHistory(currentPage, 10);
      setConversions(data.data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this conversion?')) return;
    
    try {
      await toolService.deleteConversion(id);
      setConversions(conversions.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete conversion:', error);
    }
  };

  const filteredConversions = conversions.filter(c =>
    c.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Conversion History</h1>
          <p className="text-slate-400">View and manage your past conversions</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* History Table */}
      <Card>
        {filteredConversions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">File</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Tool</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Date</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConversions.map((conversion, index) => (
                  <motion.tr
                    key={conversion.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-purple-400" />
                        <span className="text-white font-medium">{conversion.filename}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{conversion.tool_name}</td>
                    <td className="py-3 px-4">
                      <Badge variant={conversion.status === 'completed' ? 'success' : 'warning'}>
                        {conversion.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(conversion.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-green-400 hover:bg-green-400/10 rounded transition"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => handleDelete(conversion.id)}
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
        ) : (
          <div className="text-center py-12">
            <FaFileAlt className="text-4xl text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No conversions found</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default History;
