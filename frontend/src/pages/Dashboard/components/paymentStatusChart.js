import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useState } from "react";

const COLORS = {
  paid: "#22C55E",
  partial: "#F59E0B",
  unpaid: "#EF4444",
};

export default function PaymentStatusChart({ paymentData = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!paymentData.length) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-card">
        <h3 className="font-semibold mb-4 text-slate-800">
          Payment Status
        </h3>
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
    <div className="bg-white rounded-xl shadow-card p-4">

      {/* HEADER */}
      <h3 className="font-semibold mb-3 text-slate-800">
        Payment Status
      </h3>

      <div
        className="relative h-56"
        onMouseLeave={() => setActiveIndex(null)}
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
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[entry.name]}
                      onMouseEnter={() => setActiveIndex(index)}
                    />
                  ))}
                </Pie>

                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 capitalize">
                      {value}
                    </span>
                  )}
                />

              </PieChart>
            </ResponsiveContainer>

            {/* CENTER TEXT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

              {activeSlice ? (
                <>
                  <span className="text-xs text-slate-500 capitalize">
                    {activeSlice.name}
                  </span>

                  <span
                    className={`text-xl font-bold ${
                      {
                        paid: "text-green-600",
                        partial: "text-amber-500",
                        unpaid: "text-red-500",
                      }[activeSlice.name]
                    }`}
                  >
                    {activeSlice.value}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-slate-500">
                    Total
                  </span>

                  <span className="text-xl font-bold text-slate-800">
                    {total}
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