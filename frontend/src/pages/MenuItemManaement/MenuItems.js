import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import MenuItemCard from "./MenuItemCard";
import MenuItemForm from "./MenuItemForm";
import { Plus } from "lucide-react";

const MenuItems = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const fetchItems = async () => {
    const res = await apiClient.get("/menu");
    setItems(res.data);
  };

  const fetchCategories = async () => {
    const res = await apiClient.get("/category");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold text-gray-800 mb-10">
        🍔 Menu Items
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <MenuItemCard
            key={item._id}
            item={item}
            refresh={fetchItems}
            onEdit={() => setEditingItem(item)}
          />
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setEditingItem({})}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#ff4d4d] text-white 
        flex items-center justify-center shadow-lg hover:bg-[#e63c3c]"
      >
        <Plus size={28} />
      </button>

      {/* Add / Edit Modal */}
      {editingItem && (
        <MenuItemForm
          item={editingItem}
          categories={categories}
          refresh={fetchItems}
          close={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

export default MenuItems;
