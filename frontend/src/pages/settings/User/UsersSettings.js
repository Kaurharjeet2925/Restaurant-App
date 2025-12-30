import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";

const UsersSettings = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/all");
      setUsers(res.data.users || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE USER ================= */
  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirm) return;

    try {
      await apiClient.delete(`/user/${id}`);
      toast.success("User deleted successfully");
      fetchUsers(); // refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          Users Management
        </h2>

        <button
          onClick={() => navigate("/settings/users/add")}
          className="px-4 py-2 bg-[#ff4d4d] text-white rounded-md hover:opacity-90 transition"
        >
          + Add User
        </button>
      </div>

      {/* TABLE */}
      <div className="p-6">
        {loading ? (
          <div className="text-gray-500 text-center py-10">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="text-gray-500 text-center py-10">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {user.name}
                    </td>
                    <td className="p-3 text-gray-600">
                      {user.email}
                    </td>
                    <td className="p-3 capitalize text-gray-700">
                      {user.role}
                    </td>
                    <td className="p-3 text-right">
                      {/* EDIT */}
                      <button
                        onClick={() =>
                          navigate(`/settings/users/edit/${user._id}`)
                        }
                        className="text-sm text-blue-600 hover:underline mr-4"
                      >
                        Edit
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersSettings;
