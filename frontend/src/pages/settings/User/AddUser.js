import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";

const AddUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    uploadImage: null,
    gender: "",
    address: "",
    dateofbirth: "",
    role: "",
  });

  const [imagePreview, setImagePreview] = useState("");

  /* ================= LOAD USER (EDIT) ================= */
  useEffect(() => {
    if (!isEditMode) return;

    const loadUser = async () => {
      try {
        const res = await apiClient.get(`/user/${id}`);
        const u = res.data.user;
        const name = (u.name || "").split(" ");

        setForm({
          firstName: name[0] || "",
          lastName: name.slice(1).join(" ") || "",
          phone: u.phone || "",
          email: u.email || "",
          password: "",
          gender: u.gender || "",
          address: u.address || "",
          dateofbirth: u.dateofbirth || "",
          role: u.role || "",
          uploadImage: null,
        });

        if (u.uploadImage) setImagePreview(u.uploadImage);
      } catch {
        toast.error("Failed to load user");
      }
    };

    loadUser();
  }, [id, isEditMode]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((p) => ({ ...p, uploadImage: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  /* ================= SUBMIT ================= */
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.firstName || !form.lastName || !form.email || !form.role) {
    toast.error("Please fill required fields");
    return;
  }

  if (!isEditMode && !form.password) {
    toast.error("Password is required");
    return;
  }

  try {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v && k !== "uploadImage") fd.append(k, v);
    });
    if (form.uploadImage) fd.append("image", form.uploadImage);

    if (isEditMode) {
      await apiClient.put(`/user/${id}`, fd);
    } else {
      await apiClient.post("/superadmin/create-user", fd);
    }

    toast.success(isEditMode ? "User updated" : "User created");

    // ✅ GO BACK TO USERS SETTINGS
   navigate("/settings?tab=users");
  } catch (err) {
    toast.error(err.response?.data?.message || "Operation failed");
  }
};


  return (
    <div className="pt-8 px-6 pb-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm">
        {/* HEADER */}
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit User" : "Add User"}
          </h1>
          <p className="text-sm text-gray-500">
            Create staff accounts for your restaurant
          </p>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
            {/* LEFT PROFILE */}
            <div className="p-6 bg-gray-50 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white border flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400">Profile</span>
                )}
              </div>

              <label className="mt-4 text-sm text-[#ff4d4d] font-medium cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {form.role && (
                <span className="mt-4 px-3 py-1 text-xs rounded-full bg-red-50 text-[#ff4d4d]">
                  {form.role.toUpperCase()}
                </span>
              )}
            </div>

            {/* RIGHT FORM */}
            <div className="p-6">
              <div className="max-w-[860px] bg-gray-50 rounded-lg p-6">
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-gray-800">
                    User Information
                  </h3>
                  <p className="text-xs text-gray-500">
                    Basic staff details and access role
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="First Name">
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Last Name">
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Phone">
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Role">
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                    >
                      <option value="">Select role</option>
                      <option value="admin">Admin</option>
                      <option value="waiter">Waiter</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="billing">Billing</option>
                    </select>
                  </Field>

                  <Field label="Gender">
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>

                  {!isEditMode && (
                    <Field label="Password">
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                      />
                    </Field>
                  )}

                  <Field label="DOB">
                    <input
                      type="date"
                      name="dateofbirth"
                      value={form.dateofbirth}
                      onChange={handleChange}
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Address">
                      <textarea
                        rows={3}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t flex justify-end gap-4 bg-white">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#ff4d4d] hover:bg-red-500 text-white rounded-md"
            >
              {isEditMode ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= FIELD ================= */
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    {React.cloneElement(children, {
      className:
        "border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#ff4d4d]",
    })}
  </div>
);

export default AddUser;
