import React, { useState, useEffect } from "react";
import apiClient from "../../apiclient/apiclient";
import { toast } from "react-toastify";
import { Check, Trash2 } from "lucide-react";

const AddCategory = ({ category = {}, refresh }) => {
  const isEditing = !!category._id;

  const [originalName, setOriginalName] = useState(category.name || "");
  const [name, setName] = useState(category.name || "");
  const [isChanged, setIsChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsChanged(name.trim() !== originalName.trim());
  }, [name, originalName]);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Category name required");
    try {
      setSaving(true);

      if (isEditing) {
        // UPDATE CATEGORY
        await apiClient.put(`/category/${category._id}`, { name });
        toast.success("Updated!");
        setOriginalName(name.trim());
      } else {
        // ADD CATEGORY
        await apiClient.post("/category", { name });
        toast.success("Added!");
        setName("");
        setOriginalName("");
      }

      setIsChanged(false);
      refresh(); // 🔥 THIS WILL NOW WORK CORRECTLY
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category._id) return refresh();
    if (!window.confirm("Delete this category?")) return;

    try {
      await apiClient.delete(`/category/${category._id}`);
      toast.success("Deleted");
      refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-3">

      {/* <h2 className="text-gray-800 text-sm font-semibold">
        {isEditing ? "Edit Category" : "Add Category"}
      </h2> */}

      <label className="text-gray-700 text-sm font-medium">Category Name</label>

      <input
        type="text"
        value={name}
        placeholder="e.g., Drinks, Starters"
        onChange={(e) => setName(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm
                   focus:ring-1 focus:ring-[#ff4d4d] focus:border-[#ff4d4d]"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={handleSave}
          disabled={!isChanged || saving}
          title={
            !isChanged
              ? "No changes to save"
              : isEditing
              ? "Update Category"
              : "Add Category"
          }
          className={`w-9 h-9 flex items-center justify-center rounded-full transition shadow-sm
            ${(!isChanged || saving)
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-100 text-green-700 hover:bg-green-200"}`}
        >
          <Check size={16} />
        </button>

        {isEditing && (
          <button
            onClick={handleDelete}
            title="Delete Category"
            className="w-9 h-9 flex items-center justify-center bg-red-100 
                       text-red-700 rounded-full hover:bg-red-200 transition shadow-sm"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

    </div>
  );
};

export default AddCategory;
