import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const RoleRoute: React.FC<{ allowedRoles: Role[] }> = ({ allowedRoles }) => {
  const { user, hasRole, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user || !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
