import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = {
  paid: "#22C55E",
  partial: "#F97316",
  unpaid: "#EF4444",
};

export default function PaymentStatusChart({ paymentData = [] }) {
  if (!paymentData.length) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4">Payment Status</h3>
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  const total = paymentData.reduce((sum, p) => sum + p.count, 0);

  const formatted = paymentData.map(p => ({
    name: p._id,
    value: total ? Math.round((p.count / total) * 100) : 0,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4">Payment Status</h3>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formatted}
              dataKey="value"
              innerRadius={60}
              outerRadius={80}
            >
              {formatted.map((d, i) => (
                <Cell key={i} fill={COLORS[d.name] || "#CBD5E1"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}