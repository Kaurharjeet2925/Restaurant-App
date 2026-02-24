import { useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../../apiclient/apiclient";

const CreditPaymentModal = ({ customer, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);

  const collectPayment = async () => {

    if (!amount || Number(amount) <= 0) {
      return toast.error("Enter valid amount");
    }

    try {
      setLoading(true);
      const amt = Number(amount);
      const isAdvance = amt > customer.totalDue;
      await apiClient.post("/customers/credit/pay", {
        customerId: customer.customerId,
        amount: amt,
        paymentMethod,
        isAdvance,
        description: description.trim() ? description : "Payment received",
      });
      toast.success(isAdvance ? "Advance received" : "Payment collected");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[360px] rounded-lg p-5">

        <h2 className="text-lg font-bold mb-3">
          Collect Credit Payment
        </h2>

        <div className="text-sm mb-3">
          <div>Customer: {customer.name}</div>
          <div className="font-semibold text-red-600">
            Due: ₹{customer.totalDue}
          </div>
          <div className="text-green-700">
            {Number(amount) > customer.totalDue && (
              <>Advance: ₹{Number(amount) - customer.totalDue}</>
            )}
          </div>
        </div>


        <label className="text-sm">Description <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border w-full p-2 rounded mb-3"
          placeholder="Enter payment description"
        />

        <label className="text-sm">Amount Received</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border w-full p-2 rounded mb-3"
        />

        <label className="text-sm">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border w-full p-2 rounded mb-4"
        >
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={collectPayment}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded"
          >
            {loading ? "Collecting..." : "Collect"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditPaymentModal;
