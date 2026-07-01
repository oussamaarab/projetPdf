import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaRedo, FaUpload } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getToolById } from '../services/toolService';
import toolService from '../services/toolService';
import { Button, Card, Badge } from '../components/UI';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
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

// ── Polling constants ─────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 1500;   // how often to check status
const POLL_MAX_ATTEMPTS = 60;    // 60 × 1.5 s = 90 s max wait

// ── Component ─────────────────────────────────────────────────────────────────
const ToolPage = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const tool = useMemo(() => getToolById(toolId), [toolId]);

  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [pollStatus, setPollStatus] = useState('');       // shown during async processing
  const [optionsByTool, setOptionsByTool] = useState({});

  const pollRef = useRef(null);  // holds the interval id

  const defaultOptions = getDefaultOptions(toolId);
  const options = { ...defaultOptions, ...(optionsByTool[toolId] || {}) };

  const updateOptions = (updates) =>
    setOptionsByTool((prev) => ({
      ...prev,
      [toolId]: { ...defaultOptions, ...(prev[toolId] || {}), ...updates },
    }));

  useEffect(() => {
    if (!tool) navigate('/all-tools');
  }, [tool, navigate]);

  // Clean up any polling timer when the component unmounts
  useEffect(() => () => clearInterval(pollRef.current), []);

  // ── File selection ──────────────────────────────────────────────────────────
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError('');
    setConverted(false);
    setResult(null);
    setPollStatus('');
    clearInterval(pollRef.current);
  };

  // ── Conversion flow ─────────────────────────────────────────────────────────

  const applyTerminalState = useCallback((record) => {
    setConverting(false);
    setPollStatus('');

    if (record.status === 'completed') {
      setResult(record);
      setConverted(true);
    } else {
      // Show the real error from the server, never a generic fallback.
      setError(
        record.error
          ? `Conversion failed: ${record.error}`
          : 'Conversion failed for an unknown reason. Check the server logs.'
      );
    }
  }, []);

  /**
   * Resolve a conversion record to its final state.
   *
   * With QUEUE_CONNECTION=sync the backend processes the job before returning
   * the HTTP response, so status is already "completed" or "failed" by the
   * time we read it.
   *
   * With an async queue (Redis) the job runs in a worker and the initial
   * response status is "queued" or "processing" — we poll until it settles.
   */
  const resolveConversion = useCallback(async (record) => {
    const terminal = (r) => r.status === 'completed' || r.status === 'failed';

    // Already in a terminal state (sync queue) — done immediately.
    if (terminal(record)) {
      applyTerminalState(record);
      return;
    }

    // Async queue: start polling.
    let attempts = 0;
    setPollStatus('Processing your file…');

    pollRef.current = setInterval(async () => {
      attempts += 1;

      if (attempts >= POLL_MAX_ATTEMPTS) {
        clearInterval(pollRef.current);
        setConverting(false);
        setPollStatus('');
        setError('Conversion is taking too long. Please try again.');
        return;
      }

      try {
        const updated = await toolService.getConversion(record.id);
        if (terminal(updated)) {
          clearInterval(pollRef.current);
          setPollStatus('');
          applyTerminalState(updated);
        } else {
          setPollStatus(`Processing… (${updated.progress ?? 0}%)`);
        }
      } catch {
        // Transient network error — keep polling.
      }
    }, POLL_INTERVAL_MS);
  }, [applyTerminalState]);

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setConverting(true);
    setError('');
    setConverted(false);
    setResult(null);
    setPollStatus('Uploading…');

    try {
      const record = await toolService.convertFile(toolId, file, options);
      setPollStatus('');
      await resolveConversion(record);
    } catch (err) {
      setConverting(false);
      setPollStatus('');

      // Show the real server error message, not the generic fallback.
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        null;

      setError(serverMsg || 'Upload failed. Please check your connection and try again.');
    }
  };

  // ── Download ────────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!result?.id) return;

    // Prefer the signed download_url from the API response — it works directly
    // in the browser without needing axios / session cookies.
    if (result.download_url) {
      const a = document.createElement('a');
      a.href = result.download_url;
      a.download = result.filename || result.original_filename || 'converted-file';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Fallback: stream via axios (preserves session cookie for auth).
    try {
      const blob = await toolService.downloadFile(result.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename || result.original_filename || 'converted-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Download failed. Please try again.';
      setError(msg);
    }
  };

  const handleReset = () => {
    clearInterval(pollRef.current);
    setFile(null);
    setConverted(false);
    setResult(null);
    setError('');
    setPollStatus('');
  };

  // ── Render guard ──────────────────────────────────────────────────────────
  if (!tool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading tool…</p>
        </div>
      </div>
    );
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-20">
      <div className="max-w-4xl mx-auto px-6">

        {/* Back link */}
        <Link
          to="/all-tools"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition"
        >
          <FaArrowLeft />
          <span>Back to All Tools</span>
        </Link>

        {/* Header */}
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

        {/* Main card */}
        <Card glass={false} className="p-8">
          {!converted ? (
            <>
              {/* ── Upload zone ── */}
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
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
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

              {/* ── Options ── */}
              {tool.hasSettings && file && (
                <div className="mt-8 p-6 bg-slate-50 rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Options</h3>

                  {toolId.includes('compress') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Compression Quality
                      </label>
                      <select
                        value={options.quality}
                        onChange={(e) => updateOptions({ quality: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="low">Low (Smallest file)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Best quality)</option>
                      </select>
                    </div>
                  )}

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

                  {toolId === 'protect-pdf' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
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

              {/* ── Poll status ── */}
              {pollStatus && (
                <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span>{pollStatus}</span>
                </div>
              )}

              {/* ── Error ── */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm break-words">
                  {error}
                </div>
              )}

              {/* ── Convert button ── */}
              <div className="mt-8">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleConvert}
                  loading={converting}
                  disabled={!file || converting}
                >
                  {converting ? (pollStatus || 'Converting…') : 'Convert File'}
                </Button>
              </div>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">Conversion Complete!</h2>
              <p className="text-slate-600 mb-2">Your file has been converted successfully.</p>

              {result?.size && (
                <p className="text-sm text-slate-500 mb-8">
                  Output: <strong>{result.filename || result.original_filename}</strong>
                  {' '}({formatFileSize(result.size)})
                </p>
              )}

              <div className="flex gap-4 justify-center flex-wrap">
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

        {/* Features bar */}
        <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">🔒 Secure</h3>
            <p className="text-sm text-slate-600">Files are encrypted and auto-deleted after conversion</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">⚡ Fast</h3>
            <p className="text-sm text-slate-600">Lightning-fast processing on every file</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">✨ Quality</h3>
            <p className="text-sm text-slate-600">Professional-grade output every time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPage;
