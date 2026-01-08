import { useEffect, useMemo, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import KotPrint from "../Kitchen/Kot/KotPrint";
import BillPrint from "../Order/BillPrint";

/* ================= PRINT HELPER ================= */
const printElement = (id, title) => {
  const el = document.getElementById(id);
  if (!el) return toast.warn(`${title} not ready`);

  const win = window.open("", "_blank", "width=300,height=600");
  if (!win) return toast.warn("Popup blocked");

  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>body{font-family:monospace;padding:10px}</style>
      </head>
      <body>${el.innerHTML}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
};

const CounterPOS = () => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [variantItem, setVariantItem] = useState(null);
  const [taxPercent, setTaxPercent] = useState(0);
  const [showCreditModal, setShowCreditModal] = useState(false);
const [customerPhone, setCustomerPhone] = useState("");
const [customerName, setCustomerName] = useState("");
const [customer, setCustomer] = useState(null);
const [loadingCustomer, setLoadingCustomer] = useState(false);
const [discount, setDiscount] = useState(0);


const orderType = "counter";
  /* ================= LOAD MENU ================= */
  useEffect(() => {
    apiClient.get("/menu").then((res) => {
      setMenu(res.data || []);
      setCategories([
        ...new Set(
          res.data
            .map((i) => i.category?.name || i.category)
            .filter(Boolean)
        ),
      ]);
    });
  }, []);

  const filteredMenu =
    activeCat === "all"
      ? menu
      : menu.filter(
          (i) => (i.category?.name || i.category) === activeCat
        );

  /* ================= CART ================= */
  const addItem = (item, unit) => {
    const key = `${item._id}_${unit.name}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [
        ...prev,
        {
          key,
          menuItemId: item._id,
          name: item.name,
          price:
            item.portionType?.pricingRule === "percentage"
              ? (item.price * unit.value) / 100
              : unit.value,
          unit,
          qty: 1,
        },
      ];
    });
  };

  const changeQty = (key, diff) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.key === key ? { ...i, qty: i.qty + diff } : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart]
  );
const taxAmount = useMemo(
  () => Number(((subtotal * taxPercent) / 100).toFixed(2)),
  [subtotal, taxPercent]
);

const finalTotal = useMemo(
  () => Math.max(0, subtotal + taxAmount - discount),
  [subtotal, taxAmount, discount]
);


  /* ================= PAY & PRINT ================= */
  const payAndPrint = async () => {
  if (cart.length === 0) return toast.info("Cart is empty");

  try {
   const res = await apiClient.post("/orders/counter", {
  orderType,
  items: cart.map(i => ({
    menuItemId: i.menuItemId,
    name: i.name,
    price: i.price,
    qty: i.qty,
    variant: i.unit.name,
  })),
  taxPercent,
  discount,
  paymentMethod: "cash",
});


    const ord = res.data.order;
    setOrder(ord);

    toast.success("Payment successful");

    setTimeout(() => printElement("counter-kot", "KOT"), 400);
    setTimeout(() => printElement("counter-bill", "Bill"), 1200);

    setTimeout(() => {
      setCart([]);
      setOrder(null);
    }, 2000);
  } catch (err) {
    toast.error("Payment failed");
  }
};


  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="grid grid-cols-12 gap-4 h-full">

        {/* MENU */}
        <div className="col-span-8 bg-white rounded-xl p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4">Counter POS</h2>

          <div className="flex gap-2 mb-4 flex-wrap">
            <CategoryTab
              label="All"
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
            />
            {categories.map((c) => (
              <CategoryTab
                key={c}
                label={c}
                active={activeCat === c}
                onClick={() => setActiveCat(c)}
              />
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {filteredMenu.map((item) => (
              <div
                key={item._id}
                className="border rounded-xl p-3 cursor-pointer hover:shadow"
                onClick={() => {
                  const portion = item.portionType;
                  if (!portion || !portion.units?.length) {
                    toast.error("Portion config missing");
                    return;
                  }

                  if (portion.units.length === 1) {
                    addItem(item, portion.units[0]);
                  } else {
                    setVariantItem(item);
                  }
                }}
              >
                {item.image ? (
                  <img
                    src={`${process.env.REACT_APP_IMAGE_URL}${item.image}`}
                    alt={item.name}
                    className="h-24 w-full object-cover rounded mb-2"
                  />
                ) : (
                  <div className="h-24 bg-gray-100 rounded mb-2 flex items-center justify-center text-xs">
                    No Image
                  </div>
                )}
                <div className="font-medium">{item.name}</div>
                <div className="text-red-500">₹{item.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CART */}
        <div className="col-span-4 bg-white rounded-xl p-4 flex flex-col">
          <h3 className="font-semibold mb-3">Bill</h3>

          <div className="flex-1 overflow-y-auto">
            {cart.map((i) => (
              <div key={i.key} className="flex justify-between mb-2">
                <div>
                  <div>{i.name}</div>
                  <div className="text-xs text-gray-500">
                    {i.unit.name} × {i.qty}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Minus size={14} onClick={() => changeQty(i.key, -1)} />
					<span>{i.qty}</span>
                  <Plus size={14} onClick={() => changeQty(i.key, 1)} />
                  <Trash2
                    size={14}
                    onClick={() => changeQty(i.key, -i.qty)}
                  />
                </div>
              </div>
            ))}
          </div>

        <div className="mt-6 p-4 border rounded-lg bg-gray-50 space-y-3">

  <div className="text-sm font-semibold border-b pb-2">
    Bill Summary
  </div>

  {/* SUBTOTAL */}
  <div className="flex justify-between text-sm">
    <span>Subtotal</span>
    <span>₹{subtotal}</span>
  </div>

  {/* GST */}
  <div className="flex items-center gap-2 text-sm">
    <label className="w-16">GST (%)</label>
    <input
      type="number"
      min="0"
      value={taxPercent}
      onChange={(e) => setTaxPercent(Number(e.target.value || 0))}
      className="w-20 p-1 border rounded"
    />
    <span className="ml-auto">₹{taxAmount}</span>
  </div>

  {/* DISCOUNT */}
  <div className="flex items-center gap-2 text-sm">
    <label className="w-16">Discount</label>
    <input
      type="number"
      min="0"
      value={discount}
      onChange={(e) => setDiscount(Number(e.target.value || 0))}
      className="w-20 p-1 border rounded"
    />
    <span className="ml-auto">-₹{discount}</span>
  </div>

  {/* TOTAL */}
  <div className="flex justify-between text-lg font-bold border-t pt-3">
    <span>Total</span>
    <span>₹{finalTotal}</span>
  </div>

  {/* PAY BUTTON */}
  <div className="flex flex-row gap-2">
  <button
    onClick={payAndPrint}
    className="w-full bg-red-500 text-white py-3 rounded text-lg mt-2"
  >
    Pay & Print
  </button>
  <button
  onClick={() => setShowCreditModal(true)}
  className="w-full bg-yellow-500 text-white py-3 rounded text-lg mt-2"
>
  Pay Later (Credit)
</button>
</div>
</div>


        </div>
      </div>

      {/* 🔥 VARIANT MODAL */}
      {variantItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[320px] rounded-xl p-4">
            <h3 className="font-semibold mb-3">
              Select {variantItem.name}
            </h3>

            <div className="space-y-2">
              {variantItem.portionType.units.map((unit) => (
                <button
                  key={unit._id || unit.name}
                  onClick={() => {
                    addItem(variantItem, unit);
                    setVariantItem(null);
                  }}
                  className="w-full flex justify-between border rounded-lg px-3 py-2 hover:bg-gray-100"
                >
                  <span>{unit.name}</span>
                  <span className="font-medium">
                    ₹
                    {variantItem.portionType.pricingRule === "percentage"
                      ? (variantItem.price * unit.value) / 100
                      : unit.value}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setVariantItem(null)}
              className="mt-3 w-full text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
     {showCreditModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-[360px] rounded-xl p-4">
      <h3 className="font-semibold mb-3">Customer Details</h3>

      {/* PHONE */}
      <input
        type="text"
        placeholder="Customer Phone"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        className="w-full border p-2 rounded mb-2"
      />

      <button
        onClick={async () => {
          if (!customerPhone) return toast.error("Phone required");

          setLoadingCustomer(true);
          try {
            const res = await apiClient.get(`/customers/by-phone/${customerPhone}`);
            setCustomer(res.data);
            setCustomerName(res.data.name);
            toast.success("Customer found");
          } catch {
            toast.info("New customer");
            setCustomer(null);
          }
          setLoadingCustomer(false);
        }}
        className="w-full bg-gray-800 text-white py-2 rounded mb-2"
      >
        {loadingCustomer ? "Checking..." : "Check Customer"}
      </button>

      {/* NAME (only for new customer) */}
      {!customer && (
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />
      )}

      {/* SAVE CREDIT */}
      <button
        onClick={async () => {
          if (!customerName) return toast.error("Name required");

          try {
            const res = await apiClient.post("/orders/counter/credit", {
              orderType: "counter",
              customer: {
                phone: customerPhone,
                name: customerName,
              },
              items: cart.map(i => ({
                menuItemId: i.menuItemId,
                name: i.name,
                price: i.price,
                qty: i.qty,
                variant: i.unit.name,
              })),
              taxPercent,
              discount,
            });

            setOrder(res.data.order);
            toast.success("Credit order saved");

            setTimeout(() => printElement("counter-kot", "KOT"), 400);
            setTimeout(() => printElement("counter-bill", "Bill"), 1200);

            setTimeout(() => {
              setCart([]);
              setOrder(null);
            }, 2000);

            setShowCreditModal(false);
          } catch (err) {
            toast.error("Failed to save credit");
          }
        }}
        className="w-full bg-yellow-500 text-white py-3 rounded"
      >
        Save as Credit
      </button>

      <button
        onClick={() => setShowCreditModal(false)}
        className="w-full mt-2 text-sm text-gray-500"
      >
        Cancel
      </button>
    </div>
  </div>
)}

      {/* 🔥 HIDDEN PRINT */}
      <div style={{ display: "none" }}>
        {order?.kots?.[0] && (
          <div id="counter-kot">
            <KotPrint kot={order.kots[0]} order={order} />
          </div>
        )}
        {order && (
          <div id="counter-bill">
            <BillPrint order={order} />
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1 rounded-full ${
      active ? "bg-red-500 text-white" : "bg-gray-100"
    }`}
  >
    {label}
  </button>
);

export default CounterPOS;
