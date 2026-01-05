import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const MenuItemForm = ({ item = {}, categories, refresh, close }) => {
  const isEditing = !!item._id;

  /* -----------------------------
     FORM STATE
  ------------------------------ */
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [portionType, setPortionType] = useState("");
  const [portionTypes, setPortionTypes] = useState([]);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  /* -----------------------------
     LOAD PORTION TYPES
  ------------------------------ */
  useEffect(() => {
    apiClient
      .get("/portion-types")
      .then((res) => setPortionTypes(res.data || []))
      .catch(() => toast.error("Failed to load portion types"));
  }, []);

  /* -----------------------------
     SYNC ITEM DATA (FIX)
     Handles edit reopen + id/object
  ------------------------------ */
  useEffect(() => {
    setName(item.name || "");
    setCategory(item.category?._id || "");
    setPrice(item.price || "");

    // ✅ FIX: works for populated OR id
    if (item.portionType) {
      setPortionType(
        typeof item.portionType === "object"
          ? item.portionType._id
          : item.portionType
      );
    } else {
      setPortionType("");
    }

    setPreview(
      item.image
        ? `${process.env.REACT_APP_IMAGE_URL}${item.image}`
        : null
    );

    setImage(null);
  }, [item]);

  /* -----------------------------
     IMAGE HANDLER
  ------------------------------ */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* -----------------------------
     SAVE ITEM
  ------------------------------ */
  const handleSave = async () => {
    if (!name || !category || !price) {
      return toast.error("Name, category and price are required");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("price", price);

    // ✅ Optional variant
    if (portionType) {
      formData.append("portionType", portionType);
    }

    if (image) {
      formData.append("image", image);
    }

    try {
      if (isEditing) {
        await apiClient.put(`/menu/${item._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Item updated");
      } else {
        await apiClient.post("/menu", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Item added");
      }

      refresh();
      close();
    } catch {
      toast.error("Failed to save item");
    }
  };

  /* -----------------------------
     UI
  ------------------------------ */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-md shadow-lg p-6 relative">

        <button onClick={close} className="absolute top-3 right-3">
          <X size={22} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Menu Item" : "Add Menu Item"}
        </h2>

        {/* ITEM NAME */}
        <label className="font-medium text-sm">Item Name</label>
        <input
          className="border p-2 w-full rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* CATEGORY */}
        <label className="font-medium text-sm">Category</label>
        <select
          className="border p-2 w-full rounded mb-3"
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

        {/* BASE PRICE */}
        <label className="font-medium text-sm">
          Base Price
          <span className="text-xs text-gray-500 ml-1">
            (used for Half / Full etc.)
          </span>
        </label>
        <input
          type="number"
          className="border p-2 w-full rounded mb-3"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* VARIANT TYPE */}
        <label className="font-medium text-sm">
          Variant Type
          <span className="text-xs text-gray-500 ml-1">(optional)</span>
        </label>
        <select
          className="border p-2 w-full rounded mb-3"
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
        <label className="font-medium text-sm">Image</label>
        <input type="file" onChange={handleImage} className="mb-3" />

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-32 h-32 object-cover rounded mb-3"
          />
        )}

        {/* SAVE */}
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
