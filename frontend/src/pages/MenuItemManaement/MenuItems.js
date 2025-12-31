import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../../apiclient/apiclient";
import MenuItemCard from "./MenuItemCard";
import MenuItemForm from "./MenuItemForm";
import { Plus } from "lucide-react";

const MenuItems = () => {
  const [params] = useSearchParams();
  const searchQuery = (params.get("q") || "").trim().toLowerCase();

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

  const visibleItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(i => {
      const name = (i.name || "").toLowerCase();
      const cat = ((i.category?.name) || i.category || "").toLowerCase();
      return name.includes(searchQuery) || cat.includes(searchQuery);
    });
  }, [items, searchQuery]);

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold text-gray-800 mb-10">
        🍔 Menu Items
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {visibleItems.map((item) => (
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
