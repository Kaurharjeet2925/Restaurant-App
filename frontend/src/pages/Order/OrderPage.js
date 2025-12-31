import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../apiclient/apiclient";
import { Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import KotHistory from "./KotHistory";

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


  // ✅ SINGLE SOURCE OF TRUTH
  const [order, setOrder] = useState(null);
  const orderDisplayId = useMemo(
    () => (order?._id ? `ORD${String(order._id).slice(-4).toUpperCase()}` : ""),
    [order]
  );
  
  // stable reload function passed to children (defined after fetchOrder)
  /* ================= GUARD ================= */
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
      const key = String(i.menuItemId);
      if (!acc[key]) {
        acc[key] = {
          _id: i.menuItemId,
          name: i.name,
          price: i.price,
          qty: 0,
          kotQty: 0,
        };
      }
      acc[key].qty += i.qty;
      acc[key].kotQty += i.qty;
      return acc;
    }, {});

    setCart(Object.values(grouped));
  } catch {
    toast.error("Failed to load order");
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

  const searchQuery = (params.get("q") || "").trim().toLowerCase();

  const filteredMenu =
    // if there's an active search, use that (overrides category tab)
    searchQuery
      ? menu.filter((i) => {
          const name = (i.name || "").toLowerCase();
          const cat = ((i.category && (i.category.name || i.category)) || "").toLowerCase();
          // show items where name OR category matches the query
          return name.includes(searchQuery) || cat.includes(searchQuery);
        })
      : activeCat === "all"
      ? menu
      : menu.filter((i) => (i.category?.name || i.category) === activeCat);

  /* ================= CART ================= */
  const addItem = (item) => {
    setCart((prev) => {
      const found = prev.find((i) => i._id === item._id);
      return found
        ? prev.map((i) =>
            i._id === item._id ? { ...i, qty: i.qty + 1 } : i
          )
        : [...prev, { ...item, qty: 1, kotQty: 0 }];
    });
  };

  const changeQty = (id, diff) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i._id === id ? { ...i, qty: i.qty + diff } : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  // Remove item from cart
  const removeItem = (id) => {
    if (isLocked) {
      toast.info("Order is locked");
      return;
    }

    setCart((prev) => {
      const item = prev.find((i) => i._id === id);
      if (!item) return prev;

      // If some quantity already sent to kitchen, only remove the unsent portion
      if (item.kotQty && item.kotQty > 0) {
        if (item.qty === item.kotQty) {
          toast.info("All items already sent to kitchen. Cannot remove.");
          return prev;
        }

        toast.success("Removed unsent items; remaining quantity matches sent KOT");
        return prev.map((i) => (i._id === id ? { ...i, qty: item.kotQty } : i));
      }

      // Otherwise remove the entire line
      toast.success("Item removed");
      return prev.filter((i) => i._id !== id);
    });
  };

  /* ================= SEND KOT ================= */
  const sendToKOT = async () => {
    if (!order?._id) {
      toast.error("Order not initialized");
      return;
    }

    try {
      const newItems = cart
        .filter((i) => i.qty > i.kotQty)
        .map((i) => ({
          menuItemId: i._id,
          name: i.name,
          price: i.price,
          qty: i.qty - i.kotQty, // 🔥 ONLY NEW QTY
        }));

      if (newItems.length === 0) {
        toast.info("No new items to send");
        return;
      }

      await apiClient.put(`/orders/${order._id}`, {
        items: newItems,
      });

      await fetchOrder(order._id);
      toast.success("KOT sent to kitchen");
    } catch (err) {
      toast.error("Failed to send KOT");
    }
  };
const handleCashPayment = async (taxPercent = 0) => {
  if (!order?._id) {
    toast.error("Order not found");
    return;
  }

  try {
    const res = await apiClient.post(`/orders/${order._id}/bill`, {
      taxPercent,
    });
    toast.success("Payment successful");

    setOrder(res.data.order);
    setCheckoutMode(false);

    // navigate back to tables after payment
    setTimeout(() => navigate("/tables", { replace: true }), 700);

    // stay on page and show Paid state (Edit option available)
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Payment failed"
    );
  }
};

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const [checkoutTaxPercent, setCheckoutTaxPercent] = useState(0);
  const taxAmount = useMemo(
    () => Math.round((subtotal * Number(checkoutTaxPercent || 0)) / 100),
    [subtotal, checkoutTaxPercent]
  );
  const totalWithTax = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);
  const total = subtotal; // kept for existing UI that uses `total`

  if (loading) return <div className="p-6">Loading POS...</div>;
  if (!table) return null;
  
const isPaid = order?.paymentStatus === "paid";
const isCheckout = checkoutMode === true;

// 🔒 Lock only during checkout or after payment
const isLocked = isCheckout || isPaid;

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
  onClick={() => !isLocked && addItem(item)}
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
      {((table && table.customerId) || order?.customerId || order?.customer) && (
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
        Table {table.tableNumber}
      </div>
    </div>

    {/* CART ITEMS */}
    {cart.length === 0 && (
      <p className="text-sm text-gray-400 text-center mt-10">
        No items added
      </p>
    )}

    {cart.map((i) => (
      <div key={i._id} className="flex justify-between mb-3">
        <div>
          <div className="font-medium">{i.name}</div>
          <div className="text-xs text-gray-500">
            ₹{i.price} × {i.qty}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Minus
            size={14}
            className={isLocked ? "opacity-40" : "cursor-pointer"}
            onClick={() => !isLocked && changeQty(i._id, -1)}
          />
          <span>{i.qty}</span>
          <Plus
            size={14}
            className={isLocked ? "opacity-40" : "cursor-pointer"}
            onClick={() => !isLocked && changeQty(i._id, 1)}
          />
          <Trash2
            size={14}
            className={
              isLocked
                ? "opacity-40 text-gray-400"
                : "text-red-500 cursor-pointer"
            }
            onClick={() => !isLocked && removeItem(i._id)}
          />
        </div>
      </div>
    ))}

    {/* SEND TO KITCHEN */}
    <button
      onClick={sendToKOT}
      disabled={isLocked}
      className={`w-full py-2 mt-2 rounded text-white ${
        isLocked
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-gray-800"
      }`}
    >
      Send to Kitchen
    </button>

    {/* KOT HISTORY (scrollable) */}
    {!isCheckout && order && (
      <div className="mt-4">
        {/* <div className="text-sm font-medium mb-2">KOT History</div> */}
        {order.kots && order.kots.length > 0 ? (
          <div className="max-h-48 overflow-y-auto space-y-2">
            <KotHistory order={order} reload={reloadOrder} />
          </div>
        ) : (
          <p className="text-xs text-gray-400">No KOTs yet</p>
        )}
      </div>
    )}

    {/* CHECKOUT PANEL */}
    {isCheckout && (
      <div className="mt-4 p-3 border rounded bg-gray-50">
        <div className="text-sm font-medium mb-2">Bill</div>
        <div className="text-sm">Subtotal: ₹{subtotal}</div>
        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm">GST (%)</label>
          <input
            type="number"
            min="0"
            value={checkoutTaxPercent}
            onChange={(e) => setCheckoutTaxPercent(Number(e.target.value || 0))}
            className="w-20 p-1 border rounded"
          />
        </div>
        <div className="mt-2 text-sm">Tax: ₹{taxAmount}</div>
        <div className="mt-2 font-bold">Total: ₹{totalWithTax}</div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => handleCashPayment(checkoutTaxPercent)}
            className="flex-1 bg-[#ff4d4d] text-white py-2 rounded"
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
    <div className="flex justify-between font-bold">
      <span>Total</span>
      <span>₹{total}</span>
    </div>

    {!isCheckout && !isPaid && (
      <button
        onClick={() => setCheckoutMode(true)}
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
    </div>
  );
};

const CategoryTab = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-4 py-1 rounded-full ${active ? "bg-[#ff4d4d] text-white" : "bg-gray-100"}`}>
    {label}
  </button>
);

export default OrderPage;
