import React from "react";
import { Navbar } from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const BaseLayout: React.FC = () => {
  const {loading} = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="p-5">
        <Outlet />
      </div>
    </div>
  );
};
