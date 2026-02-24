const orders = [
  {
    id: "ORD-201",
    items: "Burger, Fries",
    type: "Dine-In",
    status: "Pending",
  },
  {
    id: "ORD-202",
    items: "Pizza",
    type: "Delivery",
    status: "Processing",
  },
  {
    id: "ORD-203",
    items: "Pasta",
    type: "Dine-In",
    status: "Ready",
  },
  {
    id: "ORD-204",
    items: "Sandwich",
    type: "Delivery",
    status: "Completed",
  },
];

const STATUS_STYLE = {
  Pending: "bg-gray-100 text-gray-700",
  Processing: "bg-orange-100 text-orange-600",
  Ready: "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
};

export default function KitchenOrdersBoard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow">
      <h2 className="font-semibold mb-4">Kitchen Orders</h2>

      <table className="w-full text-sm">
        <thead className="border-b text-gray-500">
          <tr>
            <th className="text-left py-2">Order ID</th>
            <th className="text-left">Items</th>
            <th className="text-left">Type</th>
            <th className="text-left">Status</th>
            <th className="text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
              onClick={() => alert(`Open order ${order.id}`)}
            >
              <td className="py-3 font-medium text-orange-600">
                {order.id}
              </td>
              <td>{order.items}</td>
              <td>{order.type}</td>
              <td>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${STATUS_STYLE[order.status]}`}
                >
                  {order.status}
                </span>
              </td>
              <td>
                <button className="text-xs text-blue-600 hover:underline">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
