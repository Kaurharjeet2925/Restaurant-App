import { useRef } from "react";

const isMobile = () =>
  typeof window !== "undefined" &&
  /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
    navigator.userAgent
  );

const MenuCard = ({
  item,
  totalQty,
  onPress,
  onIncrease,
  onDecrease,
  disabled = false,
}) => {
  const cardRef = useRef(null);

  const handlePointerDown = (e) => {
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
      onClick={!disabled ? onPress : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={resetScale}
      onPointerLeave={resetScale}
      className={`
        bg-card rounded-xl overflow-hidden
        border border-borderLight
        shadow-card
        cursor-pointer select-none
        transition-transform duration-150 ease-out
        hover:shadow-md
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {/* IMAGE */}
      <div className="h-20 bg-background overflow-hidden">
        {item.image ? (
          <img
            src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
            className="h-full w-full object-cover pointer-events-none"
            alt={item.name}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="p-2">
        <h3 className="text-xs font-semibold line-clamp-2 text-gray-800">
          {item.name}
        </h3>

        <div className="flex items-center justify-between mt-2 gap-2">

          {/* PRICE */}
          <p className="text-sm font-bold text-primary shrink-0">
            ₹{item.price}
          </p>

          {/* ADD / QTY */}
          {totalQty === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPress();
              }}
              className="
                h-8 min-w-[64px]
                border border-primary
                text-primary
                rounded-lg
                text-sm font-semibold
                flex items-center justify-center
                active:scale-95 transition
                hover:bg-primary/10
              "
            >
              ADD
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="
                h-8 flex items-center
                border border-primary
                rounded-lg overflow-hidden
              "
            >
              <button
                onClick={onDecrease}
                className="
                  w-8 h-full
                  flex items-center justify-center
                  text-primary
                  hover:bg-primary/10
                "
              >
                −
              </button>

              <span className="w-8 text-center text-sm font-semibold">
                {totalQty}
              </span>

              <button
                onClick={onIncrease}
                className="
                  w-8 h-full
                  flex items-center justify-center
                  text-primary
                  hover:bg-primary/10
                "
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