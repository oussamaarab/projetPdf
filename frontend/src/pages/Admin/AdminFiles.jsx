import { useState } from 'react';
import { FaFileAlt, FaSearch, FaDownload, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card, Badge } from '../../components/UI';

const AdminFiles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const [files, setFiles] = useState([
    { id: 1, filename: 'document.pdf', user: 'john@example.com', type: 'PDF', size: '2.5 MB', tool: 'PDF to Word', status: 'completed', date: '2024-01-20' },
    { id: 2, filename: 'image.jpg', user: 'jane@example.com', type: 'Image', size: '1.2 MB', tool: 'Compress Image', status: 'completed', date: '2024-01-20' },
    { id: 3, filename: 'video.mp4', user: 'bob@example.com', type: 'Video', size: '45.8 MB', tool: 'Compress Video', status: 'processing', date: '2024-01-20' },
    { id: 4, filename: 'presentation.pptx', user: 'alice@example.com', type: 'Document', size: '8.3 MB', tool: 'PPT to PDF', status: 'completed', date: '2024-01-19' },
    { id: 5, filename: 'audio.mp3', user: 'charlie@example.com', type: 'Audio', size: '5.6 MB', tool: 'MP3 to WAV', status: 'failed', date: '2024-01-19' },
  ]);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || file.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const handleDeleteFile = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setFiles(files.filter(file => file.id !== fileId));
    }
  };

  const getTotalSize = () => {
    const total = files.reduce((acc, file) => {
      const size = parseFloat(file.size);
      return acc + size;
    }, 0);
    return total.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">File Management</h1>
          <p className="text-slate-400">Monitor and manage all uploaded files</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <p className="text-slate-400 text-sm mb-1">Total Files</p>
          <p className="text-3xl font-bold text-white">{files.length}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm mb-1">Total Size</p>
          <p className="text-3xl font-bold text-purple-400">{getTotalSize()} MB</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm mb-1">Processing</p>
          <p className="text-3xl font-bold text-yellow-400">
            {files.filter(f => f.status === 'processing').length}
          </p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm mb-1">Completed Today</p>
          <p className="text-3xl font-bold text-green-400">
            {files.filter(f => f.status === 'completed' && f.date === '2024-01-20').length}
          </p>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="document">Document</option>
        </select>
      </div>

      {/* Files Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">File</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">User</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Type</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Size</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Tool</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Date</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file, index) => (
                <motion.tr
                  key={file.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <FaFileAlt className="text-purple-400" />
                      <span className="text-white font-medium">{file.filename}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{file.user}</td>
                  <td className="py-3 px-4">
                    <Badge variant="default">{file.type}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{file.size}</td>
                  <td className="py-3 px-4 text-slate-300">{file.tool}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        file.status === 'completed' ? 'success' :
                        file.status === 'processing' ? 'warning' : 'danger'
                      }
                    >
                      {file.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {new Date(file.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {file.status === 'completed' && (
                        <button
                          className="p-2 text-green-400 hover:bg-green-400/10 rounded transition"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file.id)}
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

export default AdminFiles;
