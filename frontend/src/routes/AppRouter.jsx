import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import PrivateRoute from './PrivateRoute';

// Main Pages
import Home from '../pages/Home/Home';
import AllTools from '../pages/AllTools';
import PdfTools from '../pages/PdfTools';
import ImageTools from '../pages/ImageTools';
import VideoTools from '../pages/VideoTools';
import AudioTools from '../pages/AudioTools';
import ArchiveTools from '../pages/ArchiveTools';
import ToolPage from '../pages/ToolPage';
import Pricing from '../pages/Pricing';
import About from '../pages/About';
import Contact from '../pages/Contact';

// Auth Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

// Dashboard Pages
import DashboardOverview from '../pages/Dashboard/DashboardOverview';
import History from '../pages/Dashboard/History';
import Favorites from '../pages/Dashboard/Favorites';
import Profile from '../pages/Dashboard/Profile';
import Settings from '../pages/Dashboard/Settings';

// Admin Pages
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminFiles from '../pages/Admin/AdminFiles';
import AdminApiLogs from '../pages/Admin/AdminApiLogs';

const AppRouter = () => {
  return (
    <Routes>
      {/* Main Layout Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/all-tools" element={<AllTools />} />
        <Route path="/pdf-tools" element={<PdfTools />} />
        <Route path="/image-tools" element={<ImageTools />} />
        <Route path="/video-tools" element={<VideoTools />} />
        <Route path="/audio-tools" element={<AudioTools />} />
        <Route path="/archive-tools" element={<ArchiveTools />} />
        <Route path="/tool/:toolId" element={<ToolPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth Layout Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Dashboard Layout Routes (Protected) */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/history" element={<History />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Admin Routes (Protected - Admin Only) */}
      <Route
        element={
          <PrivateRoute adminOnly>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/files" element={<AdminFiles />} />
        <Route path="/admin/api-logs" element={<AdminApiLogs />} />
      </Route>

      {/* 404 - Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
