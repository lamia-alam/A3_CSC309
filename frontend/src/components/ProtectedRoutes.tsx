import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated} = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export const UnauthenticatedRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" />;
}
