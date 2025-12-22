import { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { Plus, Users } from "lucide-react";
import { toast } from "react-toastify";
import AddTable from "./AddTable";
import { useNavigate } from "react-router-dom";

// POS colors
const statusStyles = {
  free: "bg-green-50 border-green-400",
  occupied: "bg-red-50 border-red-400",
  reserved: "bg-yellow-50 border-yellow-400",
};

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [editingTable, setEditingTable] = useState(null);
  const navigate = useNavigate();

  const handleTableClick = (table) => {
  // 🚫 Reserved table → no action
  if (table.status === "reserved") return;

  const query = new URLSearchParams({
    tableId: table._id,
    orderId: table.currentOrderId || "",
  }).toString();

  navigate(`/orders?${query}`);
};


  const fetchTables = async () => {
    try {
      const res = await apiClient.get("/tables");
      setTables(res.data);
    } catch {
      toast.error("Failed to load tables");
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const deleteTable = async (id) => {
    if (!window.confirm("Delete this table?")) return;
    await apiClient.delete(`/tables/${id}`);
    fetchTables();
  };

  // Group tables by area
  const groupedTables = tables.reduce((acc, table) => {
    const areaName = table.area?.name || "Unassigned";
    acc[areaName] = acc[areaName] || [];
    acc[areaName].push(table);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🍽️ Tables
      </h1>

      {Object.keys(groupedTables).map((area) => (
        <div key={area} className="mb-5">
          {/* Area title */}
          <h2 className="text-md font-semibold text-gray-700 mb-5 border-b pb-1">
            {area}
          </h2>

          {/* POS GRID */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                       lg:grid-cols-6 xl:grid-cols-10 gap-2"
          >
            {groupedTables[area].map((table) => {
              const isOccupied = table.status === "occupied";

              return (
      <div
  key={table._id}
  onClick={() => handleTableClick(table)}
  className={`group relative rounded-xl border-2 h-[130px]
    aspect-[1/1.15]
    flex flex-col
    transition
    ${statusStyles[table.status]}
    cursor-pointer hover:shadow-lg`}
>
  {/* CENTER CONTENT */}
  <div className="flex-1 flex flex-col items-center justify-center">
    <h3 className="text-xl font-bold tracking-wide">
      {table.tableNumber}
    </h3>

    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
      <Users size={14} />
      {table.capacity}
    </div>
  </div>

  {/* FOOTER */}
  <div className="relative h-8 flex items-center justify-center">
    <span className="text-xs font-medium capitalize group-hover:opacity-0 transition">
      {table.status}
    </span>

    <div className="absolute flex gap-4 opacity-0 group-hover:opacity-100 transition">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditingTable(table);
        }}
        className="text-blue-600 text-xs hover:underline"
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteTable(table._id);
        }}
        className="text-red-600 text-xs hover:underline"
      >
        Del
      </button>
    </div>
  </div>
</div>





              );
            })}
          </div>
        </div>
      ))}

      {/* ADD TABLE BUTTON */}
      <button
        onClick={() => setEditingTable({})}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full
                   bg-[#ff4d4d] text-white flex items-center
                   justify-center shadow-xl hover:bg-[#e63c3c]"
      >
        <Plus size={28} />
      </button>

      {/* MODAL */}
      {editingTable && (
        <AddTable
          table={editingTable}
          close={() => setEditingTable(null)}
          refresh={fetchTables}
        />
      )}
    </div>
  );
};

export default Tables;
