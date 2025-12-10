import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const MenuItemForm = ({ item = {}, categories, refresh, close }) => {
  const isEditing = !!item._id;

  const [name, setName] = useState(item.name || "");
  const [category, setCategory] = useState(item.category?._id || "");
  const [price, setPrice] = useState(item.price || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(item.image ? `http://localhost:5000${item.image}` : null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name || !category || !price) {
      return toast.error("All fields are required");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("price", price);
    if (image) formData.append("image", image);

    try {
      if (isEditing) {
        await apiClient.put(`/menu/${item._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Updated!");
      } else {
        await apiClient.post("/menu", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Added!");
      }

      refresh();
      close();
    } catch (err) {
      toast.error("Failed to save item");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

      <div className="bg-white w-[400px] rounded-md shadow-lg p-6 relative">

        <button onClick={close} className="absolute top-3 right-3">
          <X size={22} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Menu Item" : "Add Menu Item"}
        </h2>

        {/* Name */}
        <label className="font-medium text-sm">Item Name</label>
        <input
          className="border p-2 w-full rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Category */}
        <label className="font-medium text-sm">Category</label>
        <select
          className="border p-2 w-full rounded mb-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Price */}
        <label className="font-medium text-sm">Price</label>
        <input
          type="number"
          className="border p-2 w-full rounded mb-3"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* Image */}
        <label className="font-medium text-sm">Image</label>
        <input type="file" onChange={handleImage} className="mb-3" />

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-32 h-32 object-cover rounded mb-3"
          />
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full bg-[#ff4d4d] text-white py-2 rounded hover:bg-[#e63c3c]"
        >
          {isEditing ? "Update Item" : "Add Item"}
        </button>

      </div>

    </div>
  );
};

export default MenuItemForm;
