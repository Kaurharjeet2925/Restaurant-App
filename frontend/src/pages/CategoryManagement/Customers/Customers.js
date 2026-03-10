import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../apiclient/apiclient";
import CustomerForm from "./CustomerForm";
import CreditPaymentModal from "../../Credit/CreditPaymentModal";
import PageHeader from "../../../components/pageHeader";

import { Plus, Pencil, Trash2, Eye, Wallet } from "lucide-react";

const Customers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [view, setView] = useState("all");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const fetchCustomers = async () => {
    const url = view === "credit" ? "/customers/credit" : "/customers";
    const res = await apiClient.get(url);
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchCustomers();
  }, [view]);

  const handleView = (c) => {
    navigate(`/customers/ledger/${c.customerId}`);
  };

  /* 🔹 FILTER CREDIT CUSTOMERS */
  const filteredCustomers =
    view === "credit"
      ? customers.filter((c) => c.currentBalance !== 0)
      : customers;

  return (
    <div className="min-h-screen">

      {/* MOBILE HEADER */}
      <div className="md:hidden mb-4">
        <PageHeader title={view === "all" ? "Customers" : "Credit Customers"} />

        <div className="flex justify-end p-5">
          <button
            onClick={() => setView(view === "all" ? "credit" : "all")}
            className="px-4 py-2 text-sm rounded-lg text-white bg-primaryGradient shadow"
          >
            {view === "all" ? "Credit Customers" : "All Customers"}
          </button>
        </div>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden md:flex justify-between items-center  p-5">
        <h1 className="text-2xl font-bold text-gray-800">
          {view === "all" ? "Customers" : "Credit Customers"}
        </h1>

        <button
          onClick={() => setView(view === "all" ? "credit" : "all")}
          className="px-4 py-2 rounded-lg text-white font-medium bg-primaryGradient"
        >
          {view === "all" ? "Credit Customers" : "All Customers"}
        </button>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-card rounded-xl shadow-card border border-borderLight overflow-hidden p-5">

        <table className="w-full border-collapse">

          <thead className="bg-primaryLight/60 text-sm text-gray-700">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Customer</th>
              <th className="px-6 py-4 text-left font-semibold">Phone</th>
              <th className="px-6 py-4 text-left font-semibold">Address</th>

              {view === "credit" && (
                <th className="px-6 py-4 text-right font-semibold">
                  Current Balance
                </th>
              )}

              <th className="px-6 py-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map((c) => (

              <tr
                key={c.customerId}
                className="border-t border-borderLight hover:bg-primaryLight/40 transition"
              >

                <td className="px-6 py-4 font-medium text-gray-800">
                  {c.name}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {c.phone}
                </td>

                <td className="px-6 py-4 text-gray-500">
                  {c.address || "-"}
                </td>

                {view === "credit" && (
                  <td className="px-6 py-4 text-right">

                    {c.currentBalance > 0 && (
                      <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600 font-semibold">
                        ₹{c.currentBalance} Debit
                      </span>
                    )}

                    {c.currentBalance < 0 && (
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                        ₹{Math.abs(c.currentBalance)} Credit
                      </span>
                    )}

                  </td>
                )}

                <td className="px-6 py-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() => setEditingCustomer(c)}
                      className="p-2 rounded-lg hover:bg-primaryLight text-primary"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={async () => {
                        if (window.confirm("Delete this customer?")) {
                          await apiClient.delete(`/customers/${c.customerId}`);
                          fetchCustomers();
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>

                    {view === "credit" && (
                      <>
                        <button
                          onClick={() => handleView(c)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCustomer({
                              customerId: c.customerId,
                              name: c.name,
                              totalDue: c.currentBalance,
                            });
                            setShowPayModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                        >
                          <Wallet size={16} />
                        </button>
                      </>
                    )}

                  </div>

                </td>

              </tr>

            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3 px-5">

        {filteredCustomers.map((c) => (

          <div
            key={c.customerId}
            className="bg-card border border-borderLight rounded-xl shadow-card p-4"
          >

            <div className="flex justify-between items-start">

              <div>
                <h3 className="font-semibold text-gray-800">{c.name}</h3>

                <p className="text-sm text-gray-500">{c.phone}</p>

                <p className="text-xs text-gray-400 mt-1">
                  {c.address || "No address"}
                </p>
              </div>

              {view === "credit" && (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    c.currentBalance > 0
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  ₹{Math.abs(c.currentBalance)}{" "}
                  {c.currentBalance > 0 ? "Debit" : "Credit"}
                </span>
              )}

            </div>

            <div className="flex justify-between items-center mt-4 text-sm">

              <button
                onClick={() => setEditingCustomer(c)}
                className="text-primary font-medium"
              >
                Edit
              </button>

              {view === "credit" && (
                <>
                  <button
                    onClick={() => handleView(c)}
                    className="text-gray-700 font-medium"
                  >
                    View
                  </button>

                  <button
                    className="text-green-600 font-medium"
                    onClick={() => {
                      setSelectedCustomer({
                        customerId: c.customerId,
                        name: c.name,
                        totalDue: c.currentBalance,
                      });
                      setShowPayModal(true);
                    }}
                  >
                    Pay
                  </button>
                </>
              )}

            </div>

          </div>

        ))}
      </div>

      {/* ADD CUSTOMER */}
      {view === "all" && (
        <button
          onClick={() => setEditingCustomer({})}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-white bg-primaryGradient flex items-center justify-center shadow-lg"
        >
          <Plus size={28} />
        </button>
      )}

      {/* CUSTOMER FORM */}
      {editingCustomer && (
        <CustomerForm
          customer={editingCustomer}
          close={() => setEditingCustomer(null)}
          refresh={fetchCustomers}
        />
      )}

      {/* CREDIT PAYMENT */}
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