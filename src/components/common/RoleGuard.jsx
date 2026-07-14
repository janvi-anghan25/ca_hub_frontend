import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * RoleGuard — wraps a route and redirects users who don't have the required role.
 *
 * Props:
 *   roles  — array of allowed roles, e.g. ['admin', 'superadmin']
 *   redirect — path to redirect to if unauthorized (default: '/')
 */
const RoleGuard = ({ roles = [], redirect = '/', children }) => {
  const { user } = useSelector((s) => s.auth);

  if (!user) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default RoleGuard;
