import { ArrowLeft , Trash2} from "lucide-react";
import { toast } from "react-toastify";
import KotHistory from "../Order/KotHistory";
import KotPrint from "../Kitchen/Kot/KotPrint";
import { useState, useMemo, useEffect } from "react";
import BillPrint from "../Order/BillPrint";
import BillSummary from "../Order/BillSummary";
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
<div className="h-full mt-20 flex flex-col ">
      {/* HEADER */}
      <div className="bg-card border-borderLight px-4 py-4 flex items-center gap-3 sticky top-0 z-10 mb-4">
        <ArrowLeft
  className="cursor-pointer text-primary"
  onClick={onBack}
/>
        <h2 className="font-semibold text-lg">Your Cart</h2>
      </div>


      {/* ORDER INFO HEADER */}
<div className="mb-4 bg-card border border-borderLight rounded-xl p-4 mx-4 flex items-start justify-between gap-4">        {/* LEFT: Order ID */}
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
              className="flex justify-between items-center border border-borderLight bg-card rounded-lg px-3 py-2 mb-2"
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
  className="w-7 h-7 flex items-center justify-center rounded-md border border-borderLight hover:bg-primary/10"
>
    −
  </button>

  <span className="min-w-[20px] text-center">
    {item.qty}
  </span>

  <button
    onClick={() => onChangeQty(item.cartKey, 1)}
    className="w-7 h-7 flex items-center justify-center rounded-md border border-borderLight hover:bg-primary/10" 
  >
    +
  </button>

  <button
  disabled={item.kotQty > 0}
  className={`ml-1 ${
    item.kotQty > 0
      ? "text-gray-300 cursor-not-allowed"
      : "text-primary hover:opacity-80"
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
        <div className="flex justify-between font-semibold text-lg mt-4 p-4 ">
          <span>Total</span>
          <span className="text-primary">
            ₹{subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
<div className="bg-card border-t border-borderLight px-4 py-3 fixed bottom-0 left-0 right-0 z-20">        <div className="flex gap-2">

          {/* SEND KOT */}
          <button
            onClick={onSendKot}
            disabled={!hasNewItems || isLocked}
            className={`flex-1 py-3 rounded-xl font-semibold ${
              !hasNewItems || isLocked
                ? "bg-gray-300 text-gray-500"
                : "bg-primary text-white"
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
            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold"
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
    <div
      className="fixed inset-0 bg-black/40 z-40"
      onClick={() => setShowBill(false)}
    />

    <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-white rounded-t-2xl shadow-2xl h-[80vh] flex flex-col">
      
      {/* Warning if items not in KOT */}
      {cart.some(i => i.qty > i.kotQty) && (
        <p className="px-4 pt-2 text-xs text-orange-600">
          ⚠️ Some items are not sent to kitchen and are not included in this bill.
        </p>
      )}

      {/* BILL SUMMARY */}
   <BillSummary
  mode="dine_in"
  order={order}
  table={table}
  editable={false}

  cart={cart
    .filter(i => i.kotQty > 0)
    .map(i => ({
      cartKey: i.cartKey,
      name: i.name,
      qty: i.kotQty,
      basePrice: i.basePrice,
      selectedUnit: { name: i.selectedUnit?.name || "Regular" }
    }))
  }

  kotSubtotal={kotSubtotal}

  checkoutTaxPercent={taxPercent}
  setCheckoutTaxPercent={setTaxPercent}

  servicePercent={servicePercent}
  setServicePercent={setServicePercent}

  taxAmount={taxAmount}
  serviceAmount={serviceAmount}

  discount={discount}
  setDiscount={setDiscount}

  finalTotal={finalTotal}

  onConfirm={() => {
    setShowBill(false);
    onCheckout();     // handles payment
  }}

  onCancel={() => setShowBill(false)}
/>

    </div>
  </>
)}

    </div>
  );
}
