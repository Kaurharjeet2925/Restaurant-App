import React, { useEffect, useState } from "react";
import apiClient from "../../../apiclient/apiclient";
import { toast } from "react-toastify";
import { Check, Trash2 } from "lucide-react";

const AddArea = ({ area = {}, refresh }) => {
  const isEditing = !!area._id;

  const [originalName, setOriginalName] = useState(area.name || "");
  const [name, setName] = useState(area.name || "");
  const [isChanged, setIsChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsChanged(name.trim() !== originalName.trim());
  }, [name, originalName]);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Area name required");

    try {
      setSaving(true);

      if (isEditing) {
        await apiClient.put(`/area/${area._id}`, { name });
        toast.success("Area updated");
        setOriginalName(name.trim());
      } else {
        await apiClient.post("/area/create", { name });
        toast.success("Area added");
        setName("");
        setOriginalName("");
      }

      setIsChanged(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!area._id) return refresh();
    if (!window.confirm("Delete this area?")) return;

    try {
      await apiClient.delete(`/area/${area._id}`);
      toast.success("Area deleted");
      refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-3">
      <label className="text-gray-700 text-sm font-medium">
        Area Name
      </label>

      <input
        type="text"
        value={name}
        placeholder="e.g., Main Area, AC Hall"
        onChange={(e) => setName(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm
                   focus:ring-1 focus:ring-[#ff4d4d]
                   focus:border-[#ff4d4d]"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={handleSave}
          disabled={!isChanged || saving}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition shadow-sm
            ${(!isChanged || saving)
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-100 text-green-700 hover:bg-green-200"}`}
        >
          <Check size={16} />
        </button>

        {isEditing && (
          <button
            onClick={handleDelete}
            className="w-9 h-9 flex items-center justify-center
                       bg-red-100 text-red-700 rounded-full
                       hover:bg-red-200 transition shadow-sm"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AddArea;
