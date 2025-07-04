import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import EngineersPage from '../pages/EngineersPage'; 
import ProjectsPage from '../pages/ProjectsPage';   
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '../components/layouts/MainLayout';

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="profile" element={<ProfilePage />} />
      
   
      <Route path="engineers" element={<ProtectedRoute roles={['manager']}><EngineersPage /></ProtectedRoute>} />
      <Route path="projects" element={<ProtectedRoute roles={['manager']}><ProjectsPage /></ProtectedRoute>} />
    
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);