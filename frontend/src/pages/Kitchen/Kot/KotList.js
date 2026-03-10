import KotCard from "../Kot/KotCard";

const KotList = ({ title, kots, reload, isReadyColumn = false }) => {

  // FIFO sort for kitchen workflow
  const fifoKots = [...kots].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // GROUP READY + SERVED BY TABLE
  const groupedOrders =
    isReadyColumn
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
   <div className="bg-white rounded-xl shadow-sm flex flex-col h-full">

      <div className="px-4 py-3 border-b font-semibold text-gray-700">
        {title} ({kots.length})
      </div>

      <div className="p-3 space-y-4 overflow-y-auto flex-1">

        {kots.length === 0 && (
          <p className="text-center text-gray-400 text-sm">
            No orders
          </p>
        )}

        {!isReadyColumn &&
          fifoKots.map((kot) => (
            <KotCard key={kot._id} kot={kot} reload={reload} />
          ))}

        {isReadyColumn &&
          Object.values(groupedOrders).map((order) => (
            <div
              key={order.orderId}
              className="border rounded-lg overflow-hidden"
            >
              <div className="px-3 py-2 bg-green-500 text-white text-sm font-semibold">
                Table {order.tableNumber} · {order.areaName}
              </div>

              <div className="p-3 space-y-2">
                {order.kots.map((kot) => (
                  <KotCard
                    key={kot._id}
                    kot={kot}
                    reload={reload}
                    isReadyColumn
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