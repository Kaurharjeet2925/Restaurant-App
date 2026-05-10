import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

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

      setUsers(res.data || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE USER ================= */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/user/${id}`);

      toast.success("User deleted successfully");

      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  };

  return (
    <div className="space-y-5">

      {/* TOP BAR */}
      <div
        className="
          bg-white border border-slate-200 rounded-xl shadow-sm
          p-4 sm:p-5
          flex flex-col sm:flex-row
          sm:items-center sm:justify-between
          gap-4
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              w-11 h-11 rounded-xl
              bg-primaryLight
              flex items-center justify-center
            "
          >
            <Users className="text-primary" size={22} />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Users Management
            </h2>

            <p className="text-sm text-gray-500">
              Manage restaurant staff accounts
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/settings/users/add")}
          className="
            px-4 py-2.5
            bg-primary hover:bg-primaryDark
            text-white rounded-lg
            transition
            flex items-center justify-center gap-2
            shadow-sm
          "
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (

          /* EMPTY */
          <div className="text-center py-16 text-gray-500">
            No users found
          </div>

        ) : (

          /* TABLE */
          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead className="bg-gray-50 border-b">
                <tr className="text-sm text-gray-600">

                  <th className="px-5 py-4 text-left font-semibold">
                    Name
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Role
                  </th>

                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="
                      border-b last:border-b-0
                      hover:bg-slate-50
                      transition
                    "
                  >

                    {/* NAME */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div
                          className="
                            w-10 h-10 rounded-full
                            bg-primaryLight
                            text-primary
                            flex items-center justify-center
                            font-semibold
                          "
                        >
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-gray-800">
                            {user.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            Staff Member
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-5 py-4 text-gray-600 text-sm">
                      {user.email}
                    </td>

                    {/* ROLE */}
                    <td className="px-5 py-4">
                      <span
                        className="
                          inline-flex items-center
                          px-3 py-1 rounded-full
                          text-xs font-medium
                          bg-primaryLight text-primary
                          capitalize
                        "
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">

                        {/* EDIT */}
                        <button
                          onClick={() =>
                            navigate(
                              `/settings/users/edit/${user._id}`
                            )
                          }
                          className="
                            w-9 h-9 rounded-lg
                            bg-blue-50 text-blue-600
                            hover:bg-blue-100
                            flex items-center justify-center
                            transition
                          "
                        >
                          <Pencil size={16} />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="
                            w-9 h-9 rounded-lg
                            bg-red-50 text-red-600
                            hover:bg-red-100
                            flex items-center justify-center
                            transition
                          "
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
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