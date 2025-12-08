import React from "react";
import apiClient from "../../apiclient/apiclient";
import { toast } from "react-toastify";

const CategoryList = ({ categories, refresh }) => {
  const deleteCategory = async (id) => {
    try {
      await apiClient.delete(`/category/${id}`);
      toast.success("Category deleted");
      refresh();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Category</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="border-b">
              <td className="p-3 text-gray-700">{cat.name}</td>
              <td className="p-3 text-center">
                <button
                  onClick={() => deleteCategory(cat._id)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td colSpan="2" className="text-center p-4 text-gray-500">
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;
