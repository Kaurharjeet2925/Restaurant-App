import KotCard from "../Kot/KotCard";

const KotList = ({ title, status, kots, reload }) => {
  const filtered = kots.filter(k => k.status === status);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* COLUMN HEADER */}
      <div className="px-4 py-2 border-b font-semibold text-gray-700">
        {title} ({filtered.length})
      </div>

      {/* KOT LIST */}
      <div className="p-3 space-y-3 max-h-[80vh] overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center">
            No orders
          </p>
        )}

        {filtered.map(kot => (
          <KotCard key={`${kot.orderId}-${kot.kotNo}`} kot={kot} reload={reload} />
        ))}
      </div>
    </div>
  );
};

export default KotList;
