import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";

const OrderPage = () => {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState({
    items: [],
    totalAmount: 0,
  });

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = async (id) => {
    const res = await apiClient.get(`/orders/${id}`);
    setOrder(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Create Order
      </h1>

      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg">
        {/* Header */}
        <div className="p-4 border-b">
          <p className="font-semibold">Table ID: {tableId}</p>
        </div>

        {/* Items */}
        <div className="p-4">
          {order.items.length === 0 && (
            <p className="text-gray-400 text-center">
              No items added yet
            </p>
          )}
        </div>

        {/* Add Item */}
        <div className="p-4 border-t">
          <button className="w-full border py-2 rounded">
            + Add Item
          </button>
        </div>

        {/* Submit */}
        <div className="p-4 border-t">
          <button className="w-full bg-green-600 text-white py-3 rounded">
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
};


export default OrderPage;
