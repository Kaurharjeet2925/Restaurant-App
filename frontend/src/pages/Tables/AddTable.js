import { useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const AddTable = ({ table = {}, refresh, close }) => {
  const isEditing = !!table._id;

  const [tableNumber, setTableNumber] = useState(table.tableNumber || "");
  const [capacity, setCapacity] = useState(table.capacity || "");

  const handleSave = async () => {
    if (!tableNumber || !capacity) {
      return toast.error("All fields required");
    }

    try {
      if (isEditing) {
        await apiClient.put(`/tables/${table._id}`, {
          tableNumber,
          capacity,
        });
        toast.success("Table updated");
      } else {
        await apiClient.post("/tables/create", {
          tableNumber,
          capacity,
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[350px] p-6 rounded-xl shadow relative">

        <button className="absolute top-3 right-3" onClick={close}>
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Table" : "Add Table"}
        </h2>

        <label className="text-sm font-medium">Table Number</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
        />

        <label className="text-sm font-medium">Capacity</label>
        <input
          type="number"
          className="border w-full p-2 rounded mb-4"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="w-full bg-[#ff4d4d] text-white py-2 rounded hover:bg-[#e63c3c]"
        >
          {isEditing ? "Update Table" : "Add Table"}
        </button>
      </div>
    </div>
  );
};

export default AddTable;
