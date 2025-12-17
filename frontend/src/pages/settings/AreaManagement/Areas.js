import React, { useEffect, useState } from "react";
import apiClient from "../../../apiclient/apiclient";
import AddArea from "./AddArea";
import { Plus } from "lucide-react";

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [newArea, setNewArea] = useState(null);

  const fetchAreas = async () => {
    const res = await apiClient.get("/area");
    setAreas(res.data);
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const addNewArea = () => {
    setNewArea({ name: "", isNew: true });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-12">
        🏢 Areas / Floors
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Existing Areas */}
        {areas.map((area) => (
          <AddArea
            key={area._id}
            area={area}
            refresh={fetchAreas}
          />
        ))}

        {/* New Area */}
        {newArea && (
          <AddArea
            area={newArea}
            refresh={() => {
              fetchAreas();
              setNewArea(null);
            }}
          />
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={addNewArea}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full
                   bg-[#ff4d4d] text-white flex items-center justify-center
                   shadow-lg hover:bg-[#e63c3c] transition"
      >
        <Plus size={26} strokeWidth={3} />
      </button>
    </div>
  );
};

export default Areas;
