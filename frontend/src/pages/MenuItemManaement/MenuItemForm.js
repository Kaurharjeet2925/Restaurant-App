import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const MenuItemForm = ({ item = {}, categories, refresh, close }) => {

  const isEditing = !!item._id;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [portionType, setPortionType] = useState("");
  const [portionTypes, setPortionTypes] = useState([]);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    apiClient.get("/portion-types")
      .then(res => setPortionTypes(res.data || []))
      .catch(() => toast.error("Failed to load portion types"));
  }, []);

  useEffect(() => {
    setName(item.name || "");
    setCategory(item.category?._id || "");
    setPrice(item.price || "");

    if (item.portionType) {
      setPortionType(
        typeof item.portionType === "object"
          ? item.portionType._id
          : item.portionType
      );
    }

    setPreview(
      item.image
        ? `${process.env.REACT_APP_IMAGE_URL}${item.image}`
        : null
    );

    setImage(null);

  }, [item]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {

    if (!name.trim()) return toast.error("Item name is required");
    if (!category) return toast.error("Please select category");
    if (!price || Number(price) <= 0)
      return toast.error("Price must be greater than 0");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("category", category);
    formData.append("price", price);

    if (portionType) formData.append("portionType", portionType);
    if (image) formData.append("image", image);

    try {

      if (isEditing) {
        await apiClient.put(`/menu/${item._id}`, formData);
        toast.success("Item updated");
      } else {
        await apiClient.post("/menu", formData);
        toast.success("Item added");
      }

      refresh();
      close();

    } catch {
      toast.error("Failed to save item");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

<div className="bg-card w-full max-w-md rounded-xl shadow-md border border-borderLight p-6 relative max-h-[90vh] overflow-y-auto">
       <button
  onClick={close}
  className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
>
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Menu Item" : "Add Menu Item"}
        </h2>

        {/* NAME */}
        <label className="text-sm font-medium">Item Name</label>
        <input
         className="w-full border border-borderLight rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* CATEGORY */}
        <label className="text-sm font-medium">Category</label>
        <select
        className="w-full border border-borderLight rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select category</option>

          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}

        </select>

        {/* PRICE */}
        <label className="text-sm font-medium">
          Base Price
        </label>

        <input
          type="number"className="w-full border border-borderLight rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* VARIANT */}
        <label className="text-sm font-medium">
          Variant Type (optional)
        </label>

        <select
          className="w-full border border-borderLight rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={portionType}
          onChange={(e) => setPortionType(e.target.value)}
        >
          <option value="">No Variants</option>

          {portionTypes.map((pt) => (
            <option key={pt._id} value={pt._id}>
              {pt.type}
            </option>
          ))}

        </select>

        {/* IMAGE */}
        <label className="text-sm font-medium">Image</label>

        <input
          type="file"
          onChange={handleImage}
          className="mb-3"
        />

        {preview && (
        <img
  src={preview}
  alt="preview"
  className="w-28 h-28 object-cover rounded-lg border border-borderLight mb-3"
/>
        )}

        {/* SAVE */}
        <button
          onClick={handleSave}
className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition"        >
          {isEditing ? "Update Item" : "Add Item"}
        </button>

      </div>

    </div>
  );
};

export default MenuItemForm;