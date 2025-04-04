import React, { useState } from "react";
import { api } from "../config/api";

export const ForgotPassword: React.FC = () => {
  const [utorid, setUtorid] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    try {
      const res = await api.post("/auth/resets", { utorid });
      setMessage("Password reset link sent! Check your email.");
    } catch (err) {
      setMessage("Error: Could not send reset link.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-32 bg-base-100">
      <div className="bg-base-200 border border-base-300 p-4 rounded-box">
        <h2 className="text-xl mb-3">Forgot Password</h2>
        <input
          type="email"
          placeholder="UTORid"
          className="input mb-2"
          value={utorid}
          onChange={(e) => setUtorid(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleReset}>
          Send Reset Link
        </button>
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
};
