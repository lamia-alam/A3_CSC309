import React, { useEffect, useState } from "react";
import { api } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { CreateUserDrawer } from "../components/CreateUserDrawer";
import { debounce } from 'lodash';

export type User = {
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
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "ascending" | "descending";
  }>({
    key: "id",
    direction: "ascending",
  });
  const [filters, setFilters] = useState({
    id: "",
    name: "",
    utorid: "",
    email: "",
    role: "",
    verified: "",
    suspicious: "",
  });   
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);

  const isSuperuser = role === "superuser";
  const isManager = role === "manager";
  const isCashier = role === "cashier";

  const allowedRoles = isSuperuser
    ? ["superuser", "manager", "cashier", "regular"]
    : isManager
    ? ["cashier", "regular"]
    : ["regular"];

  const debouncedSetFilters = debounce((column: keyof typeof filters, value: string) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [column]: value,
      }));
    }, 300);
    

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

  const handleSort = (key: keyof User) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const filteredUsers = users.filter((user) => {
    return (
      (filters.id === "" || user.id.toString().includes(filters.id)) &&
      (filters.name === "" || (user.name?.toLowerCase() ?? "").includes(filters.name.toLowerCase())) &&
      (filters.utorid === "" || user.utorid.toLowerCase().includes(filters.utorid.toLowerCase())) &&
      (filters.email === "" || user.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (filters.role === "" || user.role.toLowerCase().includes(filters.role.toLowerCase())) &&
      (filters.verified === "" || user.verified.toString() === filters.verified) &&
      (filters.suspicious === "" || user.suspicious.toString() === filters.suspicious)
    );
  });  
  
  const sortedUsers = filteredUsers.sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
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
        fetchUsers();
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
          {(isSuperuser || isManager || isCashier) ? (
            <label htmlFor="create-user-drawer" className="btn btn-primary">
              Create User
            </label>
          ) : (
            <div className="p-6 text-xl text-red-600">Access Denied</div>
          )}
        </div>

        {(isSuperuser || isManager) && (
          <div className="overflow-x-auto">
            <table className="table w-full">
            <thead>
              <tr>
                {["id", "name", "utorid", "email", "role", "verified", "suspicious"].map((column) => (
                  <th key={column} className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <span onClick={() => handleSort(column as keyof User)}>
                        {column.charAt(0).toUpperCase() + column.slice(1)}{" "}
                        {sortConfig.key === column && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                      </span>
                      {column === "verified" || column === "suspicious" ? (
                        <select
                          className="select select-sm w-32 mt-1"
                          value={filters[column as keyof typeof filters]}
                          onChange={(e) => setFilters({ ...filters, [column]: e.target.value })}
                        >
                          <option value="">All</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="input input-sm w-32 mt-1"
                          placeholder={`Filter ${column}`}
                          value={filters[column as keyof typeof filters]}
                          onChange={(e) => setFilters({ ...filters, [column]: e.target.value })}
                        />
                      )}
                    </div>
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
              <tbody>
                {currentUsers.map((u) => (
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
                        <label tabIndex={0} className="btn btn-xs btn-outline m-1">
                          Edit
                        </label>
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

        {(isSuperuser || isManager) && (
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <label className="mr-2">Show per page:</label>
              <div className="btn-group">
                {[5, 10, 15, 20].map((size) => (
                  <button
                    key={size}
                    className={`btn ${usersPerPage === size ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setUsersPerPage(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-primary btn-sm"
              >
                {"<"}
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-primary btn-sm"
              >
                {">"}
              </button>
            </div>
          </div>
        )}

      </div>

      <CreateUserDrawer onSuccess={fetchUsers} />
    </div>
  );
};