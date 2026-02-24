import { ArrowLeft , Trash2} from "lucide-react";
import { toast } from "react-toastify";
import KotHistory from "../Order/KotHistory";
import KotPrint from "../Kitchen/Kot/KotPrint";
import { useState, useMemo, useEffect } from "react";
import BillPrint from "../Order/BillPrint";

export default function CartSheet({
  cart,
  subtotal,
  hasNewItems,
  isLocked,
  order,
  table,
  orderDisplayId,
  onBack,
  onSendKot,
  onCheckout, 
  onChangeQty,
})

{
  const [showBill, setShowBill] = useState(false);

  const [taxPercent, setTaxPercent] = useState(0);
  const [servicePercent, setServicePercent] = useState(0);
  const [discount, setDiscount] = useState(0);
const handleRemove = (item) => {
  if (item.kotQty > 0) {
    toast.info("Item already sent to kitchen");
    return;
  }

  // remove completely
  onChangeQty(item.cartKey, -item.qty);
};

  // Reset bill fields when cart or order changes (e.g., after KOT)
  useEffect(() => {
    setTaxPercent(order?.taxPercent || 0);
    setServicePercent(order?.servicePercent || 0);
    setDiscount(order?.discount || 0);
  }, [cart, order]);
const kotSubtotal = useMemo(() => {
  return cart.reduce((sum, i) => {
    if (i.kotQty === 0) return sum;
    return sum + i.basePrice * i.kotQty;
  }, 0);
}, [cart]);
  const taxAmount = useMemo(
    () => Number(((kotSubtotal * taxPercent) / 100).toFixed(2)),
    [kotSubtotal, taxPercent]
  );
  const serviceAmount = useMemo(
    () => Number(((kotSubtotal * servicePercent) / 100).toFixed(2)),
    [kotSubtotal, servicePercent]
  );
  const finalTotal = useMemo(
    () => Math.max(0, kotSubtotal + taxAmount + serviceAmount - discount),
    [kotSubtotal  , taxAmount, serviceAmount, discount]
  );


  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">

      {/* HEADER */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <ArrowLeft className="cursor-pointer" onClick={onBack} />
        <h2 className="font-semibold text-lg">Your Cart</h2>
      </div>


      {/* ORDER INFO HEADER */}
      <div className="mb-4 border-b pb-3 px-4 pt-4 flex items-start justify-between gap-4">
        {/* LEFT: Order ID */}
        <div>
          <div className="text-xs text-gray-500">Order ID</div>
          <div className="font-bold text-lg text-gray-800">#{orderDisplayId}</div>
        </div>
        {/* RIGHT: Table, Area, Customer, Mobile */}
        <div className="text-right flex flex-col items-end gap-1 min-w-[120px]">
          {(table?.tableNumber || order?.tableNumber) && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">Table:</span> {table?.tableNumber || order?.tableNumber}
            </div>
          )}
          {(table?.area?.name || order?.area?.name) && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">Area:</span> {table?.area?.name || order?.area?.name}
            </div>
          )}
          {((table && table?.customerId) || order?.customerId || order?.customer) && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">Customer:</span> {(table?.customerId?.name) || (order?.customerId?.name) || order?.customer || ""}
            </div>
          )}
          {((table && table?.customerId) || order?.customerId || order?.customer) && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">Mobile:</span> {(table?.customerId?.phone) || (order?.customerId?.phone) || ""}
            </div>
          )}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 pb-40">

        {/* CART ITEMS */}
        {cart.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            Cart is empty
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.cartKey}
              className="flex justify-between items-center border-b pb-2 mb-2"
            >
              <div>
               <p className="font-medium flex items-center gap-2">
  {item.name}


  {item.qty > item.kotQty && (
    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
  )}
</p>

                <p className="text-xs text-gray-500">
                  {item.selectedUnit?.name}
                </p>
              </div>

            <div className="flex items-center gap-2">
  <button
    onClick={() => onChangeQty(item.cartKey, -1)}
    className="px-2"
  >
    −
  </button>

  <span className="min-w-[20px] text-center">
    {item.qty}
  </span>

  <button
    onClick={() => onChangeQty(item.cartKey, 1)}
    className="px-2"
  >
    +
  </button>

  <button
  disabled={item.kotQty > 0}
  className={`ml-1 ${
    item.kotQty > 0
      ? "text-gray-300 cursor-not-allowed"
      : "text-red-500"
  }`}
>
  <Trash2 size={16} />
</button>

</div>

            </div>
          ))
        )}

        {/* KOT HISTORY */}
        {order?.kots?.length > 0 && (
          <div className="bg-white rounded-xl p-3 mt-4">
            <KotHistory order={order} scrollable={false} />
          </div>
        )}

        {/* TOTAL */}
        <div className="flex justify-between font-semibold text-lg mt-4">
          <span>Total</span>
          <span className="text-red-500">
            ₹{subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="bg-white border-t px-4 py-3 fixed bottom-0 left-0 right-0 z-20">
        <div className="flex gap-2">

          {/* SEND KOT */}
          <button
            onClick={onSendKot}
            disabled={!hasNewItems || isLocked}
            className={`flex-1 py-3 rounded-xl font-semibold ${
              !hasNewItems || isLocked
                ? "bg-gray-300 text-gray-500"
                : "bg-gray-800 text-white"
            }`}
          >
            Send KOT
          </button>

          {/* CHECKOUT */}
          <button
            onClick={() => {
              if (!order?.kots?.length) {
                toast.info("Create KOT before checkout");
                return;
              }
              setShowBill(true);
            }}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* HIDDEN PRINTS */}
      <div style={{ display: "none" }}>
        {order?.kots?.map((kot) => (
          <div key={kot.kotNo} id={`kot-print-${kot.kotNo}`}>
            <KotPrint kot={kot} order={order} />
          </div>
        ))}
      </div>
      {/* HIDDEN BILL PRINT AREA - always rendered if order exists */}
      {order && (
        <div style={{ display: "none" }}>
          <div id="bill-print">
            <BillPrint order={order} />
          </div>
        </div>
      )}
      {/* ================= BILL SUMMARY MODAL ================= */}
      {showBill && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowBill(false)}
          />

          {/* BOTTOM SHEET */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto animate-slideUp">
            {/* HEADER */}
            <div className="p-4 border-b font-semibold flex justify-between">
              <span>Bill Summary</span>
              <button onClick={() => setShowBill(false)}>✕</button>
            </div>
{cart.some(i => i.qty > i.kotQty) && (
  <p className="px-4 pt-2 text-xs text-orange-600">
    ⚠️ Some items are not sent to kitchen and are not included in this bill.
  </p>
)}

            {/* ITEMS */}
            <div className="p-4 space-y-2 text-sm">
             {cart.filter(i => i.kotQty > 0).map(i => (
  <div key={i.cartKey} className="flex justify-between">
    <span>
      {i.name} ({i.selectedUnit?.name}) × {i.kotQty}
    </span>
    <span>₹{(i.basePrice * i.kotQty).toFixed(2)}</span>
  </div>
))}

            </div>

            {/* SUBTOTAL */}
            <div className="px-4 flex justify-between text-sm font-medium border-t pt-2">
              <span>Subtotal</span>
              <span>₹{kotSubtotal.toFixed(2)}</span>
            </div>

            {/* GST */}
            <div className="px-4 flex items-center gap-2 text-sm mt-2">
              <label className="w-20">GST (%)</label>
              <input
                type="number"
                min="0"
                value={taxPercent}
                onChange={e => setTaxPercent(Number(e.target.value || 0))}
                className="w-16 p-1 border rounded text-right"
              />
              <span className="ml-auto">₹{taxAmount}</span>
            </div>


            {/* SERVICE */}
            <div className="px-4 flex items-center gap-2 text-sm mt-2">
              <label className="w-20">Service (%)</label>
              <input
                type="number"
                min="0"
                value={servicePercent}
                onChange={e => setServicePercent(Number(e.target.value || 0))}
                className="w-16 p-1 border rounded text-right"
              />
              <span className="ml-auto">₹{serviceAmount}</span>
            </div>

            {/* DISCOUNT */}
            <div className="px-4 flex items-center gap-2 text-sm mt-2">
              <label className="w-20">Discount</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value || 0))}
                className="w-20 p-1 border rounded text-right"
              />
              <span className="ml-auto">-₹{discount}</span>
            </div>

            {/* TOTAL */}
            <div className="px-4 flex justify-between text-lg font-bold border-t pt-3 mt-2">
              <span>Total</span>
              <span className="text-red-500">₹{finalTotal}</span>
            </div>

            {/* ACTIONS */}
            <div className="p-4 flex gap-2">
              <button
                onClick={() => {
                  setShowBill(false);
                  onCheckout();
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold"
              >
                Mark Paid
              </button>
              <button
                onClick={() => setShowBill(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
