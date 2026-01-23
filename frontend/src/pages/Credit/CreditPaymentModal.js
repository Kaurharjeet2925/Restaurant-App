import { useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../../apiclient/apiclient";

const CreditPaymentModal = ({ order, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);

  const collectPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      return toast.error("Enter valid amount");
    }

    if (Number(amount) > order.dueAmount) {
      return toast.error(`Max payable ₹${order.dueAmount}`);
    }

    try {
      setLoading(true);

      const res = await apiClient.post("/orders/credit/collect", {
        orderId: order._id,
        amount: Number(amount),
        paymentMethod,
      });

      toast.success("Payment collected");
      onSuccess(res.data.order);
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
      <div className="bg-white w-[360px] rounded-lg p-5 relative">

        <h2 className="text-lg font-bold mb-3">Collect Credit Payment</h2>

        <div className="text-sm mb-2">
          <div>Customer: {order.customer?.name}</div>
          <div>Phone: {order.customer?.phone}</div>
        </div>

        <div className="border rounded p-3 mb-3 text-sm">
          <div>Total Bill: ₹{order.totalAmount}</div>
          <div className="font-semibold text-red-600">
            Due Amount: ₹{order.dueAmount}
          </div>
        </div>

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
            Collect
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
