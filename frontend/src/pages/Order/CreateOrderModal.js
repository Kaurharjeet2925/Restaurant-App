import { X, Plus, Minus } from "lucide-react";
import { useState } from "react";

const CreateOrderModal = ({ table, onClose, onCreate }) => {
  const [orderType, setOrderType] = useState("dine-in");
  const [customerName, setCustomerName] = useState("");
  const [guests, setGuests] = useState(1);

  const handleSubmit = () => {
    onCreate({
      tableId: table._id,
      orderType,
      customerName,
      guests,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[360px] rounded-xl p-5 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400"
        >
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          Create New Order
        </h2>

        {/* Order Type */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setOrderType("dine-in")}
            className={`flex-1 py-2 rounded-lg text-sm ${
              orderType === "dine-in"
                ? "bg-teal-600 text-white"
                : ""
            }`}
          >
            Dine In
          </button>
          <button
            onClick={() => setOrderType("takeaway")}
            className={`flex-1 py-2 rounded-lg text-sm ${
              orderType === "takeaway"
                ? "bg-teal-600 text-white"
                : ""
            }`}
          >
            Takeaway
          </button>
        </div>

        {/* Customer */}
        <label className="text-sm text-gray-600">
          Customer Name
        </label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
          placeholder="Customer name"
        />

        {/* Guests */}
        <label className="text-sm text-gray-600">Guest</label>
        <div className="flex items-center justify-between border rounded-lg px-3 py-2 mb-4">
          <button onClick={() => setGuests(Math.max(1, guests - 1))}>
            <Minus />
          </button>
          <span>{guests} Person</span>
          <button onClick={() => setGuests(guests + 1)}>
            <Plus />
          </button>
        </div>

        {/* Table */}
        <label className="text-sm text-gray-600">Choose Table</label>
        <div className="border rounded-lg px-3 py-2 mb-5">
          {table.tableNumber}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-yellow-400 py-3 rounded-lg font-semibold"
        >
          Create Order
        </button>
      </div>
    </div>
  );
};

export default CreateOrderModal;
