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
    <div
  className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)]
             border border-gray-100 overflow-hidden w-full max-w-[230px] mx-auto"
>

      {/* IMAGE LARGE */}
      <div className="w-full h-36 overflow-hidden">
        <img
          src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* CONTENT SMALL & CLEAN */}
     <div className="p-2 space-y-1.5">
        {/* Name + Price Row */}
        <div className="flex justify-between items-center">
          <h2 className="text-[15px] font-semibold text-gray-800">
            {item.name}
          </h2>
          <p className="text-[#ff4d4d] font-bold text-sm">
            ₹{item.price}
          </p>
        </div>

        {/* Category */}
        <p className="text-xs text-gray-500">
          {item.category?.name}
        </p>

        {/* Availability Button */}
        <button
          onClick={toggleAvailability}
          className={`text-xs px-3 py-1 rounded-md font-medium transition
            ${item.available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}
          `}
        >
          {item.available ? "Available" : "Unavailable"}
        </button>

        {/* ⭐ Rating Row (Figma style) */}
        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center gap-1 text-orange-500 text-sm">
            <Star size={14} fill="orange" />
            <span>5.0</span>
          </div>

          {/* <button
            className="bg-orange-500 text-white text-xs px-3 py-1 rounded-md shadow
                       hover:bg-orange-600 transition"
            onClick={onEdit}
          >
            Edit Product
          </button> */}
       

        {/* Bottom Actions */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            onClick={onEdit}
            className="text-blue-500 hover:text-blue-700"
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
