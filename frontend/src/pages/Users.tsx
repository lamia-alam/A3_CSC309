import React, { useEffect, useState } from "react";
import { api } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { CreateUserDrawer } from "../components/CreateUserDrawer";

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
  const { userInfo, role } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: "", utorid: "", email: "", role: "regular" });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSuperuser = role === "superuser";
  const isManager = role === "manager";
  const isCashier = role === "cashier";

  const allowedRoles = isSuperuser
    ? ["superuser", "manager", "cashier", "regular"]
    : isManager
    ? ["cashier", "regular"]
    : ["regular"];

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users?limit=1000");
      setUsers(res.data.results);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    if (isSuperuser || isManager) {
      fetchUsers();
    }
  }, [role]);

  if (!userInfo || (!isSuperuser && !isManager && !isCashier)) {
    return <div className="p-6 text-xl text-red-600">Access Denied</div>;
  }

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
      setSuccessMessage("User created");
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      if (isSuperuser || isManager) {
        fetchUsers(); // Only refetch list if you're allowed to see it
      }      
    } catch (err: any) {
      const message =
        err?.response?.data?.error || "An error occurred while creating the user.";
      alert("Error creating user: " + message);
    }
  };

  const handleVerify = async (id: number, value: boolean) => {
    try {
      await api.patch(`/users/${id}`, { verified: value });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update verification", err);
    }
  };

  const handleSuspicious = async (id: number, value: boolean) => {
    try {
      await api.patch(`/users/${id}`, { suspicious: value });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update suspicious", err);
    }
  };

  const handlePromote = async (id: number, currentRole: string) => {
    const order = ["regular", "cashier", "manager", "superuser"];
    const idx = order.indexOf(currentRole);
    const nextRole = order[idx + 1];
  
    // Restrict manager from promoting managers or higher
    if (isManager && (currentRole === "manager" || currentRole === "superuser")) {
      alert("Managers cannot promote other managers or superusers.");
      return;
    }
  
    if (idx < order.length - 1) {
      try {
        await api.patch(`/users/${id}`, { role: nextRole });
        fetchUsers();
      } catch (err) {
        console.error("Failed to promote user", err);
      }
    }
  };  

  const handleDemote = async (id: number, currentRole: string) => {
    const order = ["regular", "cashier", "manager", "superuser"];
    const idx = order.indexOf(currentRole);
    const prevRole = order[idx - 1];
  
    // Restrict manager from demoting managers or superusers
    if (isManager && (currentRole === "manager" || currentRole === "superuser")) {
      alert("Managers cannot demote other managers or superusers.");
      return;
    }
  
    if (idx > 0) {
      try {
        await api.patch(`/users/${id}`, { role: prevRole });
        fetchUsers();
      } catch (err) {
        console.error("Failed to demote user", err);
      }
    }
  };  

  return (
    <div className="drawer drawer-end">
      <input id="create-user-drawer" type="checkbox" className="drawer-toggle" />
  
      <div className="drawer-content p-6">
        {successMessage && (
          <div className="alert alert-success shadow-lg mb-4">
            <span>{successMessage}</span>
          </div>
        )}
  
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <label htmlFor="create-user-drawer" className="btn btn-primary">
          Create User
        </label>
      </div>
  
        {(isSuperuser || isManager) && (
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
                    <td>
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-xs btn-outline m-1">Edit</label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 space-y-1">
                          <li>
                            <button
                              onClick={() => handleVerify(u.id, !u.verified)}
                              className={u.verified ? "text-yellow-600" : "text-green-600"}
                            >
                              {u.verified ? "Unverify" : "Verify"}
                            </button>
                          </li>
  
                          {(isSuperuser || (isManager && u.role === "regular")) && (
                            <li>
                              <button onClick={() => handlePromote(u.id, u.role)}>Promote</button>
                            </li>
                          )}
  
                          {(isSuperuser || (isManager && u.role === "cashier")) && (
                            <li>
                              <button onClick={() => handleDemote(u.id, u.role)}>Demote</button>
                            </li>
                          )}
  
                          {u.role === "cashier" && (
                            <li>
                              <button
                                onClick={() => handleSuspicious(u.id, !u.suspicious)}
                                className={u.suspicious ? "text-green-600" : "text-red-500"}
                              >
                                {u.suspicious ? "Unmark Suspicious" : "Mark Suspicious"}
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  
      {/* Drawer content */}
      <CreateUserDrawer onSuccess={fetchUsers} />
    </div>
  );
  
};
