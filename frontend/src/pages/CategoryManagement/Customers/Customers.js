import React, { useEffect, useState } from "react";
import apiClient from "../../../apiclient/apiclient";
import CustomerForm from "./CustomerForm";
import { Plus } from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [view, setView] = useState("all"); // all | credit

  const fetchCustomers = async () => {
    const url =
      view === "credit"
        ? "/customer/credit"   // 🔥 credit customers API
        : "/customers";

    const res = await apiClient.get(url);
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchCustomers();
  }, [view]);

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          👤 {view === "all" ? "All Customers" : "Credit Customers"}
        </h1>

        <button
          onClick={() =>
            setView(view === "all" ? "credit" : "all")
          }
          className={`px-4 py-2 rounded-lg font-medium shadow ${
            view === "all"
              ? "bg-yellow-500 text-white"
              : "bg-[#ff4d4d] text-white"
          }`}
        >
          {view === "all" ? "Credit Customers" : "All Customers"}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Phone</th>

              {view === "all" && (
                <th className="text-left p-4">Address</th>
              )}

              {view === "credit" && (
                <th className="text-right p-4">Due Amount</th>
              )}

              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">

                <td className="p-4">{c.name}</td>
                <td className="p-4">{c.phone}</td>

                {/* ALL CUSTOMERS */}
                {view === "all" && (
                  <td className="p-4">{c.address || "-"}</td>
                )}

                {/* CREDIT CUSTOMERS */}
                {view === "credit" && (
                  <td className="p-4 text-right font-semibold text-red-600">
                    ₹{c.totalDue || 0}
                  </td>
                )}

                <td className="p-4 text-center">

                  {/* 🔹 ALL CUSTOMERS ACTIONS */}
                  {view === "all" && (
                    <>
                      <button
                        onClick={() => setEditingCustomer(c)}
                        className="text-blue-600 mx-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          await apiClient.delete(`/customers/${c._id}`);
                          fetchCustomers();
                        }}
                        className="text-red-600 mx-2"
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {/* 🔹 CREDIT CUSTOMERS ACTIONS */}
                  {view === "credit" && (
                    <div className="flex justify-center gap-3">
                      <button
                        className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                        onClick={() => {
                          // 🔥 open Pay Now modal
                          console.log("Pay now:", c);
                        }}
                      >
                        Pay Now
                      </button>

                      <button
                        className="px-3 py-1 rounded bg-gray-700 text-white text-sm"
                        onClick={() => {
                          // 🔥 open View Ledger modal/page
                          console.log("View ledger:", c);
                        }}
                      >
                        View
                      </button>
                    </div>
                  )}

                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ➕ ADD CUSTOMER (ONLY FOR ALL) */}
      {view === "all" && (
        <button
          onClick={() => setEditingCustomer({})}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#ff4d4d] text-white flex items-center justify-center shadow-xl"
        >
          <Plus size={28} />
        </button>
      )}

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
