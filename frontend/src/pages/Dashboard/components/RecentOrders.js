const orders = [
  { name: "Beef Burger", time: "2:07 PM", amount: "$97.96", status: "Active" },
  { name: "Caesar Salad", time: "12:44 PM", amount: "$76.56", status: "Completed" },
  { name: "Margherita Pizza", time: "12:24 PM", amount: "$98.87", status: "Active" },
];

export default function RecentOrders() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4">Recent Orders</h3>

      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b">
          <tr>
            <th className="text-left pb-2">Order</th>
            <th>Time</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-3">{o.name}</td>
              <td className="text-center">{o.time}</td>
              <td className="text-center">{o.amount}</td>
              <td className="text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    o.status === "Active"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
