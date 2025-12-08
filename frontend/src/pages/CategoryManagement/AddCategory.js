import React, { useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { toast } from "react-toastify";

const AddCategory = ({ onCategoryAdded }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await apiClient.post("/category", { name });
      toast.success("Category added successfully");
      setName("");
      onCategoryAdded();  // refresh parent list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 mb-6 bg-white p-4 rounded-xl shadow"
    >
      <input
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-3 rounded-lg w-72 focus:ring-2 focus:ring-[#ff4d4d]"
      />

      <button
        type="submit"
        className="bg-[#ff4d4d] text-white px-6 py-3 rounded-lg hover:bg-[#e63939] transition"
      >
        Add
      </button>
    </form>
  );
};

export default AddCategory;
