import { useRef } from "react";

// Utility to detect mobile device
const isMobile = () =>
  typeof window !== "undefined" &&
  (/Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent));

const MenuCard = ({
  item,
  totalQty,
  onPress,        // ✅ single required handler
  onIncrease,
  onDecrease,
}) => {
  const cardRef = useRef(null);

  const handlePointerDown = (e) => {
    // ❌ no bounce if button is clicked
    if (e.target.closest("button")) return;
    if (isMobile()) {
      cardRef.current?.classList.add("scale-95");
    }
  };

  const resetScale = () => {
    if (isMobile()) {
      cardRef.current?.classList.remove("scale-95");
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={onPress}
      onPointerDown={handlePointerDown}
      onPointerUp={resetScale}
      onPointerLeave={resetScale}
      className="
        bg-white rounded-xl overflow-hidden border
        cursor-pointer select-none
        transition-transform duration-150 ease-out
      "
    >
      {/* IMAGE */}
      <div className="h-20 bg-slate-200 overflow-hidden">
        {item.image ? (
          <img
            src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
            className="h-full w-full object-cover pointer-events-none"
            alt={item.name}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            No Image
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="p-2">
        <h3 className="text-xs font-semibold line-clamp-2">
          {item.name}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-bold text-[#ff4d4d]">
            ₹{item.price}
          </p>

          {/* ADD / QTY */}
          {totalQty === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation(); // 🛑 prevent card click
                onPress();           // ✅ same logic
              }}
              className="
                border border-[#ff4d4d] text-[#ff4d4d]
                px-3 py-1 rounded-lg text-sm font-semibold
                active:bg-[#ff4d4d]/10
              "
            >
              ADD
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center border border-[#ff4d4d] rounded-lg"
            >
              <button
                onClick={onDecrease}
                className="px-2 text-lg text-[#ff4d4d]"
              >
                −
              </button>

              <span className="px-3 text-sm font-semibold">
                {totalQty}
              </span>

              <button
                onClick={onIncrease}
                className="px-2 text-lg text-[#ff4d4d]"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
