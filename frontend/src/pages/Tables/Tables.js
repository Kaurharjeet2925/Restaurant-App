import { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { Plus, Users } from "lucide-react";
import { toast } from "react-toastify";
import AddTable from "./AddTable";
import { useNavigate } from "react-router-dom";
import CustomerForm from "../CategoryManagement/Customers/CustomerForm";

const statusStyles = {
  free: "bg-green-50 border-green-400",
  occupied: "bg-red-50 border-red-400",
  reserved: "bg-yellow-50 border-yellow-400",
};

const Tables = () => {

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [editingTable, setEditingTable] = useState(null);

  const navigate = useNavigate();

  const handleTableClick = (table) => {

    if (table.status === "reserved") return;

    if (table.status === "occupied") {
      navigate(`/orders?tableId=${table._id}`);
      return;
    }

    setSelectedTable(table);

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

  const groupedTables = tables.reduce((acc, table) => {
    const areaName = table.area?.name || "Unassigned";
    acc[areaName] = acc[areaName] || [];
    acc[areaName].push(table);
    return acc;
  }, {});

  return (
    <div className="p-4 bg-background min-h-screen">

      <h1 className="text-2xl font-semibold text-slate-800 mb-4">
        Tables
      </h1>

      {Object.keys(groupedTables).map((area) => (

        <div key={area} className="mb-6">

          <h2 className="text-md font-semibold text-slate-700 mb-4 border-b pb-1">
            {area}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-3">

            {groupedTables[area].map((table) => (

              <div
                key={table._id}
                onClick={() => handleTableClick(table)}
                className={`group relative rounded-xl border-2 h-[130px]
                flex flex-col transition cursor-pointer hover:shadow-lg
                ${statusStyles[table.status]}`}
              >

                {/* CENTER */}
                <div className="flex-1 flex flex-col items-center justify-center">

                  <h3 className="text-xl font-bold tracking-wide">
                    {table.tableNumber}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                    <Users size={14}/>
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
                      className="text-primary text-xs hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTable(table._id);
                      }}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Del
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        </div>
      ))}

      {/* ADD BUTTON */}
      <button
        onClick={() => setEditingTable({})}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full
        bg-primary text-white flex items-center justify-center
        shadow-xl hover:bg-primaryDark transition"
      >
        <Plus size={28}/>
      </button>

      {editingTable && (
        <AddTable
          table={editingTable}
          close={() => setEditingTable(null)}
          refresh={fetchTables}
        />
      )}

      {selectedTable && (
        <CustomerForm
          mode="dine-in"
          close={() => setSelectedTable(null)}
          onDone={async (customerId) => {

            await apiClient.patch(
              `/tables/${selectedTable._id}/occupy`,
              { customerId }
            );

            setSelectedTable(null);
            fetchTables();

            navigate(`/orders?tableId=${selectedTable._id}`);

          }}
        />
      )}

    </div>
  );
};

export default Tables;