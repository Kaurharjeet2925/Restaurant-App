import React, { useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { toast } from "react-toastify";

const RegisterRestaurant = () => {
  const [form, setForm] = useState({
    restaurantName: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  /* 🔹 Handle normal fields */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* 🔹 Handle phone input (numbers only, max 10 digits) */
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length <= 10) {
      setForm({ ...form, phone: digits });
    }
  };

  /* 🔹 Indian phone validation */
  const validateIndianPhone = (phone) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone);
  };

  /* 🔹 Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.restaurantName ||
      !form.ownerName ||
      !form.ownerEmail ||
      !form.ownerPassword ||
      !form.phone
    ) {
      return toast.error("All fields are required");
    }

    if (!validateIndianPhone(form.phone)) {
      return toast.error("Enter valid 10-digit Indian mobile number");
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        phone: `+91${form.phone}`, // 🔥 Add +91 automatically
      };

      const res = await apiClient.post(
        "/restaurants",
        payload
      );

      toast.success(res.data.message);

      setForm({
        restaurantName: "",
        ownerName: "",
        ownerEmail: "",
        ownerPassword: "",
        phone: "",
      });

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Register New Restaurant
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="restaurantName"
            placeholder="Restaurant Name"
            value={form.restaurantName}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <input
            type="text"
            name="ownerName"
            placeholder="Owner Name"
            value={form.ownerName}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <input
            type="email"
            name="ownerEmail"
            placeholder="Owner Email"
            value={form.ownerEmail}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <input
            type="password"
            name="ownerPassword"
            placeholder="Owner Password"
            value={form.ownerPassword}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg"
          />

          {/* 🔥 Phone Input with +91 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Restaurant Phone
            </label>

            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-100 text-gray-600">
                +91
              </span>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit number"
                maxLength={10}
                className="w-full border rounded-r-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition"
          >
            {loading ? "Creating..." : "Create Restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterRestaurant;