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
    <div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {areas.map((area) => (
          <AddArea
            key={area._id}
            area={area}
            refresh={fetchAreas}
          />
        ))}

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

      {/* FAB */}
      <button
        onClick={addNewArea}
        className="
          fixed bottom-6 right-5 md:right-6
          w-14 h-14 rounded-full
          bg-primary text-white
          flex items-center justify-center
          shadow-lg hover:bg-primaryDark transition
        "
      >
        <Plus size={26} strokeWidth={3} />
      </button>

    </div>
  );
};

export default Areas;