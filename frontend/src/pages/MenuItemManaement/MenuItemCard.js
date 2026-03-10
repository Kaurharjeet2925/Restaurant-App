import React from "react";
import apiClient from "../../apiclient/apiclient";
import { Edit, Trash2, Star } from "lucide-react";

const MenuItemCard = ({ item, refresh, onEdit }) => {

  const deleteItem = async () => {
    if (!window.confirm("Delete this item?")) return;
    await apiClient.delete(`/menu/${item._id}`);
    refresh();
  };

  const toggleAvailability = async () => {
    await apiClient.put(`/menu/${item._id}`, {
      available: !item.available
    });
    refresh();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">

      {/* IMAGE */}
      <div className="w-full h-32 overflow-hidden">
        <img
          src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition"
        />
      </div>

      {/* CONTENT */}
      <div className="p-3 space-y-2">

        {/* NAME + PRICE */}
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-800 truncate">
            {item.name}
          </h2>

          <p className="text-primary font-bold text-sm">
            ₹{item.price}
          </p>
        </div>

        {/* CATEGORY */}
        <p className="text-xs text-slate-500">
          {item.category?.name}
        </p>

        {/* AVAILABILITY */}
        <button
          onClick={toggleAvailability}
          className={`text-xs px-3 py-1 rounded-md font-medium transition
          ${
            item.available
              ? "bg-green-100 text-green-700"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {item.available ? "Available" : "Unavailable"}
        </button>

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-1">

          <div className="flex items-center gap-1 text-orange-500 text-sm">
            <Star size={14} fill="orange" />
            <span>5.0</span>
          </div>

          <div className="flex gap-3">

            <button
              onClick={onEdit}
              className="text-primary hover:text-primaryHover"
            >
              <Edit size={18} />
            </button>

            <button
              onClick={deleteItem}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default MenuItemCard;