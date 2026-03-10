import { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const AddTable = ({ table = {}, refresh, close }) => {

  const isEditing = !!table._id;

  const [tableNumber, setTableNumber] = useState(table.tableNumber || "");
  const [capacity, setCapacity] = useState(table.capacity || "");
  const [areas, setAreas] = useState([]);
  const [area, setArea] = useState(table.area?._id || "");

  useEffect(() => {
    apiClient
      .get("/area")
      .then((res) => setAreas(res.data))
      .catch(() => toast.error("Failed to load areas"));
  }, []);

  const handleSave = async () => {

    if (!tableNumber.trim() || !capacity || !area) {
      return toast.error("All fields required");
    }

    try {

      if (isEditing) {

        await apiClient.put(`/tables/${table._id}`, {
          tableNumber,
          capacity,
          area,
        });

        toast.success("Table updated");

      } else {

        await apiClient.post("/tables/create", {
          tableNumber,
          capacity,
          area,
        });

        toast.success("Table added");

      }

      refresh();
      close();

    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving table");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-card w-[380px] p-6 rounded-xl border border-borderLight relative shadow-xl">

        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={close}
        >
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-5 text-slate-800">
          {isEditing ? "Edit Table" : "Add Table"}
        </h2>

        <label className="text-sm font-medium">Table Number</label>
        <input
          className="w-full p-2 rounded border border-borderLight focus:border-primary focus:ring-1 focus:ring-primary outline-none mb-3"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
        />

        <label className="text-sm font-medium">Area</label>
        <select
          className="w-full p-2 rounded border border-borderLight bg-white
          focus:border-primary focus:ring-2 focus:ring-primary/20
          outline-none mb-3"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        >
          <option value="">Select Area</option>

          {areas.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}

        </select>

        <label className="text-sm font-medium">Capacity</label>

        <input
          type="number"
          className="w-full p-2 rounded border border-borderLight focus:border-primary focus:ring-1 focus:ring-primary outline-none mb-4"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="w-full bg-primary text-white py-2 rounded hover:bg-primaryDark transition"
        >
          {isEditing ? "Update Table" : "Add Table"}
        </button>

      </div>
    </div>
  );
};

export default AddTable;