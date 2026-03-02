export default function TopSellingItems({ items = [] }) {

  if (!items.length) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Top Selling Items</h3>
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <h3 className="font-semibold mb-5 text-slate-800">
        Top Selling Items
      </h3>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"
          >
            <div>
              <p className="font-medium">{item._id}</p>
              <p className="text-xs text-gray-500">
                {item.totalQty} sold
              </p>
            </div>

            <div className="font-semibold text-green-600">
              ₹{item.revenue}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}