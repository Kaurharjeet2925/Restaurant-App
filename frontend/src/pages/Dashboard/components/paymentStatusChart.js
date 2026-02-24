import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";

const COLORS = {
  Paid: "#22C55E",
  Partial: "#F97316",
  Unpaid: "#EF4444",
};

const chartData = [
  { name: "Paid", value: 65 },
  { name: "Partial", value: 20 },
  { name: "Unpaid", value: 15 },
];

const ordersByStatus = {
  Paid: ["FD-8091", "FD-8092", "FD-8093"],
  Partial: ["FD-8094", "FD-8095"],
  Unpaid: ["FD-8096"],
};

export default function PaymentStatusChart() {
  const [selectedStatus, setSelectedStatus] = useState(null);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4">Payment Status</h3>

      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="w-40 h-40">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={55}
                outerRadius={70}
                onClick={(data) => setSelectedStatus(data.name)}
              >
                {chartData.map((d, i) => (
                  <Cell key={i} fill={COLORS[d.name]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-sm">
          {chartData.map((d) => (
            <div
              key={d.name}
              onClick={() => setSelectedStatus(d.name)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: COLORS[d.name] }}
              />
              <span>{d.name}</span>
              <span className="font-semibold">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {selectedStatus && (
        <div className="mt-5 border-t pt-4">
          <p className="text-sm font-medium mb-2">
            Orders with {selectedStatus} payment
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            {ordersByStatus[selectedStatus].map((id) => (
              <li key={id} className="bg-gray-100 px-3 py-1 rounded">
                {id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
