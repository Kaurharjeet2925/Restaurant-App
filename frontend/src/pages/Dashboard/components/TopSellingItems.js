export default function TopSellingItems({ items = [] }) {

  if (!items.length) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-slate-800">
          Top Selling Items
        </h3>
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  const maxQty = Math.max(...items.map(i => i.totalQty));

  return (
    <div>
      <h3 className="font-semibold mb-5 text-slate-800">
        Top Selling Items
      </h3>

      <div className="space-y-3">

        {items.map((item, i) => {

          const percent = (item.totalQty / maxQty) * 100;

          return (
            <div
              key={i}
              className="bg-slate-50 hover:bg-slate-100 transition rounded-xl p-4"
            >

              {/* TOP ROW */}
              <div className="flex justify-between items-center">

                <div className="flex items-center gap-3">

                  {/* RANK */}
                  <div className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                    {i + 1}
                  </div>

                  <div>
                    <p className="font-medium text-slate-800">
                      {item._id}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.totalQty} sold
                    </p>
                  </div>

                </div>

                <div className="font-semibold text-green-600">
                  ₹{item.revenue}
                </div>

              </div>

              {/* PROGRESS BAR */}
              <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">

                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${percent}%` }}
                />

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}