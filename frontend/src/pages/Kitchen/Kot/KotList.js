import KotCard from "../Kot/KotCard";

const KotList = ({ title, kots, reload }) => {
  // 🔥 group by table
  const groupedByTable = kots.reduce((acc, kot) => {
    const tableKey = `Table ${kot.tableNumber}`;
    if (!acc[tableKey]) acc[tableKey] = [];
    acc[tableKey].push(kot);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-sm flex flex-col h-full">
      <div className="px-4 py-2 border-b font-semibold text-gray-700">
        {title} ({kots.length})
      </div>

      <div className="p-3 space-y-4 overflow-y-auto flex-1">
        {Object.keys(groupedByTable).length === 0 && (
          <p className="text-sm text-gray-400 text-center">
            No orders
          </p>
        )}

        {Object.entries(groupedByTable).map(([table, tableKots]) => (
          <div key={table} className="border rounded-lg">
            {/* TABLE HEADER */}
            <div className="px-3 py-2 bg-gray-100 font-semibold text-sm">
              {table}
            </div>

            {/* TABLE KOTS */}
            <div className="p-3 space-y-3">
              {tableKots.map((kot) => (
                <KotCard
                  key={kot._id}
                  kot={kot}
                  reload={reload}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KotList;
