import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import AddCategory from "./AddCategory";
import { Plus } from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState(null);

  const fetchCategories = async () => {
    const res = await apiClient.get("/category"); // 🔥 FIXED
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addNewCategory = () => {
    setNewCategory({ name: "", isNew: true }); // 🔥 No _id, no auto-save bug
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-12">
        🍽️ Menu Categories
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Existing categories */}
        {categories.map((cat) => (
          <AddCategory
            key={cat._id}
            category={cat}
            refresh={fetchCategories}
          />
        ))}

        {/* Show new category card */}
        {newCategory && (
          <AddCategory
            category={newCategory}
            refresh={() => {
              fetchCategories();
              setNewCategory(null); // close form after save
            }}
          />
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={addNewCategory}
          className="w-14 h-14 rounded-full bg-[#ff4d4d] text-white
                     flex items-center justify-center shadow-lg 
                     hover:bg-[#e63c3c] transition"
        >
          <Plus size={26} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default Categories;
