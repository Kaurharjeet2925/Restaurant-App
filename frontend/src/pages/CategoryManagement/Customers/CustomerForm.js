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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-lg p-6 shadow-xl relative">
        <button className="absolute top-3 right-3" onClick={close}>
          <X size={22} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {mode === "dine-in" ? "Seat Customer" : "Customer"}
        </h2>

        <form onSubmit={handleSave}>
          {/* PHONE FIRST */}
          <label className="text-sm font-medium">Phone</label>
          <input
            className={`border w-full p-2 rounded mb-3 ${
              errors.phone ? "border-red-500" : ""
            }`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={lookupByPhone}
          />
          {errors.phone && (
            <div className="text-red-500 text-xs mb-2">{errors.phone}</div>
          )}

          {/* NAME SECOND */}
          <label className="text-sm font-medium">Name</label>
          <input
            className={`border w-full p-2 rounded mb-3 ${
              errors.name ? "border-red-500" : ""
            }`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <div className="text-red-500 text-xs mb-2">{errors.name}</div>
          )}

          {/* ADDRESS THIRD */}
          <label className="text-sm font-medium">Address</label>
          <textarea
            className="border w-full p-2 rounded mb-4"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff4d4d] text-white py-2 rounded hover:bg-[#e63c3c]"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
