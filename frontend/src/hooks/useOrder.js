import { useEffect, useMemo, useState, useCallback } from "react";
import apiClient from "../apiclient/apiclient";
import { toast } from "react-toastify";

export const useOrder = ({
  tableId,
  carId,
  orderType = "dine_in"
}) => {  /* ================= CORE ================= */
  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [order, setOrder] = useState(null);
  const [cart, setCart] = useState([]);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= UI ================= */
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [variantModalItem, setVariantModalItem] = useState(null);
  const [checkoutMode, setCheckoutMode] = useState(false);

  /* ================= BILL ================= */
  const [taxPercent, setTaxPercent] = useState(0);
  const [servicePercent, setServicePercent] = useState(0);
  const [discount, setDiscount] = useState(0);

  /* ================= FLAGS ================= */
  const isPaid = order?.paymentStatus === "paid";
  const isLocked = checkoutMode || isPaid;

  /* ================= LOAD ================= */
useEffect(() => {
  if (!tableId && !carId) return;

  const load = async () => {
    try {

      const menuRes = await apiClient.get("/menu");
      setMenu(menuRes.data || []);

      setCategories([
        ...new Set(
          (menuRes.data || [])
            .map((i) => i.category?.name || i.category)
            .filter(Boolean)
        ),
      ]);

      // ================= TABLE =================
      if (tableId) {
        const tableRes = await apiClient.get(`/tables/${tableId}`);
        setTable(tableRes.data);

        if (tableRes.data.currentOrderId) {
          await fetchOrder(tableRes.data.currentOrderId);
        }
      }

      // ================= CAR =================
      if (carId) {
        const carRes = await apiClient.get(`/cars/${carId}`);
        setCar(carRes.data);

        // 🔥 check if order exists
        const orderRes = await apiClient.get(`/orders/car/${carId}`);

        if (orderRes.data) {
          setOrder(orderRes.data);
        } else {
          // 🔥 create order automatically
          const createRes = await apiClient.post(
            `/cars/${carId}/start-order`
          );

          setOrder(createRes.data.order);
        }
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to load POS");
    } finally {
      setLoading(false);
    }
  };

  load();
}, [tableId, carId]);

  /* ================= FETCH ORDER ================= */
  const fetchOrder = useCallback(async (id) => {
    const res = await apiClient.get(`/orders/${id}`);
    const ord = res.data;
    setOrder(ord);

    const grouped = {};
    ord.items.forEach((i) => {
      const key = `${i.menuItemId}_${i.variant || "default"}`;
      if (!grouped[key]) {
        grouped[key] = {
          cartKey: key,
          menuItemId: i.menuItemId,
          name: i.name,
          basePrice: i.price,
          selectedUnit: { name: i.variant, value: 100 },
          qty: 0,
          kotQty: 0,
          portionType: null,
        };
      }
      grouped[key].qty += i.qty;
      grouped[key].kotQty += i.qty;
    });

    setCart(Object.values(grouped));
    return ord;
  }, []);

  /* ================= CART ================= */
  const addItem = (item, unit) => {
    if (isLocked) return;

    const key = `${item._id}_${unit.name}`;
    setCart((prev) => {
      const found = prev.find((i) => i.cartKey === key);
      if (found) {
        return prev.map((i) =>
          i.cartKey === key ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          cartKey: key,
          menuItemId: item._id,
          name: item.name,
          basePrice: item.price,
          selectedUnit: unit,
          portionType: item.portionType,
          qty: 1,
          kotQty: 0,
        },
      ];
    });
  };
/* ================= CHANGE QTY ================= */
const changeQty = (cartKey, diff) => {
  if (isLocked) return;

  setCart((prev) =>
    prev
      .map((item) => {
        if (item.cartKey !== cartKey) return item;

        const nextQty = item.qty + diff;

        // 🔒 Do NOT allow going below KOT qty
        if (nextQty < item.kotQty) {
          toast.info("Item already sent to kitchen");
          return item;
        }

        return { ...item, qty: nextQty };
      })
      .filter((item) => item.qty > 0)
  );
};

  /* ================= TOTALS ================= */
  const calculateItemTotal = (item) => {
    const rule = item.portionType?.pricingRule || "percentage";
    if (rule === "percentage") {
      return item.basePrice * (item.selectedUnit.value / 100) * item.qty;
    }
    return item.selectedUnit.value * item.qty;
  };

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + calculateItemTotal(i), 0),
    [cart]
  );

  const taxAmount = useMemo(
    () => (subtotal * taxPercent) / 100,
    [subtotal, taxPercent]
  );

  const serviceAmount = useMemo(
    () => (subtotal * servicePercent) / 100,
    [subtotal, servicePercent]
  );

  const finalTotal = useMemo(
    () =>
      Math.max(
        0,
        Number((subtotal + taxAmount + serviceAmount - discount).toFixed(2))
      ),
    [subtotal, taxAmount, serviceAmount, discount]
  );

  const hasNewItems = useMemo(
    () => cart.some((i) => i.qty > i.kotQty),
    [cart]
  );

  /* ================= ACTIONS ================= */
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

// const printBill = (order) => {
//   const el = document.getElementById("bill-print");
//   if (!el) {
//     toast.warn("Bill not ready for print");
//     return;
//   }

//   const win = window.open("", "_blank", "width=300,height=600");
//   if (!win) {
//     toast.warn("Popup blocked. Allow popups to print bill.");
//     return;
//   }

//   win.document.write(`
//     <html>
//       <head>
//         <title>Bill</title>
//         <style>
//           body { font-family: monospace; padding: 10px; }
//         </style>
//       </head>
//       <body>
//         ${el.innerHTML}
//       </body>
//     </html>
//   `);

//   win.document.close();
//   win.focus();
//   win.print();
// };

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


    await apiClient.put(`/orders/${order._id}`, { orderType, items: newItems });

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
  if (!order?._id) return false;

  try {
    const res = await apiClient.post(`/orders/${order._id}/bill`, {
      taxPercent,
      servicePercent,
      discount,
    });

    setOrder(res.data.order);
    setCheckoutMode(false);
    // show success toast so mobile flow displays a confirmation
    toast.success("Payment successful");

    return res.data.order; // ✅ RETURN ORDER
  } catch (err) {
    toast.error("Payment failed");
    return false;
  }
};



 return {
  table,
  car,
  menu,
  order,
  categories,
  activeCat,
  setActiveCat,
  variantModalItem,
  setVariantModalItem,
  handleCashPayment,
  cart,
  addItem,
 changeQty,   // ✅ ADD THIS
  subtotal,
  taxPercent,
  setTaxPercent,
  taxAmount,
  servicePercent,
  setServicePercent,
  serviceAmount,
  discount,
  setDiscount,
  finalTotal,
  hasNewItems,
  checkoutMode,
  setCheckoutMode,
  isLocked,
  printKot,
  sendAndPrintKOT,
};

};
