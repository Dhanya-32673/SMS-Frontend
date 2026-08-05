import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // 1. If auth state is initializing/loading, show smooth loading indicator
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading Portal...</span>
        </div>
      </div>
    );
  }

  // 2. If logged out / unauthenticated, redirect directly to /login (no error page)
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Extract & normalize role string (supports string "FACULTY", "ROLE_FACULTY", or object { roleName: "ROLE_FACULTY" })
  let rawRole = '';
  if (typeof user.role === 'string') {
    rawRole = user.role;
  } else if (user.role?.roleName) {
    rawRole = user.role.roleName;
  } else if (user.role?.name) {
    rawRole = user.role.name;
  } else if (Array.isArray(user.roles) && user.roles.length > 0) {
    rawRole = typeof user.roles[0] === 'string' ? user.roles[0] : (user.roles[0]?.roleName || user.roles[0]?.name || '');
  }

  const userRole = rawRole.replace('ROLE_', '').toUpperCase();
  const normalizedAllowed = allowedRoles.map((r) => r.replace('ROLE_', '').toUpperCase());
  const hasPermission = normalizedAllowed.includes(userRole);

  // 3. If logged in but route is restricted for current role, automatically redirect to allowed dashboard (NO 403 PAGE)
  if (!hasPermission) {
    if (userRole === 'FACULTY') {
      return <Navigate to="/faculty/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
