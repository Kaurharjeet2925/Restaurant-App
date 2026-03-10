import React, { useState } from "react";

const BillSummary = ({
  mode = "pos",
  order,
  table,
  editable = false,
  cart = [],
  kotSubtotal = 0,
onIncrease,
  onDecrease,
  checkoutTaxPercent,
  setCheckoutTaxPercent,

  servicePercent,
  setServicePercent,

  taxAmount,
  serviceAmount,

  discount,
  setDiscount,

  finalTotal,

  onConfirm,
  onCredit,
  onCancel
}) => {

  const [receivedAmount, setReceivedAmount] = useState(0);

  const change =
    receivedAmount > finalTotal
      ? (receivedAmount - finalTotal).toFixed(2)
      : 0;

  const customerName =
    table?.customerId?.name ||
    order?.customerId?.name ||
    order?.customer ||
    "Walk-in Customer";

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-base font-semibold">Bill Summary</h2>

       
  {mode !== "pos" && (
    <button
      onClick={onCancel}
      className="text-gray-500 hover:text-gray-700 text-sm"
    >
      ✕
    </button>
  )}
      </div>

      {/* ORDER INFO */}
	   {mode === "dine_in" && (
      <div className="border-b py-2 text-xs space-y-0.5">

       
          <>
            <div>
              <span className="font-medium">Order:</span> #{order?.orderNumber}
            </div>

            <div>
              <span className="font-medium">Customer:</span> {customerName}
            </div>

            <div>
              <span className="font-medium">Table:</span> {table?.tableNumber}
            </div>

            <div>
              <span className="font-medium">Area:</span> {table?.area?.name}
            </div>
          </>
        

        {/* {mode === "pos" && (
          <div>
		
              <span className="font-medium">Order:</span> #{order?.orderNumber}
            
            <span className="font-medium">Customer:</span> {customerName}
          </div>
        )} */}

      </div>
)}
      {/* SCROLLABLE ITEMS */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2">

  {cart
    .filter(i => i.qty > 0)
    .map(i => (

      <div
        key={i.cartKey}
        className="flex justify-between items-center text-sm"
      >

        <div>

          <div className="font-medium">
            {i.name}
          </div>

          <div className="text-xs text-gray-500">
            {i.selectedUnit?.name}
          </div>

        </div>

        {/* POS Editable */}
        {editable ? (
          <div className="flex items-center gap-2 bg-background px-2 py-1 rounded">

            <button
              onClick={() => onDecrease(i.cartKey)}
              className="text-gray-600 hover:text-primary"
            >
              −
            </button>

            <span className="font-medium w-5 text-center">
              {i.qty}
            </span>

            <button
              onClick={() => onIncrease(i.cartKey)}
              className="text-gray-600 hover:text-primary"
            >
              +
            </button>

          </div>
        ) : (
          <div className="font-medium">
            × {i.qty}
          </div>
        )}

      </div>

  ))}

</div>

      {/* FIXED BILL SECTION */}
      <div className="border-t pt-2 space-y-1 text-sm">

        {/* SUBTOTAL */}
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>₹{kotSubtotal.toFixed(2)}</span>
        </div>

        {/* GST */}
        <div className="flex items-center gap-2">
          <span className="w-20">GST %</span>

          <input
            type="number"
            value={checkoutTaxPercent}
            onChange={(e) =>
              setCheckoutTaxPercent(Number(e.target.value || 0))
            }
            className="w-14 border rounded p-1 text-xs text-right"
          />

          <span className="ml-auto">
            ₹{taxAmount}
          </span>
        </div>

        {/* SERVICE */}
        <div className="flex items-center gap-2">
          <span className="w-20">Service %</span>

          <input
            type="number"
            value={servicePercent}
            onChange={(e) =>
              setServicePercent(Number(e.target.value || 0))
            }
            className="w-14 border rounded p-1 text-xs text-right"
          />

          <span className="ml-auto">
            ₹{serviceAmount}
          </span>
        </div>

        {/* DISCOUNT */}
        <div className="flex items-center gap-2">
          <span className="w-20">Discount</span>

          <input
            type="number"
            value={discount}
            onChange={(e) =>
              setDiscount(Number(e.target.value || 0))
            }
            className="w-16 border rounded p-1 text-xs text-right"
          />

          <span className="ml-auto">
            -₹{discount}
          </span>
        </div>

        {/* TOTAL */}
        <div className="flex justify-between font-bold border-t pt-1">
          <span>Total</span>
          <span className="text-primary">
            ₹{finalTotal}
          </span>
        </div>

        {/* PAYMENT */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-20 font-medium">Received</span>

          <input
            type="number"
            value={receivedAmount}
            onChange={(e) =>
              setReceivedAmount(Number(e.target.value || 0))
            }
            className="flex-1 border rounded p-1 text-right"
          />
        </div>

        <div className="flex justify-between text-xs font-medium">
          <span>Change</span>
          <span className="text-green-600">
            ₹{change}
          </span>
        </div>

        {/* BUTTONS */}
        {/* BUTTONS */}
<div className="flex gap-2 pt-1">

  {mode === "pos" ? (
    <>
      <button
        onClick={() => onConfirm(receivedAmount)}
        className="flex-1 bg-primary text-white py-2 rounded text-sm font-medium"
      >
        Pay Now
      </button>

      <button
        onClick={onCredit}
        className="flex-1 bg-yellow-500 text-white py-2 rounded text-sm font-medium"
      >
        Pay Later
      </button>
    </>
  ) : (
    <>
      <button
        onClick={() => onConfirm(receivedAmount)}
        className="flex-1 bg-primary text-white py-2 rounded text-sm font-medium"
      >
        Confirm
      </button>

      <button
        onClick={onCancel}
        className="flex-1 bg-gray-200 py-2 rounded text-sm"
      >
        Cancel
      </button>
    </>
  )}

</div>

      </div>

    </div>
  );
};

export default BillSummary;