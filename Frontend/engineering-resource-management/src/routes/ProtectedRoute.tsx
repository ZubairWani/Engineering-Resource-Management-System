import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: ('manager' | 'engineer')[];
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the route requires a specific role and the user doesn't have it,
  // redirect them to the main dashboard page.
 if (roles && user && !roles.includes(user.role.toLowerCase())) { 
  return <Navigate to="/" replace />;
}

  return <>{children}</>;
};