import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../config/api";

export const ResetLinkPassword: React.FC = () => {
  const navigate = useNavigate();
  const { resetToken } = useParams();  // Get the reset token from URL parameters

  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Directly make the POST request without any additional questions
      await api.post(`/auth/resets/${resetToken}`, {
        utorid: username, // "utorid" as the backend expects
        password: newPassword, // New password directly
      });
      
      // If successful, show success message and redirect after a short delay
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);  // Redirect to login after success
    } catch (err: any) {
      // Handle any errors that might occur
      console.error("Error occurred during password reset:", err);
      setError(err.response?.data?.message || "Password reset failed.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-32 bg-base-100">
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Reset Password</legend>
        {error && <p className="text-red-500">{error}</p>}
        {success ? (
          <p className="text-green-600 font-semibold">Password updated! Redirecting...</p>
        ) : (
          <>
            <label className="fieldset-label">Username</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

            <button className="btn btn-primary mt-4" onClick={handlePasswordReset}>
              Reset Password
            </button>
          </>
        )}
      </fieldset>
    </div>
  );
};
