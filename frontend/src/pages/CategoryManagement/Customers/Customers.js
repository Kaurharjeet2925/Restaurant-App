import React, { useEffect, useState } from "react";
import apiClient from "../../../apiclient/apiclient";
import CustomerForm from "./CustomerForm";
import { Plus } from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const fetchCustomers = async () => {
    const res = await apiClient.get("/customers");
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold text-gray-800 mb-6">👤 Customers</h1>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600">Name</th>
              <th className="text-left p-4 font-semibold text-gray-600">Phone</th>
              <th className="text-left p-4 font-semibold text-gray-600">Address</th>
              <th className="text-center p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">
                <td className="p-4">{c.name}</td>
                <td className="p-4">{c.phone}</td>
                <td className="p-4">{c.address}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setEditingCustomer(c)}
                    className="text-blue-600 hover:text-blue-800 font-medium mx-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      await apiClient.delete(`/api/customers/${c._id}`);
                      fetchCustomers();
                    }}
                    className="text-red-600 hover:text-red-800 font-medium mx-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD BUTTON */}
      <button
        onClick={() => setEditingCustomer({})}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#ff4d4d] text-white flex items-center justify-center shadow-xl hover:bg-[#e63c3c]"
      >
        <Plus size={28} />
      </button>

      {editingCustomer && (
        <CustomerForm
          customer={editingCustomer}
          close={() => setEditingCustomer(null)}
          refresh={fetchCustomers}
        />
      )}
    </div>
  );
};

export default Customers;
