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
   <div className="bg-card border border-borderLight rounded-xl shadow-card flex flex-col h-full">

<div className="px-4 py-3 border-b border-borderLight flex justify-between items-center">

<span className="font-semibold text-gray-700">
{title}
</span>

<span className="text-sm font-semibold text-primary">
{kots.length}
</span>

</div>

<div className="p-4 space-y-4 overflow-y-auto flex-1">

{kots.length === 0 && (
<p className="text-center text-gray-400 text-sm">
No orders
</p>
)}

{!isReadyColumn &&
fifoKots.map((kot)=>(
<KotCard key={kot._id} kot={kot} reload={reload}/>
))}

</div>

</div>
  );
};

export default KotList;