const StatCard = ({ title, value, highlight }) => {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm border transition-all
        ${highlight
          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
          : "bg-white"
        }`}
    >
      <p className={`text-sm ${highlight ? "text-white/80" : "text-slate-500"}`}>
        {title}
      </p>

      <h2 className="text-2xl font-bold mt-2">
        {value}
      </h2>
    </div>
  );
};

export default StatCard;