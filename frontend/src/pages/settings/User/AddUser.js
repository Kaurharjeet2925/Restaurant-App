import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";
import PageHeader from "../../../components/pageHeader";

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
      await apiClient.post("/staff", fd);
    }

    toast.success(isEditMode ? "User updated" : "User created");

    // ✅ GO BACK TO USERS SETTINGS
   navigate("/settings?tab=users");
  } catch (err) {
    toast.error(err.response?.data?.message || "Operation failed");
  }
};


  return (
  <div className="px-5 pb-6">

    {/* HEADER */}
    <PageHeader
      title={isEditMode ? "Edit User" : "Add User"}
      subtitle="Create staff accounts for your restaurant"
      backButton={true}
      onBack={() => navigate(-1)}
    />

    {/* MAIN CARD */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-5">

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">

          {/* LEFT PROFILE */}
          <div
            className="
              p-6 bg-gray-50 border-b lg:border-b-0 lg:border-r
              flex flex-col items-center
            "
          >

            {/* IMAGE */}
            <div
              className="
                w-28 h-28 rounded-full
                bg-white border-2 border-slate-200
                flex items-center justify-center
                overflow-hidden shadow-sm
              "
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-400">
                  Profile
                </span>
              )}
            </div>

            {/* UPLOAD */}
            <label
              className="
                mt-5 text-sm font-medium
                text-primary cursor-pointer
                hover:underline
              "
            >
              Upload Image

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* ROLE BADGE */}
            {form.role && (
              <span
                className="
                  mt-5 px-4 py-1.5 rounded-full
                  bg-primaryLight text-primary
                  text-xs font-semibold uppercase
                "
              >
                {form.role}
              </span>
            )}

          </div>

          {/* RIGHT FORM */}
          <div className="p-5 sm:p-6">

            {/* SECTION HEADER */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                User Information
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Basic staff details and access role
              </p>
            </div>

            {/* FORM GRID */}
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
                  <option value="">Select gender</option>
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

              <Field label="Date of Birth">
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
                    rows={4}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </Field>
              </div>

            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div
          className="
            px-5 sm:px-6 py-4 border-t
            flex flex-col sm:flex-row
            justify-end gap-3
            bg-white
          "
        >

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              px-6 py-2.5 rounded-lg
              bg-gray-100 text-gray-700
              hover:bg-gray-200 transition
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            className="
              px-6 py-2.5 rounded-lg
              bg-primary hover:bg-primaryDark
              text-white transition
            "
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
        "border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
    })}
  </div>
);

export default AddUser;
