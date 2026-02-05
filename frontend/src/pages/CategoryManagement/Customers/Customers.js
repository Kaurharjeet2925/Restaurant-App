import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../apiclient/apiclient";
import CustomerForm from "./CustomerForm";
import { Plus, User2Icon } from "lucide-react";
import CreditPaymentModal from "../../Credit/CreditPaymentModal";

const Customers = () => {
    const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [view, setView] = useState("all"); // all | credit
  const [selectedOrder, setSelectedOrder] = useState(null);
const [showCollectModal, setShowCollectModal] = useState(false);
const [selectedCustomer, setSelectedCustomer] = useState(null);
const [showPayModal, setShowPayModal] = useState(false);

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
    <div className="py-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <User2Icon size={28} className="text-gray-800" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 whitespace-nowrap">
            {view === "all" ? "All Customers" : "Credit Customers"}
          </h1>
        </div>
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
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b">
  <tr>
    <th className="text-left p-4">
      <span className="inline sm:hidden">Name</span>
      <span className="hidden sm:inline">Customer Name</span>
    </th>
    <th className="text-left p-4">
      <span className="inline sm:hidden">Phone</span>
      <span className="hidden sm:inline">Phone Number</span>
    </th>
    {view === "all" && (
      <th className="text-left p-4">
        <span className="inline sm:hidden">Addr</span>
        <span className="hidden sm:inline">Address</span>
      </th>
    )}
    {view === "credit" && (
      <th className="text-right p-4">
        <span className="inline sm:hidden">Amount</span>
        <span className="hidden sm:inline">Current Amount</span>
      </th>
    )}
    <th className="text-center p-4">
      <span className="inline sm:hidden">Actions</span>
      <span className="hidden sm:inline">Actions</span>
    </th>
  </tr>
</thead>

            <tbody>
              {customers.map((c) => (
<tr key={c.customerId} className="border-b hover:bg-gray-50">

                <td className="p-4">{c.name}</td>
                <td className="p-4">{c.phone}</td>

                {/* ALL CUSTOMERS */}
                {view === "all" && (
                  <td className="p-4">{c.address || "-"}</td>
                )}

                {/* CREDIT CUSTOMERS */}
                {view === "credit" && (
                  <td className="p-4 text-right font-semibold">
                    {c.currentBalance > 0 ? (
                      <span className="text-red-600">₹{c.currentBalance} Debit</span>
                    ) : c.currentBalance < 0 ? (
                      <span className="text-green-700">₹{Math.abs(c.currentBalance)} Credit</span>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
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
                          if (window.confirm("Are you sure you want to delete this customer?")) {
    await apiClient.delete(`/customers/${c.customerId}`);
    fetchCustomers();
  }
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
  setSelectedCustomer({
    customerId: c.customerId, // ✅ NOW EXISTS
      name: c.name,
      totalDue: c.totalDue,
  });
  setShowPayModal(true);
}}

>
  Pay Now
</button>


                      <button
                        className="px-3 py-1 rounded bg-gray-700 text-white text-sm"
                        onClick={() => {
                          // Navigate to customer ledger page
                          navigate(`/customers/ledger/${c.customerId}`);
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
  {showPayModal && selectedCustomer && (
  <CreditPaymentModal
    customer={selectedCustomer}
    onClose={() => setShowPayModal(false)}
    onSuccess={fetchCustomers}
  />
)}



    </div>
  );
};

export default Customers;
