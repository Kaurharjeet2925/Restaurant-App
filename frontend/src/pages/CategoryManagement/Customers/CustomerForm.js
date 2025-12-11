import React, { useState } from "react";
import { X } from "lucide-react";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";

const CustomerForm = ({ customer = {}, refresh, close }) => {
  const isEditing = !!customer._id;

  const [name, setName] = useState(customer.name || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [address, setAddress] = useState(customer.address || "");

  const handleSave = async () => {
    if (!name || !phone) return toast.error("Name & phone required");

    const data = { name, phone, address };

    if (isEditing) {
      await apiClient.put(`/customers/${customer._id}`, data);
      toast.success("Customer updated");
    } else {
      await apiClient.post("/customers", data);
      toast.success("Customer added");
    }

    refresh();
    close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-lg p-6 shadow-xl relative">
        
        <button className="absolute top-3 right-3" onClick={close}>
          <X size={22} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Customer" : "Add Customer"}
        </h2>

        <label className="text-sm font-medium">Name</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="text-sm font-medium">Phone</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label className="text-sm font-medium">Address</label>
        <textarea
          className="border w-full p-2 rounded mb-3"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="w-full bg-[#ff4d4d] text-white py-2 rounded hover:bg-[#e63c3c]"
        >
          {isEditing ? "Update Customer" : "Add Customer"}
        </button>

      </div>
    </div>
  );
};

export default CustomerForm;
