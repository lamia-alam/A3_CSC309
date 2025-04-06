// frontend/src/pages/ResetPassword.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../config/api";
import { useAuth } from "../context/AuthContext";

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.patch("/users/me/password", {
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/account"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Password update failed.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-32 bg-base-100">
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Change Password</legend>
        {error && <p className="text-red-500">{error}</p>}
        {success ? (
          <p className="text-green-600 font-semibold">Password updated! Redirecting...</p>
        ) : (
          <>
            <label className="fieldset-label">Current Password</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <label className="fieldset-label">New Password</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label className="fieldset-label">Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button className="btn btn-primary mt-4" onClick={handlePasswordChange}>
              Update Password
            </button>
          </>
        )}
      </fieldset>
    </div>
  );
};