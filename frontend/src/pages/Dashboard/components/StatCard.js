import {
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const StatCard = ({ title, value, highlight, data = [] }) => {

  const chartData = data.map((v, i) => ({
    x: i,
    y: v
  }));

  const gradientId = `statGradient-${title.replace(/\s+/g, "")}`;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-borderLight p-5 transition-all shadow-card
      ${
        highlight
          ? "bg-primaryGradient text-white"
          : "bg-card hover:shadow-md"
      }`}
    >

      {/* TITLE */}
      <p className={`text-sm ${highlight ? "text-white/80" : "text-slate-500"}`}>
        {title}
      </p>

      {/* VALUE */}
      <h2 className="text-2xl font-bold mt-2">
        {value}
      </h2>

      {/* CHART ONLY FOR NON HIGHLIGHT CARDS */}
      {!highlight && data.length > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-20 opacity-60">

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9D0942" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#9D0942" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <Area
                type="monotone"
                dataKey="y"
                stroke="#9D0942"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={true}
              />

            </AreaChart>
          </ResponsiveContainer>

        </div>
      )}

    </div>
  );
};

export default StatCard;