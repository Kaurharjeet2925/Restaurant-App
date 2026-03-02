import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Plus,History, Minus, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState, useMemo, useEffect, memo } from 'react';
import { useOrder } from '../../hooks/useOrder';
import KotHistory from "../Order/KotHistory";
import KotPrint from "../Kitchen/Kot/KotPrint";
import BillPrint from "../Order/BillPrint";
import CartSheet from './CartSheet';

import MenuCard from '../Order/MenuCard';
import VariantModal from "../MenuItemManaement/VariantModal"
// Memoized category button for performance
const CategoryButton = memo(({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
      active
        ? 'bg-red-500 text-white shadow-lg'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label === 'all' ? 'All Items' : label}
  </button>
));

CategoryButton.displayName = 'CategoryButton';

// Memoized menu item card for performance
// const MenuItemCard = memo(({ item, isLocked, onAddItem, onOpenVariant }) => (
//   <button
//     onClick={() => onAddItem(item, onOpenVariant)}
//     disabled={isLocked}
//     className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all ${
//       isLocked ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
//     }`}
//   >
// <div className="h-20 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
//       {item.image ? (
//         <img
//           src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
//           className="h-full w-full object-cover"
//           alt={item.name}
//           loading="lazy"
//         />
//       ) : (
//         <div className="h-full w-full bg-gray-300" />
//       )}
//     </div>
//   <div className="p-2">
//   <p className="text-xs font-semibold line-clamp-2 text-gray-900">
//     {item.name}
//   </p>
//   <p className="text-sm font-bold text-red-500 leading-tight">
//     ₹{item.price}
//   </p>
// </div>

//   </button>
// ));

// MenuItemCard.displayName = 'MenuItemCard';

// // Memoized variant modal
// const VariantModal = memo(({ item, onSelect, onClose }) => (
//   <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//     <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
//       <div className="p-4 border-b flex justify-between items-center">
//         <h3 className="font-bold text-lg">Select Size</h3>
//         <button onClick={onClose} className="text-gray-500">
//           <X size={24} />
//         </button>
//       </div>
//       <div className="p-4 space-y-3">
//         {item.portionType.units.map((unit) => (
//           <button
//             key={unit._id}
//             onClick={() => onSelect(unit)}
//             className="w-full flex justify-between items-center border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-red-500 hover:bg-red-50 transition-all"
//           >
//             <span className="font-medium text-gray-900">{unit.name}</span>
//             <span className="font-bold text-red-500">
//               ₹
//               {item.portionType.pricingRule === 'percentage'
//                 ? ((item.price * unit.value) / 100).toFixed(0)
//                 : unit.value}
//             </span>
//           </button>
//         ))}
//       </div>
//     </div>
//   </div>
// ));

// VariantModal.displayName = 'VariantModal';

// Memoized cart item
const CartItem = memo(({ item, onChangeQty }) => (
  <div className="flex justify-between items-center py-3 border-b last:border-0">
    <div className="flex-1">
      <p className="font-semibold text-gray-900">{item.name}</p>
      <p className="text-sm text-gray-500">{item.selectedUnit?.name}</p>
    </div>
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChangeQty(item.cartKey, -1)}
        className="p-1 hover:bg-gray-200 rounded transition-all"
      >
        <Minus size={16} />
      </button>
      <span className="w-6 text-center font-semibold">{item.qty}</span>
      <button
        onClick={() => onChangeQty(item.cartKey, 1)}
        className="p-1 hover:bg-gray-200 rounded transition-all"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>
));

CartItem.displayName = 'CartItem';

const CheckoutSheet = memo(
  ({
    cart,
    subtotal,
    taxAmount,
    serviceAmount,
    taxPercent,
    setTaxPercent,
    servicePercent,
    setServicePercent,
    discount,
    setDiscount,
    finalTotal,
    hasKots,
    onMarkPaid,
    onCancel,
  }) => (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onCancel} />

      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto">

        {/* HEADER */}
        <div className="p-4 border-b font-semibold">
          Bill Summary
        </div>

        {/* ITEMS */}
        <div className="p-4 space-y-2 text-sm">
          {cart.filter(i => i.qty > 0).map(i => (
            <div key={i.cartKey} className="flex justify-between">
              <span>
                {i.name} ({i.selectedUnit?.name}) × {i.qty}
              </span>
              <span>₹{(i.basePrice * i.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* SUBTOTAL */}
        <div className="px-4 flex justify-between font-medium border-t pt-2">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        {/* GST */}
        {/* GST */}
        <div className="px-4 flex justify-between items-center text-sm mt-3 border-t pt-3">
          <div className="flex items-center gap-2">
            <label className="font-medium">GST (%)</label>
            <input
              type="number"
              min="0"
              value={taxPercent}
              onChange={(e) =>
                setTaxPercent(Number(e.target.value || 0))
              }
              className="w-16 p-1 border rounded"
            />
          </div>
          <span className="font-medium">
            ₹{taxAmount.toFixed(2)}
          </span>
        </div>

        {/* SERVICE */}
        <div className="px-4 flex justify-between items-center text-sm mt-2">
          <div className="flex items-center gap-2">
            <label className="font-medium">Service (%)</label>
            <input
              type="number"
              min="0"
              value={servicePercent}
              onChange={(e) =>
                setServicePercent(Number(e.target.value || 0))
              }
              className="w-16 p-1 border rounded"
            />
          </div>
          <span className="font-medium">
            ₹{serviceAmount.toFixed(2)}
          </span>
        </div>

        {/* DISCOUNT */}
        <div className="px-4 flex justify-between items-center text-sm mt-2">
          <div className="flex items-center gap-2">
            <label className="font-medium">Discount (₹)</label>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={e => setDiscount(Number(e.target.value || 0))}
              className="w-20 p-1 border rounded"
            />
          </div>
          <span className="font-medium">
            -₹{discount.toFixed(2)}
          </span>
        </div>

        {/* TOTAL */}
        <div className="px-4 flex justify-between text-lg font-bold border-t pt-3 mt-2">
          <span>Total</span>
          <span className="text-red-500">₹{finalTotal.toFixed(2)}</span>
        </div>

        {/* WARNING */}
        {!hasKots && (
          <p className="px-4 text-xs text-red-500 mt-1">
            Cannot checkout — no KOT created
          </p>
        )}

        {/* ACTIONS */}
        <div className="p-4 flex gap-2">
          <button
            onClick={onMarkPaid}
            disabled={!hasKots}
            className={`flex-1 py-3 rounded-xl text-white font-semibold ${
              hasKots ? "bg-[#ff4d4d]" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Mark Paid
          </button>

          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 py-3 rounded-xl"
          >
            Cancel
          </button>
        </div>

      </div>
    </>
  )
);




CheckoutSheet.displayName = 'CheckoutSheet';

export default function MobileOrderPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tableId = params.get('tableId');
  const [showHistory, setShowHistory] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCartPage, setShowCartPage] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [variantItem, setVariantItem] = useState(null);

const handlePaymentAndNavigate = async () => {
  const success = await handleCashPayment();

  if (success) {
    setTimeout(() => {
      navigate("/tables", { replace: true });
    }, 1200); // ⬅️ increase delay
  }
};

const {
  table,
  menu,
  categories,
  activeCat,
  setActiveCat,
  cart,
  addItem,
  changeQty,
  removeItem,
  order,
  isLocked,
  hasNewItems,
  checkoutMode,
  subtotal,
  taxPercent,
  taxAmount,
  serviceAmount,
  setTaxPercent,
  servicePercent,
  setServicePercent,
  discount,
  setDiscount,
  finalTotal,
  sendAndPrintKOT,
  printBill,
  printKot,
  handleStartCheckout,
  handleCashPayment,
  setCheckoutMode,
} = useOrder({ tableId });

useEffect(() => {
  if (!order || order.paymentStatus !== "paid") return;

  const el = document.getElementById("bill-print");
  if (!el) return;

  const win = window.open("", "_blank", "width=300,height=600");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Bill</title>
        <style>
          body { font-family: monospace; padding: 10px; }
        </style>
      </head>
      <body>${el.innerHTML}</body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
}, [order]);

  // Filter menu
  const filteredMenu = useMemo(() => {
    if (activeCat === 'all') return menu;
    return menu.filter((i) => (i.category?.name || i.category) === activeCat);
  }, [menu, activeCat]);

  if (!tableId) {
    toast.info('Select a table first');
    navigate('/tables');
    return null;
  }

  const handleAddItem = (item, onOpenVariant) => {
    const portion = item.portionType;

    if (!portion?.units?.length) {
      toast.error('Invalid portion config');
      return;
    }

    if (portion.units.length === 1) {
      addItem(item, portion.units[0]);
    } else {
      onOpenVariant(item);
    }
  };
  const orderDisplayId = order?._id ? `ORD${String(order._id).slice(-4).toUpperCase()}` : "";

  if (showCartPage) {
    return (
      <CartSheet
        cart={cart}
        subtotal={subtotal}
        hasNewItems={hasNewItems}
        isLocked={isLocked}
        order={order}
        table={table}
        orderDisplayId={orderDisplayId}
        onBack={() => setShowCartPage(false)}
        onSendKot={sendAndPrintKOT}
        onChangeQty={changeQty}
        onCheckout={handlePaymentAndNavigate}
      />
    );
  }

const getItemVariants = (itemId) =>
  cart.filter((i) => i.menuItemId === itemId);

// total qty (all variants combined)
const getItemTotalQty = (itemId) =>
  getItemVariants(itemId).reduce((s, i) => s + i.qty, 0);

// check if item has multiple variants in cart
const hasMultipleVariantsInCart = (itemId) =>
  getItemVariants(itemId).length > 1;

const updateVariantQty = (item, unit, diff) => {
  const key = `${item._id}_${unit.name}`;

 const existing = cart.find(
  (i) => i.cartKey === key || i.key === key
);


  // ➖ decrease
  if (existing && diff < 0) {
    changeQty(key, -1);
    return;
  }

  // ➕ increase existing
  if (existing && diff > 0) {
    changeQty(key, 1);
    return;
  }

  // ➕ add new variant
  if (!existing && diff > 0) {
    addItem(item, unit, 1);
  }
};





  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="native-swipe gap-2 px-3 py-2 whitespace-nowrap">
  <button
    onClick={() => setActiveCat("all")}
    className="shrink-0 px-4 py-2 rounded-full bg-red-500 text-white"
  >
    All Items
  </button>

  {categories.map((c) => (
    <button
      key={c}
      onClick={() => setActiveCat(c)}
      className="shrink-0 px-4 py-2 rounded-full bg-gray-100"
    >
      {c}
    </button>
  ))}
</div>


      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-2 sm:p-4 pb-40">
     {filteredMenu.map((item) => {
  const totalQty = getItemTotalQty(item._id);
  const variantsInCart = getItemVariants(item._id);
  const hasVariants = item.portionType?.units?.length > 1;
  const multipleVariants = hasMultipleVariantsInCart(item._id);

  return (
    <MenuCard
  item={item}
  totalQty={totalQty}

  /* CARD CLICK / ADD */
  onPress={() => {
    if (hasVariants) {
      setVariantItem(item);   // ✅ always ask variant
    } else {
      addItem(item, null);
    }
  }}

  /* PLUS */
  onIncrease={() => {
    if (hasVariants && multipleVariants) {
      // ❌ more than one variant → ask user
      setVariantItem(item);
    } else {
      // ✅ only one variant → safe increment
      changeQty(variantsInCart[0].cartKey, 1);
    }
  }}

  /* MINUS */
  onDecrease={() => {
    if (hasVariants && multipleVariants) {
      // ❌ more than one variant → ask user
      setVariantItem(item);
    } else {
      // ✅ only one variant → safe decrement
      changeQty(variantsInCart[0].cartKey, -1);
    }
  }}
/>

  );
})}


        </div>
      </div>

      {/* Floating Cart Button */}
    {/* ================= VIEW CART BAR ================= */}
{cart.length > 0 && !checkoutMode && (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
    <button
   onClick={() => setShowCartPage(true)}
      className="w-full flex justify-between items-center px-4 py-4"
    >
      <div className="flex items-center gap-2 font-semibold">
        <ShoppingCart size={20} />
       <span className="flex items-center gap-2">
  {cart.reduce((s, i) => s + i.qty, 0)} Items

  {hasNewItems && (
    <span className="w-2 h-2 bg-red-500 rounded-full" />
  )}
</span>

      </div>

      <div className="font-bold">
        ₹{subtotal.toFixed(2)}
      </div>
    </button>
  </div>
)}




      {/* Variant Modal */}
  {variantItem && (
  <VariantModal
    item={variantItem}
    cart={cart}
    onQtyChange={updateVariantQty}
    onClose={() => setVariantItem(null)}
  />
)}



      {/* Checkout Sheet */}
   {/* {checkoutMode && (
  <CheckoutSheet
    cart={cart}
    subtotal={subtotal}
    taxAmount={taxAmount}
    serviceAmount={serviceAmount}
    taxPercent={taxPercent}
    setTaxPercent={setTaxPercent}
    servicePercent={servicePercent}
    setServicePercent={setServicePercent}
    discount={discount}
    setDiscount={setDiscount}
    finalTotal={finalTotal}
    hasKots={order?.kots?.length > 0}
    onMarkPaid={handlePaymentAndNavigate}
    onCancel={() => setShowCartPage(false)}
  />
)} */}


{showHistory && order && (
  <div className="fixed inset-0 bg-black/40 z-50 p-4">
    <div className="bg-white rounded-xl p-4 max-h-full overflow-y-auto">
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold">KOT History</h3>
        <X onClick={() => setShowHistory(false)} />
      </div>
    
      <KotHistory order={order} scrollable={false} />
    </div>
  </div>
)}


 {/* ================= HIDDEN BILL PRINT ================= */}
<div style={{ position: "absolute", left: "-9999px", top: 0 }}>
  <div id="bill-print">
    <BillPrint
      order={order}
      subtotal={subtotal}
      taxAmount={taxAmount}
      serviceAmount={serviceAmount}
      discount={discount}
      total={finalTotal}
    />
  </div>
</div>


    </div>
  );
}
