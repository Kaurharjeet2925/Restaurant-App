import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useState } from "react"; // Added useState import

const COLORS = {
  paid: "#22C55E",
  partial: "#F97316",
  unpaid: "#EF4444",
};

export default function PaymentStatusChart({ paymentData = [] }) {
  const [activeIndex, setActiveIndex] = useState(null); // Added state for active index

  if (!paymentData.length) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4">Payment Status</h3>
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  const total = paymentData.reduce((sum, p) => sum + p.count, 0);

  const chartData = paymentData.map(p => ({
    name: p._id,
    value: total ? Math.round((p.count / total) * 100) : 0,
  }));

  const activeSlice = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="bg-white rounded-xl hover:bg-amber-500/5 transition p-4 border border-gray-200 w-full h-64 mb-3">
      <h4 className="text-sm font-semibold text-gray-700">Payment Status</h4>

      <div
        className="relative h-56"
        onMouseLeave={() => setActiveIndex(null)} // Reset active index on mouse leave
      >
        {total === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-20">
            No payment data
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[entry.name]}
                      onMouseEnter={() => setActiveIndex(index)} // Set active index on hover
                    />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* 🔹 CENTER TEXT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeSlice ? (
                <>
                  <span className="text-xs text-gray-500">
                    {activeSlice.name}
                  </span>
                  <span
                    className={`text-lg font-bold ${{
                      paid: "text-green-600",
                      partial: "text-orange-600",
                      unpaid: "text-red-600",
                    }[activeSlice.name]}`}
                  >
                    {activeSlice.value}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-lg font-bold text-gray-800">
                    {total}%
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}