// frontend/src/pages/AccountInfo.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../config/api";

export const AccountInfo: React.FC = () => {
  const { userInfo, refreshUserInfo } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    birthday: "",
    avatarUrl: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (userInfo) {
      setForm({
        name: userInfo.name || "",
        email: userInfo.email || "",
        birthday: userInfo.birthday || "",
        avatarUrl: userInfo.avatarUrl || "",
      });
    }
  }, [userInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await api.patch("/users/me", form);
      setMessage("Account updated!");
      await refreshUserInfo();
    } catch (err) {
      setMessage("Failed to update.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <div className="w-full max-w-md p-6 bg-base-200 rounded-box">
        <h2 className="text-xl font-bold mb-4">Update Account Info</h2>

        <input
          name="name"
          className="input input-bordered mb-3 w-full"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="email"
          className="input input-bordered mb-3 w-full"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="date"
          name="birthday"
          className="input input-bordered mb-3 w-full"
          placeholder="Birthday"
          value={form.birthday}
          onChange={handleChange}
        />

        <input
          name="avatarUrl"
          className="input input-bordered mb-3 w-full"
          placeholder="Avatar URL"
          value={form.avatarUrl}
          onChange={handleChange}
        />

        <button className="btn btn-primary w-full" onClick={handleUpdate}>
          Save Changes
        </button>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>
    </div>
  );
};
