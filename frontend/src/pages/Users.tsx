import React, { useEffect, useState } from "react";
import { api } from "../config/api";
import { useAuth } from "../context/AuthContext";

type User = {
  id: number;
  name: string;
  utorid: string;
  email: string;
  role: string;
  verified: boolean;
  suspicious: boolean;
};

export const Users: React.FC = () => {
  const { userInfo } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: "", utorid: "", email: "", role: "regular" });

  const isSuperuser = userInfo?.role === "superuser";
  const isManager = userInfo?.role === "manager";
  const isCashier = userInfo?.role === "cashier";

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users?limit=1000");
      console.log("📦 All Users Fetched:", res.data.results);
      setUsers(res.data.results);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    if (userInfo && (isSuperuser || isManager || isCashier)) {
      fetchUsers();
    }
  }, [userInfo]);

  if (!userInfo || (!isSuperuser && !isManager && !isCashier)) {
    return <div className="p-6 text-xl text-red-600">Access Denied</div>;
  }

  const allowedRoles = isSuperuser
    ? ["superuser", "manager", "cashier", "regular"]
    : isManager
    ? ["cashier", "regular"]
    : ["regular"];

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
      fetchUsers();
    } catch (err: any) {
      const message =
        err?.response?.data?.error || "An error occurred while creating the user.";
      alert("Error creating user: " + message);
      console.error("Create user error:", err);
    }
  };

  const handleVerify = async (id: number, value: boolean) => {
    try {
      await api.patch(`/users/${id}`, { verified: value });
      await fetchUsers();
    } catch (err) {
      console.error("Failed to update verification", err);
    }
  };

  const handleSuspicious = async (id: number, value: boolean) => {
    console.log(`🔄 Toggling suspicious: userId=${id}, value=${value}`);
    try {
      const res = await api.patch(`/users/${id}`, { suspicious: value });
      console.log("✅ PATCH response:", res.data);
  
      // ✅ Instantly reflect in frontend state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, suspicious: value } : user
        )
      );
  
      // 💤 Give DB time to commit (prevent overwrite on fetch)
      await new Promise((res) => setTimeout(res, 300));
  
      // ❌ Comment this out if you're okay relying on state:
      // await fetchUsers();
    } catch (err) {
      console.error("❌ Failed to update suspicious", err);
    }
  };  

  const handlePromote = async (id: number, currentRole: string) => {
    const order = ["regular", "cashier", "manager", "superuser"];
    const idx = order.indexOf(currentRole);
    if (idx < order.length - 1) {
      try {
        await api.patch(`/users/${id}`, { role: order[idx + 1] });
        await fetchUsers();
      } catch (err) {
        console.error("Failed to promote user", err);
      }
    }
  };

  const handleDemote = async (id: number, currentRole: string) => {
    const order = ["regular", "cashier", "manager", "superuser"];
    const idx = order.indexOf(currentRole);
    if (idx > 0) {
      try {
        await api.patch(`/users/${id}`, { role: order[idx - 1] });
        await fetchUsers();
      } catch (err) {
        console.error("Failed to demote user", err);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Users</h1>

      <div className="mb-8 bg-base-200 p-6 rounded-box max-w-lg">
        <h2 className="text-lg font-bold mb-4">Create New User</h2>
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

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>UTORid</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Suspicious</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.utorid}</td>
                <td>{u.email}</td>
                <td>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</td>
                <td>
                  <span className={`badge ${u.verified ? "badge-success" : "badge-error"}`}>
                    {u.verified ? "Yes" : "No"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.suspicious ? "badge-warning" : "badge-neutral"}`}>
                    {u.suspicious ? "Yes" : "No"}
                  </span>
                </td>
                <td className="space-x-2">
                  {(isSuperuser || isManager) && (
                    <>
                      <button
                        className={`btn btn-xs ${u.verified ? "btn-warning" : "btn-success"}`}
                        onClick={() => handleVerify(u.id, !u.verified)}
                      >
                        {u.verified ? "Unverify" : "Verify"}
                      </button>

                      <button
                        className="btn btn-xs btn-info"
                        disabled={u.role === "superuser"}
                        onClick={() => handlePromote(u.id, u.role)}
                      >
                        Promote
                      </button>
                      <button
                        className="btn btn-xs btn-warning"
                        disabled={u.role === "regular"}
                        onClick={() => handleDemote(u.id, u.role)}
                      >
                        Demote
                      </button>
                    </>
                  )}

                  {u.role === "cashier" && (isSuperuser || isManager) && (
                    <button
                      className={`btn btn-xs ${u.suspicious ? "btn-success" : "btn-error"}`}
                      onClick={() => {
                        console.log(`🧨 Toggle suspicious for ID ${u.id}: ${u.suspicious}`);
                        handleSuspicious(u.id, !u.suspicious);
                      }}
                    >
                      {u.suspicious ? "Unmark Suspicious" : "Mark Suspicious"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};