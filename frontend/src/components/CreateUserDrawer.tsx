import React, { useState } from "react";
import { api } from "../config/api";
import { useAuth } from "../context/AuthContext";

type Props = {
  onSuccess: () => void;
};

export const CreateUserDrawer: React.FC<Props> = ({ onSuccess }) => {
  const { role } = useAuth();
  const isSuperuser = role === "superuser";
  const isManager = role === "manager";

  const allowedRoles = isSuperuser
    ? ["superuser", "manager", "cashier", "regular"]
    : isManager
    ? ["cashier", "regular"]
    : ["regular"];

  const [form, setForm] = useState({
    name: "",
    utorid: "",
    email: "",
    role: "regular",
  });

  const handleCreate = async () => {
    const { name, utorid, email, role } = form;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@mail\.utoronto\.ca$/;
    if (!emailRegex.test(email)) {
      alert("Email must be a @mail.utoronto.ca address.");
      return;
    }
    if (utorid.length !== 8) {
      alert("UTORid must be exactly 8 characters.");
      return;
    }
    if (name.trim().length === 0 || name.length > 50) {
      alert("Name must be between 1 and 50 characters.");
      return;
    }

    try {
      await api.post("/users", { name, utorid, email, role });
      setForm({ name: "", utorid: "", email: "", role: "regular" });
      onSuccess();

      // Close drawer
      const checkbox = document.getElementById(
        "create-user-drawer"
      ) as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        "An error occurred while creating the user.";
      alert("Error creating user: " + message);
    }
  };

  return (
    <>
      <input type="checkbox" id="create-user-drawer" className="drawer-toggle" />
      <div className="drawer-side z-50">
        <label htmlFor="create-user-drawer" className="drawer-overlay" />
        <div className="menu p-6 w-96 min-h-full bg-base-200 text-base-content">
          <h2 className="text-xl font-bold mb-4">Create New User</h2>

          {["utorid", "name", "email"].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field}
              className="input input-bordered mb-2 w-full"
              value={(form as any)[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          ))}

          <select
            className="select select-bordered mb-4 w-full"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {allowedRoles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>

          <button className="btn btn-primary w-full" onClick={handleCreate}>
            Create User
          </button>
        </div>
      </div>
    </>
  );
};