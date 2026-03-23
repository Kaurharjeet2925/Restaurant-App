import { useState, useEffect } from "react";
import { Plus, Car, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../apiclient/apiclient";
import { toast } from "react-toastify";
import CustomerForm from "./CategoryManagement/Customers/CustomerForm";
const statusStyles = {
  free: "bg-green-50 border-green-400",
  running: "bg-red-50 border-red-400",
};

export default function CarobarPage() {

  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [carNo, setCarNo] = useState("");
const [showCustomerModal, setShowCustomerModal] = useState(false);
const [selectedCar, setSelectedCar] = useState(null);

const [customerPhone, setCustomerPhone] = useState("");
const [customerName, setCustomerName] = useState("");
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [areaName, setAreaName] = useState("");

  /* ================= FETCH CARS ================= */

  const fetchCars = async () => {
    try {

      const res = await apiClient.get("/cars");

      setCars(res.data);

    } catch (err) {

      console.log(err);

      toast.error(err.response?.data?.message || "Failed to load cars");

    }
  };

  useEffect(() => {
    fetchCars();
  }, []);


  /* ================= EXTRACT AREAS FROM CARS ================= */

  useEffect(() => {

    if (!cars.length) return;

    const uniqueAreas = [
      ...new Set(cars.map(car => car.area || "Parking"))
    ];

    const formatted = uniqueAreas.map((name, index) => ({
      id: index,
      name
    }));

    setAreas(formatted);

  }, [cars]);


  /* ================= GROUP BY AREA ================= */

  const groupedCars = cars.reduce((acc, car) => {

    const areaName = car.area || "Parking";

    if (!acc[areaName]) acc[areaName] = [];

    acc[areaName].push(car);

    return acc;

  }, {});


  /* ================= ADD CAR ================= */

  const addCar = async () => {

    if (!carNo.trim()) {
      toast.info("Enter car number");
      return;
    }

    let finalArea = "Parking";

    if (selectedArea) {

      const found = areas.find(a => String(a.id) === String(selectedArea));

      if (found) finalArea = found.name;

    }

    if (!selectedArea && areaName.trim()) {
      finalArea = areaName;
    }

    try {

      await apiClient.post("/cars", {
        carNo,
        area: finalArea
      });

      toast.success("Car added");

      setCarNo("");
      setAreaName("");
      setSelectedArea("");

      setShowModal(false);

      fetchCars();

    } catch (err) {

      toast.error(err.response?.data?.message || "Failed to add car");

    }

  };


  /* ================= DELETE CAR ================= */

  const deleteCar = async (id) => {

    if (!window.confirm("Delete this car?")) return;

    try {

      await apiClient.delete(`/cars/${id}`);

      toast.success("Car removed");

      fetchCars();

    } catch (err) {

      toast.error("Cannot delete running car");

    }

  };


  /* ================= OPEN ORDER ================= */

const handleCarClick = (car) => {

  if (car.customerId) {
    navigate(`/orders?carId=${car._id}&carNo=${car.carNo}`);
    return;
  }

  setSelectedCar(car);
};
const fetchCustomer = async (phone) => {

  if (phone.length < 10) return;

  try {

    const res = await apiClient.get(`/customers/phone/${phone}`);

    if (res.data) {
      setCustomerName(res.data.name || "");
    }

  } catch {
    setCustomerName("");
  }

};
const startOrder = () => {

  if (!selectedCar) return;

  setShowCustomerModal(false);

  navigate(
    `/orders?carId=${selectedCar._id}&carNo=${selectedCar.carNo}&customerName=${customerName}&customerPhone=${customerPhone}`
  );

};

  return (

    
    <div className="p-4 bg-background min-h-screen">

      <h1 className="text-2xl font-semibold text-slate-800 mb-4">
        Car-O-Bar
      </h1>


      {Object.keys(groupedCars).map(area => (

        <div key={area} className="mb-6">

          <h2 className="text-md font-semibold text-slate-700 mb-4 border-b pb-1">
            {area}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-3">

            {groupedCars[area].map(car => (

              <div
                key={car._id}
                onClick={() => handleCarClick(car)}
                className={`group relative rounded-xl border-2 h-[130px]
                flex flex-col transition cursor-pointer hover:shadow-lg
                ${statusStyles[car.status]}`}
              >

                <div className="flex-1 flex flex-col items-center justify-center">

                  <h3 className="text-xl font-bold tracking-wide">
                    {car.carNo}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                    <Car size={14}/>
                    {car.status}
                  </div>

                </div>

                <div className="relative h-8 flex items-center justify-center">

                  <span className="text-xs font-medium capitalize group-hover:opacity-0 transition">
                    {car.status}
                  </span>

                  <div className="absolute flex gap-4 opacity-0 group-hover:opacity-100 transition">

                    <button
                      onClick={(e)=>{
                        e.stopPropagation();
                        deleteCar(car._id);
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


      {/* ================= ADD BUTTON ================= */}

      <button
        onClick={()=>setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full
        bg-primary text-white flex items-center justify-center
        shadow-xl hover:bg-primaryDark transition"
      >
        <Plus size={28}/>
      </button>


      {/* ================= MODAL ================= */}

      {showModal && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white w-80 rounded-xl p-6 shadow-xl">

<div className="flex justify-between items-center mb-4">

<h3 className="font-semibold">
Add Car
</h3>

<button onClick={()=>setShowModal(false)}>
<X size={18}/>
</button>

</div>

{/* AREA SELECT */}
<select
value={selectedArea}
onChange={(e)=>setSelectedArea(e.target.value)}
className="w-full border rounded-lg px-3 py-2 mb-3"
>

<option value="">
Create New Area
</option>

{areas.map(a => (
<option key={a.id} value={a.id}>
{a.name}
</option>
))}

</select>

{/* NEW AREA NAME */}
{!selectedArea && (
<input
value={areaName}
onChange={(e)=>setAreaName(e.target.value)}
placeholder="Parking Area Name"
className="w-full border rounded-lg px-3 py-2 mb-3"
/>
)}

{/* CAR NUMBER */}
<input
value={carNo}
onChange={(e)=>setCarNo(e.target.value)}
placeholder="Car Number (UP2457)"
className="w-full border rounded-lg px-3 py-2 mb-4"
/>

<div className="flex justify-end gap-2">

<button
onClick={()=>setShowModal(false)}
className="border px-3 py-1 rounded"
>
Cancel
</button>

<button
onClick={addCar}
className="bg-primary text-white px-3 py-1 rounded"
>
Create
</button>

</div>

</div>

</div>

)}

{selectedCar && (
  <CustomerForm
    mode="dine-in"
    close={() => setSelectedCar(null)}
    onDone={async (customerId) => {

      const res = await apiClient.post(
        `/cars/${selectedCar._id}/start-order`,
        { customerId }
      );

      setSelectedCar(null);
      fetchCars();

      navigate(`/orders?carId=${selectedCar._id}&carNo=${selectedCar.carNo}`);

    }}
  />
)}
    </div>

  );
}