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
    <div className="w-full px-3 pb-2 mt-[78px]">
      <div className="flex bg-background rounded-xl p-1 border border-borderLight shadow-sm">

        {/* DINE-IN */}
        <button
          onClick={() => navigate("/tables")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${
              active === "dinein"
                ? "bg-primary text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          DINE-IN
        </button>

        {/* POS */}
        <button
          onClick={() => navigate("/counter-pos")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${
              active === "pos"
                ? "bg-primary text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          POS
        </button>

      </div>
    </div>
  );
}