import { useNavigate, useLocation } from "react-router-dom";

export default function MobileTopTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const active =
    location.pathname === "/dashboard/counter-pos" ||
    location.pathname === "/dashboard/pos" ||
    location.pathname === "/counter-pos"
      ? "pos"
      : "dinein";

  return (
    <div className="">
      <div className="flex bg-gray-100 rounded-xl p-2">
        <button
          onClick={() => navigate("/tables")}
          className={`flex-1 py-2 rounded-lg font-semibold transition
            ${
              active === "dinein"
                ? "bg-[#ff4d4d] text-white shadow"
                : "text-gray-600"
            }`}
        >
          DINE-IN
        </button>

        <button
          onClick={() => navigate("/counter-pos")}
          className={`flex-1 py-2 rounded-lg font-semibold transition
            ${
              active === "pos"
                ? "bg-[#ff4d4d] text-white shadow"
                : "text-gray-600"
            }`}
        >
          POS
        </button>
      </div>
    </div>
  );
}
