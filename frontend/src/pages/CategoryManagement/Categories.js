import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import AddCategory from "./AddCategory";
import CategoryList from "./CategoriesList";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    const res = await apiClient.get("/category");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Categories</h1>

      <AddCategory onCategoryAdded={fetchCategories} />

      <CategoryList categories={categories} refresh={fetchCategories} />
    </div>
  );
};

export default Categories;
