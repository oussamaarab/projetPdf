import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaRedo, FaUpload } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getToolById } from '../services/toolService';
import toolService from '../services/toolService';
import { Button, Card, Badge } from '../components/UI';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getDefaultOptions = (toolId) => {
  switch (toolId) {
    case 'compress-pdf':
    case 'compress-image':
    case 'compress-video':
    case 'compress-audio':
      return { quality: 'medium' };
    case 'resize-image':
      return { width: 800, height: 600, keepAspectRatio: true };
    case 'protect-pdf':
      return { password: '' };
    case 'trim-video':
    case 'trim-audio':
      return { start: 0, end: 0 };
    default:
      return {};
  }
};

const ToolPage = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const tool = useMemo(() => getToolById(toolId), [toolId]);
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [optionsByTool, setOptionsByTool] = useState({});

  const defaultOptions = getDefaultOptions(toolId);
  const options = { ...defaultOptions, ...(optionsByTool[toolId] || {}) };

  const updateOptions = (updates) => {
    setOptionsByTool((current) => ({
      ...current,
      [toolId]: {
        ...defaultOptions,
        ...(current[toolId] || {}),
        ...updates,
      },
    }));
  };

  useEffect(() => {
    if (!tool) {
      navigate('/all-tools');
    }
  }, [tool, navigate]);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError('');
    setConverted(false);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setConverting(true);
    setError('');

    try {
      const response = await toolService.convertFile(toolId, file, options);
      setResult(response);
      setConverted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.id) return;

    try {
      const blob = await toolService.downloadFile(result.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename || 'converted-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Download failed. Please try again.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setConverted(false);
    setResult(null);
    setError('');
  };

  if (!tool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <Link
          to="/all-tools"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition"
        >
          <FaArrowLeft />
          <span>Back to All Tools</span>
        </Link>

        {/* Tool Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-4">{tool.icon}</div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{tool.name}</h1>
          <p className="text-lg text-slate-600">{tool.description}</p>
          <Badge variant="primary" className="mt-4">{tool.category}</Badge>
        </motion.div>

        {/* Main Content */}
        <Card glass={false} className="p-8">
          {!converted ? (
            <>
              {/* Upload Section */}
              <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
                <label className="flex cursor-pointer flex-col items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                    <FaUpload />
                  </span>
                  <span>
                    <span className="block text-lg font-semibold text-slate-900">
                      {file ? 'Replace selected file' : 'Choose a file to convert'}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      Select one file from your device.
                    </span>
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                      const selectedFile = event.target.files?.[0];
                      if (selectedFile) {
                        handleFileSelect(selectedFile);
                      }
                    }}
                  />
                </label>

                {file && (
                  <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left sm:flex-row">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileSelect(null)}
                      className="text-sm font-semibold text-slate-500 transition hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Options Section */}
              {tool.hasSettings && file && (
                <div className="mt-8 p-6 bg-slate-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Options</h3>
                  
                  {/* Compression Quality */}
                  {(toolId.includes('compress')) && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Compression Quality
                      </label>
                      <select
                        value={options.quality}
                        onChange={(e) => updateOptions({ quality: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="low">Low (Smaller file)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Better quality)</option>
                      </select>
                    </div>
                  )}

                  {/* Image Resize */}
                  {toolId === 'resize-image' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Width (px)</label>
                          <input
                            type="number"
                            value={options.width}
                            onChange={(e) => updateOptions({ width: parseInt(e.target.value, 10) })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Height (px)</label>
                          <input
                            type="number"
                            value={options.height}
                            onChange={(e) => updateOptions({ height: parseInt(e.target.value, 10) })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={options.keepAspectRatio}
                          onChange={(e) => updateOptions({ keepAspectRatio: e.target.checked })}
                        />
                        <span className="text-sm text-slate-700">Keep aspect ratio</span>
                      </label>
                    </div>
                  )}

                  {/* PDF Protection */}
                  {toolId === 'protect-pdf' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={options.password}
                        onChange={(e) => updateOptions({ password: e.target.value })}
                        placeholder="Enter password"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* Convert Button */}
              <div className="mt-8">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleConvert}
                  loading={converting}
                  disabled={!file || converting}
                >
                  {converting ? 'Converting...' : 'Convert File'}
                </Button>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Conversion Complete!</h2>
              <p className="text-slate-600 mb-8">Your file has been converted successfully.</p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDownload}
                  icon={<FaDownload />}
                >
                  Download File
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleReset}
                  icon={<FaRedo />}
                >
                  Convert Another
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">🔒 Secure</h3>
            <p className="text-sm text-slate-600">Files are encrypted and auto-deleted</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">⚡ Fast</h3>
            <p className="text-sm text-slate-600">Lightning-fast conversion</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">✨ Quality</h3>
            <p className="text-sm text-slate-600">Professional-grade output</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPage;
