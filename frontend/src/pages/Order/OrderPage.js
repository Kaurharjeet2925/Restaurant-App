import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../apiclient/apiclient";
import { Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import KotHistory from "./KotHistory";
import KotPrint from "../Kitchen/Kot/KotPrint";
import BillPrint from "./BillPrint";

const OrderPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tableId = params.get("tableId");

  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [loading, setLoading] = useState(true);
 const [checkoutMode, setCheckoutMode] = useState(false);
const [variantModalItem, setVariantModalItem] = useState(null);
const getDefaultUnit = (portionType) => {
  if (!portionType || !Array.isArray(portionType.units) || portionType.units.length === 0) {
    return null;
  }
  return portionType.units[0]; // compulsory unit
};


  // ✅ SINGLE SOURCE OF TRUTH
  const [order, setOrder] = useState(null);
  const orderDisplayId = useMemo(
    () => (order?._id ? `ORD${String(order._id).slice(-4).toUpperCase()}` : ""),
    [order]
  );
  
  useEffect(() => {
    
    if (!tableId) {
      toast.info("Please select a table first");
      navigate("/tables", { replace: true });
    }
  }, [tableId, navigate]);

  /* ================= FETCH ORDER ================= */
const fetchOrder = useCallback(async (id) => {
  
  try {
    
    const res = await apiClient.get(`/orders/${id}`);
    const ord = res.data;

    setOrder(ord);

   const grouped = ord.items.reduce((acc, i) => {
  const key = `${i.menuItemId}_${i.variant || "default"}`;

  if (!acc[key]) {
    acc[key] = {
      cartKey: key,
      menuItemId: i.menuItemId,
      name: i.name,
      basePrice: i.price,
      selectedUnit: { name: i.variant, value: 100 },
      qty: 0,
      kotQty: 0,
      portionType: null, // optional for display only
    };
  }

  acc[key].qty += i.qty;
  acc[key].kotQty += i.qty;
  return acc;
}, {});


    setCart(Object.values(grouped));

    return ord; // 🔥 REQUIRED FOR PRINT & SEND
  } catch (error) {
    toast.error("Failed to load order");
    return null; // 🔒 safety
  }
}, []);



  // stable reload function passed to children (prevents unnecessary remounts)
  const reloadOrder = useCallback(() => {
    if (order?._id) fetchOrder(order._id);
  }, [fetchOrder, order?._id]);
  /* ================= LOAD ================= */
  useEffect(() => {
    if (!tableId) return;

    const loadData = async () => {
      try {
        const [tableRes, menuRes] = await Promise.all([
          apiClient.get(`/tables/${tableId}`),
          apiClient.get("/menu"),
        ]);

        setTable(tableRes.data);
        setMenu(menuRes.data || []);

        if (tableRes.data.currentOrderId) {
          await fetchOrder(tableRes.data.currentOrderId, menuRes.data);
        }
      } catch (err) {
        toast.error("Failed to load POS");
        navigate("/tables");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tableId, fetchOrder, navigate]);

  /* ================= CATEGORIES ================= */
  useEffect(() => {
    setCategories([
      ...new Set(menu.map((i) => i.category?.name || i.category).filter(Boolean)),
    ]);
  }, [menu]);

  const filteredMenu =
    activeCat === "all"
      ? menu
      : menu.filter(
          (i) => (i.category?.name || i.category) === activeCat
        );

  /* ================= CART ================= */
const addItem = (menuItem, unit = null) => {
  const portion = menuItem.portionType;
  const selectedUnit = unit || getDefaultUnit(portion);

  if (!selectedUnit) {
    toast.error(`Invalid portion config for ${menuItem.name}`);
    return;
  }

  // Use same cartKey logic as fetchOrder: menuItemId + variant name
  const cartKey = `${menuItem._id}_${selectedUnit.name || "default"}`;

  setCart(prev => {
    const existing = prev.find(
      i => i.cartKey === cartKey
    );

    if (existing) {
      return prev.map(i =>
        i.cartKey === cartKey
          ? { ...i, qty: i.qty + 1 }
          : i
      );
    }

    return [
      ...prev,
      {
        cartKey,
        menuItemId: menuItem._id,
        name: menuItem.name,
        basePrice: menuItem.price,
        portionType: portion,
        selectedUnit,
        qty: 1,
        kotQty: 0,
      },
    ];
  });
};

const changeQty = (cartKey, diff) => {
  if (isLocked) return;

  setCart((prev) =>
    prev
      .map((i) =>
        i.cartKey === cartKey
          ? { ...i, qty: i.qty + diff }
          : i
      )
      .filter((i) => i.qty > 0)
  );
};




  // Remove item from cart
 const removeItem = (cartKey) => {
  if (isLocked) {
    toast.info("Order is locked");
    return;
  }

  setCart((prev) => {
    const item = prev.find((i) => i.cartKey === cartKey);
    if (!item) return prev;

    // 🔒 KOT safety
    if (item.kotQty > 0) {
      if (item.qty === item.kotQty) {
        toast.info("Item already sent to kitchen");
        return prev;
      }

      return prev.map((i) =>
        i.cartKey === cartKey
          ? { ...i, qty: item.kotQty }
          : i
      );
    }

    return prev.filter((i) => i.cartKey !== cartKey);
  });
};


const printKot = (kot) => {
  const el = document.getElementById(`kot-print-${kot.kotNo}`);
  if (!el) {
    toast.warn("Print content not ready yet");
    return;
  }

  const win = window.open("", "_blank", "width=300,height=600");
  if (!win) {
    toast.warn("Popup blocked. Allow popups to print KOT.");
    return;
  }

  win.document.open();
  win.document.write(`
    <html>
      <head>
        <title>KOT</title>
        <style>
          body { font-family: monospace; padding: 10px; }
        </style>
      </head>
      <body>
        ${el.innerHTML}
      </body>
    </html>
  `);
  win.document.close();

  win.focus();
  win.print();
};

const printBill = (order) => {
  const el = document.getElementById("bill-print");
  if (!el) {
    toast.warn("Bill not ready for print");
    return;
  }

  const win = window.open("", "_blank", "width=300,height=600");
  if (!win) {
    toast.warn("Popup blocked. Allow popups to print bill.");
    return;
  }

  win.document.write(`
    <html>
      <head>
        <title>Bill</title>
        <style>
          body { font-family: monospace; padding: 10px; }
        </style>
      </head>
      <body>
        ${el.innerHTML}
      </body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
};

  /* ================= SEND KOT ================= */
const sendAndPrintKOT = async () => {
  if (!order?._id) {
    toast.error("Order not initialized");
    return;
  }

  if (!hasNewItems) {
    toast.info("No new items to send");
    return;
  }

  try {
    const newItems = cart
      .filter(i => i.qty > i.kotQty)
     .map(i => ({
  menuItemId: i.menuItemId,          
  name: i.name,
  price: calculateItemTotal(i) / i.qty, // optional but better
  qty: i.qty - i.kotQty,
  variant: i.selectedUnit?.name || null // optional (recommended)
}));


    await apiClient.put(`/orders/${order._id}`, { items: newItems });

    // Lock local cart
    setCart(prev => prev.map(i => ({ ...i, kotQty: i.qty })));

    const updatedOrder = await fetchOrder(order._id);

    const latestKot =
      updatedOrder?.kots?.[updatedOrder.kots.length - 1];

    // ⏳ WAIT FOR DOM RENDER
    setTimeout(() => {
      if (latestKot) {
        printKot(latestKot);
        toast.success("KOT sent & printed");
      } else {
        toast.success("KOT sent");
      }
    }, 300); // 🔥 critical delay
  } catch (err) {
    toast.error("Failed to send KOT");
  }
};


const handleCashPayment = async () => {
  if (!order?._id) return;

  try {
    const res = await apiClient.post(`/orders/${order._id}/bill`, {
      taxPercent: checkoutTaxPercent,
      servicePercent,
      discount,
    });

    toast.success("Payment successful");

    setOrder(res.data.order);
    setCheckoutMode(false);

    // ⏳ wait for DOM
    setTimeout(() => {
      printBill(res.data.order);
    }, 300);

    setTimeout(() => navigate("/tables", { replace: true }), 800);
  } catch (err) {
    toast.error(err.response?.data?.message || "Payment failed");
  }
};

// Prevent entering checkout when there are no KOTs
const handleStartCheckout = () => {
  if (!order?.kots || order.kots.length === 0) {
    toast.info("Cannot checkout: no KOTs created yet");
    return;
  }

  setCheckoutMode(true);
};

const calculateItemTotal = (item) => {
  if (!item?.selectedUnit) return 0;

  // Fallback if portionType missing (from order fetch)
  const rule = item.portionType?.pricingRule || "percentage";

  if (rule === "percentage") {
    return item.basePrice * (item.selectedUnit.value / 100) * item.qty;
  }

  if (rule === "per_unit") {
    return item.selectedUnit.value * item.qty;
  }

  return 0;
};



const hasNewItems = useMemo(
  () => cart.some(i => i.qty > i.kotQty),
  [cart]
);

const subtotal = useMemo(
  () => cart.reduce((s, i) => s + calculateItemTotal(i), 0),
  [cart]
);

const [checkoutTaxPercent, setCheckoutTaxPercent] = useState(0);
  const [servicePercent, setServicePercent] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Compute tax/service with two-decimal precision (match backend)
  const taxAmount = useMemo(() => {
    const t = Number(((subtotal * Number(checkoutTaxPercent || 0)) / 100).toFixed(2));
    return Number.isNaN(t) ? 0 : t;
  }, [subtotal, checkoutTaxPercent]);

  const serviceAmount = useMemo(() => {
    const s = Number(((subtotal * Number(servicePercent || 0)) / 100).toFixed(2));
    return Number.isNaN(s) ? 0 : s;
  }, [subtotal, servicePercent]);

  const finalTotal = useMemo(() => {
    const tot = Number((subtotal + taxAmount + serviceAmount - Number(discount || 0)).toFixed(2));
    return Math.max(0, tot);
  }, [subtotal, taxAmount, serviceAmount, discount]);

const isPaid = order?.paymentStatus === "paid";
const isCheckout = checkoutMode === true;

// 🔒 Lock only during checkout or after payment
const isLocked = isCheckout || isPaid;

const displayTotal = useMemo(() => {
  if (isPaid && order?.totalAmount != null) {
    return Number(order.totalAmount);
  }
  return Number(finalTotal);
}, [isPaid, order?.totalAmount, finalTotal]);


// const canEditOrCancel =
//   kot.status === "pending" &&
//   order?.paymentStatus !== "paid";

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="grid grid-cols-12 gap-4 h-full">

        {/* MENU */}
        <div className="col-span-8 bg-white rounded-xl p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4">Menu</h2>

          <div className="flex gap-2 mb-4 flex-wrap">
            <CategoryTab label="All" active={activeCat === "all"} onClick={() => setActiveCat("all")} />
            {categories.map((cat) => (
              <CategoryTab key={cat} label={cat} active={activeCat === cat} onClick={() => setActiveCat(cat)} />
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {filteredMenu.map((item) => (
<div
  key={item._id}
onClick={() => {
  if (isLocked) return;

  const portion = item.portionType;

  // Safety
  if (!portion || !portion.units?.length) {
    toast.error("Portion configuration missing");
    return;
  }

  // ✅ ONLY ONE UNIT → DIRECT ADD
  if (portion.units.length === 1) {
    addItem(item, portion.units[0]);
    return;
  }

  // ✅ MULTIPLE UNITS → OPEN MODAL
  setVariantModalItem(item);
}}



  className={`border rounded-xl p-3 cursor-pointer hover:shadow ${
    isLocked ? "opacity-50 pointer-events-none" : ""
  }`}
>
                {item.image ? (
                  <img
                    src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
                    alt={item.name}
                    className="h-24 w-full object-cover rounded mb-2"
                  />
                ) : (
                  <div className="h-24 rounded bg-gray-100 mb-2" />
                )}
                <div className="font-medium">{item.name}</div>
                <div className="text-[#ff4d4d]">₹{item.price}</div>
              </div>
            ))}
          </div>
        </div>

     
      {/* RIGHT */}
<div className="col-span-4 bg-white rounded-xl p-4 flex flex-col h-full">

  {/* TOP CONTENT (SCROLLABLE) */}
  <div className="flex-1 overflow-y-auto pr-1">
    
    {/* HEADER */}
    <div className="mb-4 border-b pb-3">
      <div className="text-xs text-gray-500">Order ID</div>
      <div className="font-bold text-lg text-gray-800">
        #{orderDisplayId}
      </div>

      {/* Customer info (prefer table -> order fallback) */}
      {((table && table?.customerId) || order?.customerId || order?.customer) && (
        <div className="mt-2 text-sm text-gray-700 space-y-1">
          <div>
            <span className="font-medium">Customer:</span>{" "}
            {(table?.customerId?.name) || (order?.customerId?.name) || order?.customer || ""}
          </div>
          <div>
            <span className="font-medium">Mobile:</span>{" "}
            {(table?.customerId?.phone) || (order?.customerId?.phone) || ""}
          </div>
        </div>
      )}

      <div className="mt-2 text-sm text-gray-600">
        Table {table?.tableNumber}
      </div>
    </div>

    {/* CART ITEMS */}
    {cart.length === 0 && (
      <p className="text-sm text-gray-400 text-center mt-10">
        No items added
      </p>
    )}

    {cart.map((i) => (
  <div key={i.cartKey} className="flex justify-between mb-3">
    <div>
      <div className="font-medium">{i.name}</div>
      <div className="text-xs text-gray-500">
        {i.selectedUnit.name} | ₹{calculateItemTotal(i)}
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Minus
        size={16}
        className="cursor-pointer"
        onClick={() => changeQty(i.cartKey, -1)}
      />
      <span>{i.qty}</span>
      <Plus
        size={16}
        className="cursor-pointer"
        onClick={() => changeQty(i.cartKey, 1)}
      />
      <Trash2
        size={16}
        className="text-red-500 cursor-pointer"
        onClick={() => removeItem(i.cartKey)}
      />
    </div>
  </div>
))}



    {/* SEND TO KITCHEN */}
   <button
  onClick={sendAndPrintKOT}
 disabled={isLocked}
   className={`w-full py-2 mt-2 rounded text-white ${
        isLocked
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-gray-800"
      }`}
>
  Send & Print KOT
</button>


    {/* KOT HISTORY (scrollable) */}
  {!isCheckout && order && (
  <div className="mt-4">
    {order.kots && order.kots.length > 0 ? (
      <div className="space-y-3 pb-3">
        <KotHistory order={order} reload={reloadOrder} />
      </div>
    ) : (
      <p className="text-xs text-gray-400">No KOTs yet</p>
    )}
  </div>
)}



    {/* CHECKOUT PANEL */}
    {isCheckout && (
  <div className="mt-6 p-4 border rounded-lg bg-gray-50 space-y-3">

    {/* HEADER */}
    <div className="text-sm font-semibold border-b pb-2">
      Bill Summary
    </div>

    {/* ITEMS — NO SCROLL HERE */}
    <ul className="text-sm space-y-1">
      {cart.filter(i => i.qty > 0).map(i => (
        <li
          key={i.cartKey}
          className="flex justify-between"
        >
          <span>
            {i.name} ({i.selectedUnit?.name}) × {i.qty}
          </span>
          <span>₹{calculateItemTotal(i)}</span>
        </li>
      ))}
    </ul>

    {/* SUBTOTAL */}
    <div className="flex justify-between text-sm font-medium border-t pt-2">
      <span>Subtotal</span>
      <span>₹{subtotal}</span>
    </div>

    {/* GST */}
    <div className="flex items-center gap-2 text-sm">
      <label>GST (%)</label>
      <input
        type="number"
        min="0"
        value={checkoutTaxPercent}
        onChange={(e) =>
          setCheckoutTaxPercent(Number(e.target.value || 0))
        }
        className="w-20 p-1 border rounded"
      />
      <span className="ml-auto">₹{taxAmount}</span>
    </div>

    {/* SERVICE */}
    <div className="flex items-center gap-2 text-sm">
      <label>Service (%)</label>
      <input
        type="number"
        min="0"
        value={servicePercent}
        onChange={(e) =>
          setServicePercent(Number(e.target.value || 0))
        }
        className="w-20 p-1 border rounded"
      />
      <span className="ml-auto">₹{serviceAmount}</span>
    </div>

    {/* DISCOUNT */}
    <div className="flex items-center gap-2 text-sm">
      <label>Discount (₹)</label>
      <input
        type="number"
        min="0"
        value={discount}
        onChange={(e) =>
          setDiscount(Number(e.target.value || 0))
        }
        className="w-28 p-1 border rounded"
      />
      <span className="ml-auto">-₹{discount}</span>
    </div>

    {/* FINAL TOTAL */}
    <div className="flex justify-between text-lg font-bold border-t pt-3">
      <span>Total</span>
      <span>₹{displayTotal}</span>
    </div>

    {/* WARNING */}
    {(!order?.kots || order.kots.length === 0) && (
      <p className="text-xs text-red-500">
        Cannot checkout — no KOT created
      </p>
    )}

    {/* ACTIONS */}
    <div className="flex gap-2 pt-2">
      <button
        onClick={handleCashPayment}
        disabled={!order?.kots || order.kots.length === 0}
        className={`flex-1 py-2 rounded text-white ${
          !order?.kots || order.kots.length === 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-[#ff4d4d]"
        }`}
      >
        Mark Paid
      </button>

      <button
        onClick={() => setCheckoutMode(false)}
        className="flex-1 bg-gray-200 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
)}

  </div>

  {/* FOOTER (FIXED) */}
<div className="border-t pt-3">

  {/* FINAL TOTAL */}
  <div className="flex justify-between font-bold">
    <span>Total</span>
    <span>
      ₹{Number(displayTotal % 1 === 0 ? displayTotal : displayTotal.toFixed(2))}
    </span>
  </div>

  {/* 🔎 PAID BILL BREAKDOWN (READ-ONLY) */}
  {/* {isPaid && (
    <div className="mt-3 text-xs text-gray-600 space-y-1">
      <div>Subtotal: ₹{order.subTotal}</div>
      <div>Tax: ₹{order.tax || 0}</div>
      <div>Service: ₹{order.serviceAmount || 0}</div>
      <div>Discount: -₹{order.discount || 0}</div>
    </div>
  )} */}

  {!isCheckout && !isPaid && (
    <button
      onClick={handleStartCheckout}
      className="w-full mt-4 bg-[#ff4d4d] text-white py-3 rounded"
    >
      Checkout
    </button>
  )}

  {isPaid && (
    <p className="mt-3 text-center text-green-600 font-semibold">
      ✔ Paid
    </p>
  )}
</div>

</div>

      </div>
  
  {/* 🔥 HIDDEN PRINT AREA */}
<div style={{ display: "none" }}>
  {order?.kots?.map((kot) => (
    <div id={`kot-print-${kot.kotNo}`} key={kot.kotNo}>
      <KotPrint kot={kot} order={order} />
    </div>
  ))}
</div>

{/* 🔥 HIDDEN BILL PRINT AREA */}
<div style={{ display: "none" }}>
  {order && (
    <div id="bill-print">
      <BillPrint order={order} />
    </div>
  )}
</div>
{variantModalItem && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-[320px] rounded-xl p-4">
      <h3 className="font-semibold mb-3">
        Select {variantModalItem.name}
      </h3>

      <div className="space-y-2">
        {variantModalItem.portionType.units.map((unit) => (
          <button
            key={unit._id}
            onClick={() => {
              addItem(variantModalItem, unit);
              setVariantModalItem(null);
            }}
            className="w-full flex justify-between border rounded-lg px-3 py-2 hover:bg-gray-100"
          >
            <span>{unit.name}</span>
            <span className="font-medium">
              ₹{
  variantModalItem.portionType.pricingRule === "percentage"
    ? (variantModalItem.price * unit.value) / 100
    : unit.value
}

            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => setVariantModalItem(null)}
        className="mt-3 w-full text-sm text-gray-500"
      >
        Cancel
      </button>
    </div>
  </div>
)}



    </div>
  );
};

const CategoryTab = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-4 py-1 rounded-full ${active ? "bg-[#ff4d4d] text-white" : "bg-gray-100"}`}>
    {label}
  </button>
);

export default OrderPage;
