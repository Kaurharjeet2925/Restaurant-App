import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import AddCategory from "./AddCategory";
import { Plus } from "lucide-react";
import PageHeader from "../../components/pageHeader";
import { Utensils } from "lucide-react";

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
    <div className="">
      <PageHeader title="Categories" icon={<Utensils size={24}/>} />
      {/* GRID */}
         <div className="px-5 pb-6 ">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ">

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
         className="fixed bottom-6 right-5 md:right-6 w-14 h-14 rounded-full bg-primary text-white 
        flex items-center justify-center shadow-lg hover:bg-primaryGradient transition"
        >
          <Plus size={26} strokeWidth={3} />
        </button>
      </div>
      </div>
    </div>
  );
};

export default Categories;
