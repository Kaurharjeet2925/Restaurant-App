import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../../apiclient/apiclient";
import MenuItemCard from "./MenuItemCard";
import MenuItemForm from "./MenuItemForm";
import PageHeader from "../../components/pageHeader";
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

    return items.filter((i) => {
      const name = (i.name || "").toLowerCase();
      const cat = ((i.category?.name) || i.category || "").toLowerCase();

      return name.includes(searchQuery) || cat.includes(searchQuery);
    });
  }, [items, searchQuery]);

  return (
    <div className="">

      {/* MOBILE HEADER */}
      <div className="block md:hidden mb-4 ">
        <PageHeader title="Menu Items"/>
      </div>

      {/* DESKTOP TITLE */}
      <h1 className="hidden md:block text-3xl font-bold text-gray-800  p-5" >
         Menu Items
      </h1>

      {/* GRID */}
      <div className="px-5 pb-6 ">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ">
        {visibleItems.map((item) => (
          <MenuItemCard
            key={item._id}
            item={item}
            refresh={fetchItems}
            onEdit={() => setEditingItem(item)}
          />
        ))}
      </div>

      {/* ADD BUTTON */}
      <button
        onClick={() => setEditingItem({})}
        className="fixed bottom-6 right-5 md:right-6 w-14 h-14 rounded-full bg-primary text-white 
        flex items-center justify-center shadow-lg hover:bg-primaryGradient transition"
      >
        <Plus size={28} />
      </button>
</div>
      {/* ADD / EDIT MODAL */}
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