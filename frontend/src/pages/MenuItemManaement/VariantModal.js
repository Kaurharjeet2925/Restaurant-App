import { useEffect } from "react";

const VariantModal = ({ item, cart = [], onQtyChange, onClose }) => {
  const units = item.portionType.units;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, []);

  // get qty of specific variant
const getQty = (unitName) =>
  cart.find(
    (c) =>
      c.menuItemId === item._id &&
      (c.selectedUnit?.name === unitName ||
       c.unit?.name === unitName)
  )?.qty || 0;


  // get price of variant
  const getPrice = (unit) =>
    item.portionType.pricingRule === "percentage"
      ? Math.round((item.price * unit.value) / 100)
      : unit.value;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* CENTER MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white w-full max-w-sm rounded-xl shadow-xl overflow-hidden m-4">

          {/* HEADER */}
          <div className="p-4 flex items-center gap-3 border-b">
            {item.image && (
              <img
                src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
                className="w-14 h-14 rounded-lg object-cover"
                alt={item.name}
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-2xl font-bold text-[#ff4d4d]"
            >
              ✕
            </button>
          </div>

          {/* VARIANTS */}
          <div className="p-4 space-y-4">
            {units.map((unit) => {
              const qty = getQty(unit.name);
              const price = getPrice(unit);

              return (
                <div
                  key={unit.name}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{unit.name}</p>
                    <p className="text-sm text-gray-500">₹{price}</p>
                  </div>

                  <div className="flex items-center border border-[#ff4d4d] rounded-lg">
                    <button
                      className="px-3 text-lg text-[#ff4d4d]"
                      disabled={qty === 0}
                      onClick={() =>
                        qty > 0 && onQtyChange(item, unit, -1)
                      }
                    >
                      −
                    </button>

                    <span className="px-3 font-semibold">
                      {qty}
                    </span>

                    <button
                      className="px-3 text-lg text-[#ff4d4d]"
                      onClick={() =>
                        onQtyChange(item, unit, 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
};

export default VariantModal;
