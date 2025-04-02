import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [utorid, setUtroId] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col items-center mt-32 bg-base-100">
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Login</legend>

        <label className="fieldset-label">UTROid</label>
        <input
          type="email"
          className="input"
          placeholder="UTROid"
          value={utorid}
          onChange={(e) => setUtroId(e.target.value)}
          required
        />

        <label className="fieldset-label">Password</label>
        <input
          type="password"
          className="input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn btn-neutral mt-4" onClick={async () => await login(utorid, password)}>
          Login
        </button>
      </fieldset>
    </div>
  );
};
