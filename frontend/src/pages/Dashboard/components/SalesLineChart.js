import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";

export default function SalesLineChart({ data = [] }) {

  const formatted = data.map(d => ({
    day: `${d._id.day}/${d._id.month}`,
    sales: d.total
  }));

  if (!formatted.length) {
    return (
      <div className="bg-card p-6 rounded-xl shadow-card border border-borderLight">
        <h3 className="font-semibold mb-4 text-slate-800">
          Sales Trend
        </h3>
        <p className="text-gray-400 text-sm">
          No sales data
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-5 rounded-xl border border-borderLight shadow-card">

      <h3 className="font-semibold mb-4 text-slate-800">
        Sales Trend
      </h3>

      <div className="w-full h-72">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={formatted}>

            {/* Gradient */}
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9D0942" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#9D0942" stopOpacity={0}/>
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />

            {/* Y Axis */}
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
              }}
              formatter={(value) => [`₹${value}`, "Sales"]}
            />

            {/* Area */}
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#9D0942"
              strokeWidth={3}
              fill="url(#salesGradient)"
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}