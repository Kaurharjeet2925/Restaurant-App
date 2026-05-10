import React, { useState } from "react";
import { X } from "lucide-react";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";

const CustomerForm = ({
  customer = {},
  close,
  mode = "manage", // manage | dine-in
  onDone,
}) => {
  const [customerId, setCustomerId] = useState(customer._id || null);
  const [name, setName] = useState(customer.name || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [address, setAddress] = useState(customer.address || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🔍 Lookup by phone (ONLY for dine-in)
  const lookupByPhone = async () => {
if (!["dine-in", "counter", "carobar"].includes(mode) || !phone) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/by-phone/${phone}`);

      if (res.data) {
        setCustomerId(res.data._id || null);
        setName(res.data.name || "");
        setAddress(res.data.address || "");
        toast.info("Existing customer found");
      } else {
        setCustomerId(null);
        setName("");
        setAddress("");
      }
    } catch {
      toast.error("Customer lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!name || name.trim() === "") errs.name = "Name is required";
    if (!phone || phone.trim() === "") {
      errs.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(phone.trim())) {
      errs.phone = "Phone must be 10 digits";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!name || !phone) {
      return toast.error("Name & phone required");
    }

    // ✅ COUNTER CREDIT FLOW
    if (mode === "counter") {
      onDone({ name, phone, address });
      close();
      return;
    }

    // ✅ EXISTING DINE-IN FLOW (UNCHANGED)
    if (mode === "dine-in") {
      let finalCustomerId = customerId;

      if (!customerId) {
        const res = await apiClient.post("/customers", {
          name,
          phone,
          address,
        });
        finalCustomerId = res.data._id;
        toast.success("Customer added");
      }

      onDone(finalCustomerId);
      close();
      return;
    }

    // ✅ EXISTING MANAGE FLOW (UNCHANGED)
    if (customerId) {
      await apiClient.put(`/customers/${customerId}`, {
        name,
        phone,
        address,
      });
      toast.success("Customer updated");
    } else {
      await apiClient.post("/customers", {
        name,
        phone,
        address,
      });
      toast.success("Customer added");
    }

    close();
  };

  return (
  <div
    className="
      fixed inset-0 z-50
      bg-black/50 backdrop-blur-sm
      flex items-center justify-center
      p-4
    "
  >

    {/* MODAL */}
    <div
      className="
        bg-white w-full max-w-md
        rounded-2xl shadow-2xl
        border border-borderLight
        relative overflow-hidden
      "
    >

      {/* HEADER */}
      <div
        className="
          flex items-center justify-between
          px-6 py-5 border-b border-borderLight
        "
      >

        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "dine-in"
              ? "Seat Customer"
              : mode === "counter"
              ? "Counter Customer"
              : "Customer"}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Enter customer details
          </p>
        </div>

        <button
          className="
            w-9 h-9 rounded-lg
            hover:bg-gray-100
            flex items-center justify-center
            transition
          "
          onClick={close}
        >
          <X size={20} />
        </button>

      </div>

      {/* FORM */}
      <form
        onSubmit={handleSave}
        className="p-6 space-y-5"
      >

        {/* PHONE */}
        <div>

          <label className="text-sm font-medium text-gray-700 block mb-2">
            Phone Number
          </label>

          <input
            className={`
              w-full px-4 py-3 rounded-xl
              border outline-none transition

              ${
                errors.phone
                  ? "border-red-500"
                  : "border-borderLight focus:border-primary focus:ring-4 focus:ring-primary/10"
              }
            `}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={lookupByPhone}
            placeholder="Enter phone number"
          />

          {errors.phone && (
            <div className="text-red-500 text-xs mt-1">
              {errors.phone}
            </div>
          )}

        </div>

        {/* NAME */}
        <div>

          <label className="text-sm font-medium text-gray-700 block mb-2">
            Customer Name
          </label>

          <input
            className={`
              w-full px-4 py-3 rounded-xl
              border outline-none transition

              ${
                errors.name
                  ? "border-red-500"
                  : "border-borderLight focus:border-primary focus:ring-4 focus:ring-primary/10"
              }
            `}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter customer name"
          />

          {errors.name && (
            <div className="text-red-500 text-xs mt-1">
              {errors.name}
            </div>
          )}

        </div>

        {/* ADDRESS */}
        <div>

          <label className="text-sm font-medium text-gray-700 block mb-2">
            Address
          </label>

          <textarea
            rows={3}
            className="
              w-full px-4 py-3 rounded-xl
              border border-borderLight
              outline-none transition
              focus:border-primary
              focus:ring-4 focus:ring-primary/10
            "
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
          />

        </div>

        {/* FOOTER */}
        <div className="flex gap-3 pt-2">

          <button
            type="button"
            onClick={close}
            className="
              flex-1 py-3 rounded-xl
              bg-gray-100 text-gray-700
              hover:bg-gray-200 transition
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="
              flex-1 py-3 rounded-xl
              bg-primary text-white
              hover:bg-primaryDark
              transition
              disabled:opacity-50
            "
          >
            {loading ? "Please wait..." : "Continue"}
          </button>

        </div>

      </form>

    </div>

  </div>
);
};

export default CustomerForm;
