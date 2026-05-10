import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../apiclient/apiclient";
import { Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import KotHistory from "./KotHistory";
import KotPrint from "../Kitchen/Kot/KotPrint";
import BillSummary from "./BillSummary";
import BillPrint from "./BillPrint";
import VariantModal from "../MenuItemManaement/VariantModal";
import MenuCard from "./MenuCard";
import EditKotModal from "./EditKotModal";
const OrderPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tableId = params.get("tableId");
const carId = params.get("carId");
const carNo = params.get("carNo");

const orderSourceId = tableId || carId;

  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("q") || "").toLowerCase();
const [editingKot, setEditingKot] = useState(null);
 const [checkoutMode, setCheckoutMode] = useState(false);
const [isProcessing, setIsProcessing] = useState(false);
const [variantModalItem, setVariantModalItem] = useState(null);
const orderType = carId ? "carobar" : "dine_in";
const getDefaultUnit = (portionType) => {
  // If no portionType → return default unit
  if (
    !portionType ||
    !Array.isArray(portionType.units) ||
    portionType.units.length === 0
  ) {
    return {
      name: "Regular",
      value: 100, // 100% of base price
    };
  }

  return portionType.units[0];
};


  // ✅ SINGLE SOURCE OF TRUTH
  const [order, setOrder] = useState(null);
  const orderDisplayId = useMemo(
    () => order?.orderNumber || "",
    [order]
  );
  
 useEffect(() => {
  if (!tableId && !carId) {
    toast.info("Please select a table or car first");
    navigate("/tables", { replace: true });
  }
}, [tableId, carId, navigate]);

  /* ================= FETCH ORDER ================= */
const fetchOrder = useCallback(async (id) => {
  console.log('[OrderPage] fetchOrder called with id:', id);
  try {
    const res = await apiClient.get(`/orders/${id}`);
    const ord = res.data;
    console.log('[OrderPage] fetchOrder result:', ord);
    setOrder(ord);
    const grouped = ord.items.reduce((acc, i) => {
      const key = `${i.menuItemId}_${i.variant || "default"}`;

  if (!acc[key]) {
    acc[key] = {
      cartKey: key,
      menuItemId: i.menuItemId,
      name: i.name,
      basePrice: i.price,
      selectedUnit: {
  name: i.variant || "Regular",
  value: 100,
},
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
    console.error('[OrderPage] fetchOrder error:', error);
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
  if (!orderSourceId) return;

  const loadData = async () => {
    try {
      const menuRes = await apiClient.get("/menu");
      setMenu(menuRes.data || []);

      // TABLE ORDER
      if (tableId) {
        const tableRes = await apiClient.get(`/tables/${tableId}`);
        setTable(tableRes.data);

        if (tableRes.data.currentOrderId) {
          await fetchOrder(tableRes.data.currentOrderId);
        }
      }

      // CAR ORDER
     if (carId) {

  const res = await apiClient.get(`/orders/car/${carId}`);

  if (res.data) {
    setOrder(res.data);
  } else {

    // create new order
    const createRes = await apiClient.post(`/cars/${carId}/start-order`);

    setOrder(createRes.data.order);

  }
}

    } catch (err) {
      toast.error("Failed to load order");
      navigate("/tables");
    } finally {
      setLoading(false);
    }
  };

  loadData();

}, [tableId, carId, orderSourceId, fetchOrder, navigate]);

  
  useEffect(() => {
    setCategories([
      ...new Set(menu.map((i) => i.category?.name || i.category).filter(Boolean)),
    ]);
  }, [menu]);
const filteredCategories = useMemo(() => {
  if (!searchQuery) return categories;

  return categories.filter((cat) =>
    cat.toLowerCase().includes(searchQuery)
  );
}, [categories, searchQuery]);

 const filteredMenu = useMemo(() => {
  return menu.filter((item) => {
    const categoryName = (item.category?.name || item.category || "").toLowerCase();
    const itemName = item.name.toLowerCase();

    const matchesCategory =
      activeCat === "all" ||
      (item.category?.name || item.category) === activeCat;

    const matchesSearch =
      !searchQuery ||
      itemName.includes(searchQuery) ||
      categoryName.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });
}, [menu, activeCat, searchQuery]);
useEffect(() => {
  if (!searchQuery) {
    setActiveCat("all");
    return;
  }


  const matchedCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchQuery)
  );

 
  const itemMatchedCategories = menu
    .filter(item =>
      item.name.toLowerCase().includes(searchQuery)
    )
    .map(item => item.category?.name || item.category)
    .filter(Boolean);

  const uniqueMatched = Array.from(
    new Set([...matchedCategories, ...itemMatchedCategories])
  );

  if (uniqueMatched.length === 1) {
    setActiveCat(uniqueMatched[0]);
  } else {
    
    setActiveCat("all");
  }
}, [searchQuery, categories, menu]);

  /* ================= CART ================= */
const addItem = (menuItem, unit = null) => {
  const portion = menuItem.portionType;
  const selectedUnit = unit || getDefaultUnit(portion);

  // if (!selectedUnit) {
  //   toast.error(`Invalid portion config for ${menuItem.name}`);
  //   return;
  // }

  // Use same cartKey logic as fetchOrder: menuItemId + variant name
  const cartKey = `${menuItem._id}_${selectedUnit?.name || ""}`;

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
  setCart(prev =>
    prev.map(i => {
      if (i.cartKey !== cartKey) return i;

      // 🔒 DO NOT reduce below kotQty
      const newQty = i.qty + diff;
      if (newQty < i.kotQty) {
        toast.info("Cannot reduce item already sent to kitchen");
        return i;
      }

      return { ...i, qty: newQty };
    })
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

  setIsProcessing(true);
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

    console.log('[OrderPage] Sending KOT with items:', newItems);
    await apiClient.put(`/orders/${order._id}`, { orderType, items: newItems });

    // Lock local cart
    setCart(prev => prev.map(i => ({ ...i, kotQty: i.qty })));

    const updatedOrder = await fetchOrder(order._id);
    const latestKot = updatedOrder?.kots?.[updatedOrder.kots.length - 1];

    // ⏳ WAIT FOR DOM RENDER
    setTimeout(() => {
      if (latestKot) {
        printKot(latestKot);
        toast.success("KOT sent & printed");
      } else {
        toast.success("KOT sent");
      }
      setIsProcessing(false);
    }, 300); // 🔥 critical delay
  } catch (err) {
    console.error('[OrderPage] sendAndPrintKOT error:', err);
    toast.error("Failed to send KOT");
    setIsProcessing(false);
  }
};


const handleCashPayment = async () => {

  if (!order?._id) return;
  setIsProcessing(true);

  try {

    const res = await apiClient.post(`/orders/${order._id}/bill`, {
      taxPercent: checkoutTaxPercent,
      servicePercent,
      discount,
    });

    toast.success("Payment successful");

    setOrder(res.data.order);
    setCheckoutMode(false);

    // 🧾 print bill
    setTimeout(() => {
      printBill(res.data.order);
    }, 300);

    // 🚗 DELETE CAR SLOT AFTER PAYMENT
    if (carId) {
      try {
        await apiClient.delete(`/cars/${carId}`);
      } catch (err) {
        console.error("Car delete failed", err);
      }
    }

    // 🔁 navigate back
    setTimeout(() => {
      navigate(carId ? "/car-o-bar" : "/tables", { replace: true });
      setIsProcessing(false);
    }, 800);

  } catch (err) {

    toast.error(err.response?.data?.message || "Payment failed");
    setIsProcessing(false);

  }

};

// Prevent entering checkout when there are no KOTs
const handleStartCheckout = () => {
  if (!order?.kots || order.kots.length === 0) {
    toast.info("Cannot checkout: no KOTs created yet");
    return;
  }

  // ⚠️ WARNING ONLY (NOT BLOCKING)
  if (hasUnsentItems) {
    const confirmProceed = window.confirm(
      "⚠️ Latest items are not sent to kitchen.\n\nAre you sure you want to proceed without sending the latest KOT?"
    );

    if (!confirmProceed) {
      return; // user clicked Cancel
    }
  }

  setCheckoutMode(true); // ✅ proceed anyway
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
const hasUnsentItems = useMemo(
  () => cart.some(i => i.qty > i.kotQty),
  [cart]
);

const kotSubtotal = useMemo(() => {
  return cart.reduce((sum, i) => {
    if (i.kotQty === 0) return sum;

    const itemForBill = {
      ...i,
      qty: i.kotQty,
    };

    return sum + calculateItemTotal(itemForBill);
  }, 0);
}, [cart]);


const [checkoutTaxPercent, setCheckoutTaxPercent] = useState(0);
  const [servicePercent, setServicePercent] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Compute tax/service with two-decimal precision (match backend)
  const taxAmount = useMemo(() => {
    const t = Number(((kotSubtotal * Number(checkoutTaxPercent || 0)) / 100).toFixed(2));
    return Number.isNaN(t) ? 0 : t;
  }, [kotSubtotal, checkoutTaxPercent]);

  const serviceAmount = useMemo(() => {
    const s = Number(((kotSubtotal * Number(servicePercent || 0)) / 100).toFixed(2));
    return Number.isNaN(s) ? 0 : s;
  }, [kotSubtotal, servicePercent]);

  const finalTotal = useMemo(() => {
    const tot = Number((kotSubtotal + taxAmount + serviceAmount - Number(discount || 0)).toFixed(2));
    return Math.max(0, tot);
  }, [kotSubtotal, taxAmount, serviceAmount, discount]);

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
const getItemVariants = (itemId) =>
  cart.filter((i) => i.menuItemId === itemId);

const getItemTotalQty = (itemId) =>
  getItemVariants(itemId).reduce((s, i) => s + i.qty, 0);

const hasMultipleVariantsInCart = (itemId) =>
  getItemVariants(itemId).length > 1;


const updateVariantQty = (item, unit, diff) => {
  const key = `${item._id}_${unit.name}`;

  setCart((prev) => {
    const existing = prev.find((i) => i.cartKey === key);

    // ➖ REMOVE / DECREASE
    if (existing && existing.qty + diff <= 0) {
      // 🔒 don’t go below KOT qty
      if (existing.kotQty > 0) {
        toast.info("Item already sent to kitchen");
        return prev;
      }
      return prev.filter((i) => i.cartKey !== key);
    }

    // ➕ UPDATE EXISTING
    if (existing) {
      return prev.map((i) =>
        i.cartKey === key
          ? { ...i, qty: i.qty + diff }
          : i
      );
    }

    // ➕ ADD NEW VARIANT
    return [
      ...prev,
      {
        cartKey: key,
        menuItemId: item._id,
        name: item.name,
        basePrice: item.price,
        portionType: item.portionType,
        selectedUnit: unit,
        qty: 1,
        kotQty: 0,
      },
    ];
  });
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
<div className="h-[calc(100vh-64px)] bg-gray-50 p-4 overflow-hidden">
      <div className="grid grid-cols-12 gap-2 h-full">

        {/* MENU */}
        <div className="col-span-8 bg-white rounded-xl p-4 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-card pb-3 mb-4 flex gap-2 flex-wrap border-b border-borderLight">
            <CategoryTab label="All" active={activeCat === "all"} onClick={() => setActiveCat("all")} />
            {filteredCategories.map((cat) => (
              <CategoryTab key={cat} label={cat} active={activeCat === cat} onClick={() => setActiveCat(cat)} />
            ))}
          </div>

          <div className="grid
grid-cols-2
sm:grid-cols-3
md:grid-cols-4
xl:grid-cols-5
gap-4">
           {filteredMenu.map((item) => {
  const totalQty = getItemTotalQty(item._id);
  const variantsInCart = getItemVariants(item._id);
  const hasVariants = item.portionType?.units?.length > 1;
  const multipleVariants = hasMultipleVariantsInCart(item._id);

  return (
    <MenuCard
      key={item._id}
      item={item}
      totalQty={totalQty}
      disabled={isLocked}

      /* CARD CLICK */
      onPress={() => {
        if (isLocked) return;

        if (hasVariants) {
          setVariantModalItem(item);
        } else {
          addItem(item);
        }
      }}

      /* PLUS */
      onIncrease={() => {
        if (isLocked) return;

        if (hasVariants && multipleVariants) {
          setVariantModalItem(item);
        } else {
          changeQty(variantsInCart[0].cartKey, 1);
        }
      }}

      /* MINUS */
      onDecrease={() => {
        if (isLocked) return;

        if (hasVariants && multipleVariants) {
          setVariantModalItem(item);
        } else {
          changeQty(variantsInCart[0].cartKey, -1);
        }
      }}
    />
  );
})}

          </div>
        </div>

     
      {/* RIGHT */}
<div className="col-span-4 bg-white rounded-xl flex flex-col h-full overflow-hidden">

  {/* TOP CONTENT (SCROLLABLE) */}
  <div className="flex-1 overflow-y-auto p-4">

{!isCheckout && (
<>
  {/* HEADER */}
  <div className="mb-4 border-b pb-3">
    <div className="text-xs text-gray-500">Order ID</div>
    <div className="font-bold text-lg text-gray-800">
      #{orderDisplayId}
    </div>

{((table && table?.customerId) || order?.customer?.customerId) && (      <div className="mt-2 text-sm text-gray-700 space-y-1">
        <div>
          <span className="font-medium">Customer:</span>{" "}
          {(table?.customerId?.name) ||
            order?.customer?.customerId?.name||
            ""}
        </div>

        <div>
          <span className="font-medium">Mobile:</span>{" "}
          {(table?.customerId?.phone) ||
           order?.customer?.customerId?.phone ||
            ""}
        </div>
      </div>
    )}

   <div className="mt-2 text-sm text-gray-600">
  {tableId && `Table ${table?.tableNumber}`}
  {carId && `Car ${carNo}`}
</div>
  </div>

  {cart.length === 0 && (
      <p className="text-sm text-gray-400 text-center mt-10">
        No items added
      </p>
    )}

    {cart.map((i) => (
  <div
  key={i.cartKey}
  className="flex justify-between items-center mb-3 p-2 rounded-lg hover:bg-background transition"
>
    <div>
     <div className="font-medium flex items-center gap-2">
  {i.name}

  {/* 🔴 NEW ITEM DOT */}
  {i.qty > i.kotQty && (
    <span className="w-2 h-2 rounded-full bg-primary inline-block" />
  )}
</div>
      <div className="text-xs text-gray-500">
        {i.selectedUnit.name} | ₹{calculateItemTotal(i)}
      </div>
    </div>

   <div className="flex items-center gap-2 bg-background px-2 py-1 rounded">
  <Minus
    size={16}
    className="cursor-pointer text-gray-600 hover:text-primary"
    onClick={() => changeQty(i.cartKey, -1)}
  />

  <span className="font-medium w-4 text-center">
    {i.qty}
  </span>

  <Plus
    size={16}
    className="cursor-pointer text-gray-600 hover:text-primary"
    onClick={() => changeQty(i.cartKey, 1)}
  />

  <Trash2
    size={16}
    className="ml-2 text-red-500 cursor-pointer"
    onClick={() => removeItem(i.cartKey)}
  />
</div>
  </div>
))}


  {/* SEND TO KITCHEN */}
  {/* <button
    onClick={sendAndPrintKOT}
    disabled={isLocked}
    className={`w-full py-2 mt-2 rounded-lg text-white font-medium shadow-sm transition ${
      isLocked
        ? "bg-gray-300 cursor-not-allowed"
        : "bg-primary hover:opacity-90"
    }`}
  >
    Send & Print KOT
  </button> */}

  {!isCheckout && order && (
    <div className="mt-4">
      {order.kots && order.kots.length > 0 ? (
        <div className="space-y-3 pb-3">
          <KotHistory order={order} reload={reloadOrder}
           onEdit={(kot) => setEditingKot(kot)} />
        </div>
      ) : (
        <p className="text-xs text-gray-400">No KOTs yet</p>
      )}
    </div>
  )}
</>
)}

{/* BILL SUMMARY MODE */}
{isCheckout && (
 <BillSummary
  mode={carId ? "carobar" : "dine_in"}
  order={order}
  table={table}
  cart={cart}
  kotSubtotal={kotSubtotal}

  checkoutTaxPercent={checkoutTaxPercent}
  setCheckoutTaxPercent={setCheckoutTaxPercent}

  servicePercent={servicePercent}
  setServicePercent={setServicePercent}

  taxAmount={taxAmount}
  serviceAmount={serviceAmount}

  discount={discount}
  setDiscount={setDiscount}

  finalTotal={finalTotal}
  isProcessing={isProcessing}
  onConfirm={handleCashPayment}
  onCancel={() => setCheckoutMode(false)}
/>
)}
{editingKot && (
  <EditKotModal
    kot={editingKot}
    orderId={order._id}
    reload={reloadOrder}
    close={() => setEditingKot(null)}
  />
)}
</div>

  {/* FOOTER (FIXED) */}
{/* FOOTER */}
{/* FOOTER */}
{/* FOOTER */}
<div className="p-4 border-t bg-white">

  {!isCheckout && !isPaid && (
    <div className="flex gap-2">

      {/* SEND KOT */}
      <button
        onClick={sendAndPrintKOT}
        disabled={isLocked || isProcessing}
        className={`flex-1 py-3 rounded-lg font-semibold transition ${
          isLocked || isProcessing
            ? "bg-gray-300 cursor-not-allowed text-gray-600"
            : "bg-white border border-primary text-primary hover:bg-primaryDark hover:text-white"
        }`}
      >
        {isProcessing ? "Processing..." : "Send KOT"}
      </button>

      {/* CHECKOUT */}
      <button
        onClick={() => setCheckoutMode(true)}
        disabled={isProcessing}
        className={`
          flex-1
          bg-primary
          text-white
          py-3
          rounded-lg
          font-semibold
          hover:opacity-90
          transition
          ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}
        `}
      >
        Checkout
      </button>

    </div>
  )}

  {isPaid && (
    <div className="text-center text-green-600 font-semibold">
      ✔ Paid
    </div>
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
  <VariantModal
    item={variantModalItem}
    cart={cart}
    onQtyChange={updateVariantQty}
    onClose={() => setVariantModalItem(null)}
  />
)}




    </div>
  );
};

const CategoryTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-1.5 rounded-full text-sm font-medium transition
      ${
        active
          ? "bg-primary text-white shadow-sm"
          : "bg-background text-gray-700 hover:bg-primary/10"
      }
    `}
  >
    {label}
  </button>
);

export default OrderPage;
