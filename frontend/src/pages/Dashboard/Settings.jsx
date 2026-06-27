import { useState } from 'react';
import { FaKey, FaCopy, FaPlus, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card, Button, Badge } from '../../components/UI';

const Settings = () => {
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production Key', key: 'sk_live_1234567890abcdef', created: '2024-01-15', lastUsed: '2024-01-20' },
  ]);

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    alert('API key copied to clipboard!');
  };

  const handleGenerateKey = () => {
    const newKey = {
      id: Date.now(),
      name: 'New API Key',
      key: `sk_live_${Math.random().toString(36).substring(2, 18)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleDeleteKey = (id) => {
    if (window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Settings</h1>
        <p className="text-slate-400">Manage your API keys and integration settings</p>
      </div>

      {/* API Keys */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">API Keys</h2>
          <Button
            variant="primary"
            size="sm"
            icon={<FaPlus />}
            onClick={handleGenerateKey}
          >
            Generate New Key
          </Button>
        </div>

        <div className="space-y-4">
          {apiKeys.map((apiKey, index) => (
            <motion.div
              key={apiKey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <FaKey className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{apiKey.name}</h3>
                    <p className="text-slate-400 text-sm">Created: {apiKey.created}</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 px-3 py-2 bg-black/30 rounded text-slate-300 text-sm font-mono overflow-x-auto">
                  {apiKey.key}
                </code>
                <button
                  onClick={() => handleCopyKey(apiKey.key)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-white transition"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Last used: {apiKey.lastUsed}</span>
                <button
                  onClick={() => handleDeleteKey(apiKey.id)}
                  className="text-red-400 hover:text-red-300 transition flex items-center gap-2"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* API Documentation */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">API Documentation</h2>
        <p className="text-slate-300 mb-4">
          Use our RESTful API to integrate ConvertHub into your applications.
        </p>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-white/5 rounded">
            <code className="text-purple-400">GET /api/tools</code>
            <p className="text-slate-400 mt-1">Get list of available conversion tools</p>
          </div>
          <div className="p-3 bg-white/5 rounded">
            <code className="text-purple-400">POST /api/convert</code>
            <p className="text-slate-400 mt-1">Submit a file for conversion</p>
          </div>
          <div className="p-3 bg-white/5 rounded">
            <code className="text-purple-400">GET /api/conversions/:id</code>
            <p className="text-slate-400 mt-1">Get conversion status and download link</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-6">
          View Full Documentation →
        </Button>
      </Card>

      {/* Rate Limits */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Rate Limits</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Requests this month</span>
              <span className="text-white font-medium">1,250 / 10,000</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 w-[12.5%]"></div>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            <p>• Free plan: 100 requests/month</p>
            <p>• Pro plan: 10,000 requests/month</p>
            <p>• Enterprise plan: Unlimited requests</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
