import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [utorid, setUtorid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      await login(utorid, password);
    } catch (err: any) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-32 bg-base-100">
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend text-lg font-semibold">Login</legend>

        <label className="fieldset-label mt-2">UTORid</label>
        <input
          type="email"
          className="input w-full"
          placeholder="UTorid"
          value={utorid}
          onChange={(e) => setUtorid(e.target.value)}
          required
        />

        <label className="fieldset-label mt-3">Password</label>
        <input
          type="password"
          className="input w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="text-sm text-right mt-2">
          <Link to="/forgot-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button className="btn btn-neutral w-full mt-4" onClick={handleLogin}>
          Login
        </button>
      </fieldset>
    </div>
  );
};
