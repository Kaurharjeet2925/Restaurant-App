import KotCard from "../Kot/KotCard";

const KotList = ({ title, kots, reload, isReadyColumn = false }) => {
  // ✅ FIFO SORT for Pending & Preparing
  const fifoKots = [...kots].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // ✅ GROUP ONLY FOR READY COLUMN
  const groupedReadyOrders = isReadyColumn
    ? fifoKots.reduce((acc, kot) => {
        const key = `${kot.orderId}-${kot.tableNumber}`;

        if (!acc[key]) {
          acc[key] = {
            orderId: kot.orderId,
            tableNumber: kot.tableNumber,
            areaName: kot.areaName,
            kots: [],
          };
        }

        acc[key].kots.push(kot);
        return acc;
      }, {})
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm flex flex-col h-full">
      {/* COLUMN HEADER */}
      <div className="px-4 py-2 border-b font-semibold text-gray-700">
        {title} ({kots.length})
      </div>

      <div className="p-3 space-y-4 overflow-y-auto flex-1">
        {kots.length === 0 && (
          <p className="text-sm text-gray-400 text-center">No orders</p>
        )}

        {/* 🔴🟡 PENDING & PREPARING → FIFO QUEUE */}
        {!isReadyColumn &&
          fifoKots.map((kot) => (
            <KotCard
              key={kot._id}
              kot={kot}
              reload={reload}
              isReadyColumn={false}
            />
          ))}

        {/* 🟢 READY → GROUPED BY TABLE */}
        {isReadyColumn &&
          Object.values(groupedReadyOrders)
            .sort((a, b) => {
              const aTime = new Date(a.kots[0].createdAt);
              const bTime = new Date(b.kots[0].createdAt);
              return aTime - bTime; // oldest table first
            })
            .map((order) => (
              <div
                key={order.orderId}
                className="border rounded-lg overflow-hidden"
              >
                {/* ✅ ONE GREEN HEADER */}
                <div className="px-3 py-2 bg-green-500 text-white font-semibold text-sm">
                  Order No {order.orderId.toString().slice(-6)} ·{" "}
                  {order.areaName} · Table {order.tableNumber}
                </div>

                {/* KOTS UNDER SAME TABLE */}
                <div className="p-3 space-y-2">
                  {order.kots
                    .sort(
                      (a, b) =>
                        new Date(a.createdAt) - new Date(b.createdAt)
                    )
                    .map((kot) => (
                      <KotCard
                        key={kot._id}
                        kot={kot}
                        reload={reload}
                        isReadyColumn={true}
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
