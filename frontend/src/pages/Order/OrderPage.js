import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../apiclient/apiclient";
import { Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const OrderPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tableId = params.get("tableId");

  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [kots, setKots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  /* ================= GUARD ================= */
  useEffect(() => {
    if (!tableId) {
      toast.info("Please select a table first");
      navigate("/tables", { replace: true });
    }
  }, [tableId, navigate]);

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!tableId) return;

    const loadData = async () => {
      try {
        const [tableRes, menuRes] = await Promise.all([
          apiClient.get(`/tables/${tableId}`),
          apiClient.get("/menu"),
        ]);

        const tableData = tableRes.data;
        setTable(tableData);
        setMenu(menuRes.data || []);

        // ✅ ORDER ALREADY CREATED WHEN TABLE OCCUPIED
        if (tableData.currentOrderId) {
          setOrderId(tableData.currentOrderId);

          const orderRes = await apiClient.get(
            `/orders/${tableData.currentOrderId}`
          );

          const order = orderRes.data;

          setKots(order.kots || []);

          // hydrate cart from order
          const loadedCart = order.items.map(i => ({
            _id: i.menuItemId,
            name: i.name,
            price: i.price,
            qty: i.qty,
            kotQty: i.qty,
          }));

          setCart(loadedCart);
        }
      } catch (err) {
        console.error("POS LOAD ERROR:", err);
        toast.error("Failed to load POS");
        navigate("/tables");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tableId, navigate]);

  /* ================= CATEGORIES ================= */
  useEffect(() => {
    const unique = [
      ...new Set(
        menu.map(i => i.category?.name || i.category).filter(Boolean)
      ),
    ];
    setCategories(unique);
  }, [menu]);

  const filteredMenu =
    activeCat === "all"
      ? menu
      : menu.filter(
          i => (i.category?.name || i.category) === activeCat
        );

  /* ================= CART ================= */
  const addItem = (item) => {
    setCart(prev => {
      const found = prev.find(i => i._id === item._id);
      return found
        ? prev.map(i =>
            i._id === item._id ? { ...i, qty: i.qty + 1 } : i
          )
        : [...prev, { ...item, qty: 1, kotQty: 0 }];
    });
  };

  const changeQty = (id, diff) => {
    setCart(prev =>
      prev
        .map(i =>
          i._id === id ? { ...i, qty: i.qty + diff } : i
        )
        .filter(i => i.qty > 0)
    );
  };

  /* ================= SEND KOT (SEND TO KITCHEN) ================= */
  const sendToKOT = async () => {
    if (!orderId) {
      toast.error("Order not initialized");
      return;
    }

    const newItems = cart
      .filter(i => i.qty > i.kotQty)
      .map(i => ({
        menuItemId: i._id,
        name: i.name,
        price: i.price,
        qty: i.qty - i.kotQty,
      }));

    if (newItems.length === 0) {
      toast.info("No new items for KOT");
      return;
    }

    try {
      const res = await apiClient.put(`/orders/${orderId}`, {
        items: cart.map(i => ({
          menuItemId: i._id,
          name: i.name,
          price: i.price,
          qty: i.qty,
        })),
      });

      const kotNo = res.data.kotNo;

      setKots(prev => [
        ...prev,
        {
          kotNo,
          status: "pending",
          items: newItems,
        },
      ]);

      setCart(prev =>
        prev.map(i =>
          i.qty > i.kotQty ? { ...i, kotQty: i.qty } : i
        )
      );

      toast.success(`KOT ${kotNo} sent`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send KOT");
    }
  };

  const total = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart]
  );

  if (loading) return <div className="p-6">Loading POS...</div>;
  if (!table) return null;

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="grid grid-cols-12 gap-4 h-full">

        {/* ================= MENU ================= */}
        <div className="col-span-8 bg-white rounded-xl p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4">Menu</h2>

          <div className="flex gap-2 mb-4 flex-wrap">
            <CategoryTab
              label="All"
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
            />
            {categories.map(cat => (
              <CategoryTab
                key={cat}
                label={cat}
                active={activeCat === cat}
                onClick={() => setActiveCat(cat)}
              />
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {filteredMenu.map(item => (
              <div
                key={item._id}
                onClick={() => addItem(item)}
                className="border rounded-xl p-3 cursor-pointer hover:shadow transition"
              >
                <div className="h-24 rounded-lg mb-3 overflow-hidden bg-gray-100">
                  <img
                    src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-[#ff4d4d] font-semibold">
                  ₹{item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="col-span-4 bg-white rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold mb-2">
              Table {table.tableNumber}
            </h2>

            {cart.length === 0 && (
              <p className="text-sm text-gray-400">No items added</p>
            )}

            {cart.map(i => (
              <div key={i._id} className="flex justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">{i.name}</div>
                  <div className="text-xs text-gray-500">
                    ₹{i.price} × {i.qty}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeQty(i._id, -1)}>
                    <Minus size={14} />
                  </button>
                  <span>{i.qty}</span>
                  <button onClick={() => changeQty(i._id, 1)}>
                    <Plus size={14} />
                  </button>
                  <Trash2 size={14} className="text-red-500" />
                </div>
              </div>
            ))}

            {/* SEND TO KITCHEN */}
            <button
              onClick={sendToKOT}
              disabled={cart.every(i => i.qty === i.kotQty)}
              className={`w-full py-2 rounded mt-2 ${
                cart.every(i => i.qty === i.kotQty)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800 text-white"
              }`}
            >
              Send to Kitchen
            </button>

            {/* KOT HISTORY */}
            {kots.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <h3 className="font-semibold text-sm mb-2">
                  KOT History
                </h3>

                {kots.map(kot => (
                  <div
                    key={kot.kotNo}
                    className="mb-3 rounded border bg-gray-50 p-2"
                  >
                    <div className="font-medium text-sm mb-1">
                      KOT {kot.kotNo} ({kot.status})
                    </div>
                    <ul className="text-xs ml-3">
                      {kot.items.map((it, idx) => (
                        <li key={idx}>
                          • {it.name} × {it.qty}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between font-bold border-t pt-3">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button className="w-full mt-4 bg-[#ff4d4d] text-white py-3 rounded">
              Checkout
            </button>

            <button
              onClick={() => navigate("/tables")}
              className="w-full mt-2 border py-2 rounded"
            >
              Back
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const CategoryTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1 rounded-full text-sm border ${
      active
        ? "bg-[#ff4d4d] text-white border-[#ff4d4d]"
        : "bg-gray-100"
    }`}
  >
    {label}
  </button>
);

export default OrderPage;
