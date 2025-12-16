import { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import AddTable from "./AddTable";


const statusStyles = {
  free: "bg-green-100 border-green-400",
  occupied: "bg-red-100 border-red-400",
  reserved: "bg-yellow-100 border-yellow-400",
};

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [editingTable, setEditingTable] = useState(null);

  const fetchTables = async () => {
    try {
      const res = await apiClient.get("/tables");
      setTables(res.data);
    } catch (err) {
      toast.error("Failed to load tables");
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const changeStatus = async (id, status) => {
    await apiClient.patch(`/tables/${id}/status`, { status });
    fetchTables();
  };

  const deleteTable = async (id) => {
    if (!window.confirm("Delete this table?")) return;
    await apiClient.delete(`/tables/${id}`);
    fetchTables();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🍽️ Tables</h1>

      {/* TABLE CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div
            key={table._id}
            className={`border-2 rounded-xl p-4 shadow ${statusStyles[table.status]}`}
          >
            <h2 className="text-xl font-bold">
              Table {table.tableNumber}
            </h2>

            <p className="text-sm">Capacity: {table.capacity}</p>
            <p className="text-sm font-semibold capitalize mb-3">
              Status: {table.status}
            </p>

            {/* STATUS BUTTONS */}
            <div className="flex gap-2 mb-3">
              {["free", "occupied", "reserved"].map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(table._id, s)}
                  className="text-xs px-2 py-1 border rounded hover:bg-white"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between">
              <button
                onClick={() => setEditingTable(table)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTable(table._id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD TABLE BUTTON */}
      <button
        onClick={() => setEditingTable({})}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#ff4d4d] text-white flex items-center justify-center shadow-xl"
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
