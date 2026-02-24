import { useEffect, useMemo, useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import KotPrint from "../Kitchen/Kot/KotPrint";
import { useSearchParams } from "react-router-dom";
import MenuCard from "./MenuCard";
import VariantModal from "../MenuItemManaement/VariantModal";
import BillPrint from "../Order/BillPrint";
import CustomerForm from "../CategoryManagement/Customers/CustomerForm";
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
  const [params] = useSearchParams();
const searchQuery = (params.get("q") || "").toLowerCase();

  const [variantItem, setVariantItem] = useState(null);
  const [taxPercent, setTaxPercent] = useState(0);
  const [showCreditModal, setShowCreditModal] = useState(false);
const [discount, setDiscount] = useState(0);
const [billMeta, setBillMeta] = useState(null);

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


const filteredMenu = menu.filter((item) => {
  const itemName = (item.name || "").toLowerCase();
  const categoryName =
    (item.category?.name || item.category || "").toLowerCase();

  const matchesCategoryTab =
    activeCat === "all" ||
    categoryName === activeCat.toLowerCase();

  const matchesSearch =
    !searchQuery ||
    itemName.includes(searchQuery) ||
    categoryName.includes(searchQuery);

  return matchesCategoryTab && matchesSearch;
});

useEffect(() => {
  if (!searchQuery) {
    setActiveCat("all");
    return;
  }

  const matchedCategory = categories.find((cat) =>
    cat.toLowerCase().includes(searchQuery)
  );

  if (matchedCategory) {
    setActiveCat(matchedCategory);
  } else {
    setActiveCat("all");
  }
}, [searchQuery, categories]);

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
    <div className="h-[calc(100vh-64px)] bg-gray-50 p-2 sm:p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 h-full">

        {/* MENU */}
        <div className="md:col-span-8 col-span-1 bg-white rounded-xl p-2 sm:p-4 overflow-y-auto">
          <h2 className="font-semibold mb-2 text-base sm:text-lg">Counter POS</h2>

          <div className="flex gap-1 sm:gap-2 mb-2 sm:mb-4 flex-wrap">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
            {filteredMenu.map((item) => {
              // Calculate total quantity in cart for this item
              const totalQty = cart
                .filter((i) => i.menuItemId === item._id)
                .reduce((sum, i) => sum + i.qty, 0);
              return (
                <MenuCard
                  key={item._id}
                  item={item}
                  totalQty={totalQty}
                  onPress={() => {
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
                  onIncrease={() => {
                    const portion = item.portionType;
                    if (!portion || !portion.units?.length) return;
                    if (portion.units.length === 1) {
                      addItem(item, portion.units[0]);
                    } else {
                      setVariantItem(item);
                    }
                  }}
                  onDecrease={() => {
                    // Decrease qty for the first unit (if only one unit)
                    const portion = item.portionType;
                    if (!portion || !portion.units?.length) return;
                    if (portion.units.length === 1) {
                      const key = `${item._id}_${portion.units[0].name}`;
                      changeQty(key, -1);
                    } else {
                      setVariantItem(item);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* CART */}
        <div className="md:col-span-4 col-span-1 bg-white rounded-xl p-2 sm:p-4 flex flex-col mt-2 md:mt-0">
          <h3 className="font-semibold mb-2 text-base sm:text-lg">Bill</h3>

          <div className="flex-1 overflow-y-auto">
            {cart.map((i) => (
              <div key={i.key} className="flex justify-between mb-1 sm:mb-2">
                <div>
                  <div className="text-xs sm:text-sm">{i.name}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    {i.unit.name} × {i.qty}
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Minus size={12} onClick={() => changeQty(i.key, -1)} />
				<span className="text-xs sm:text-base">{i.qty}</span>
                  <Plus size={12} onClick={() => changeQty(i.key, 1)} />
                  <Trash2
                    size={12}
                    onClick={() => changeQty(i.key, -i.qty)}
                  />
                </div>
              </div>
            ))}
          </div>

        <div className="mt-4 sm:mt-6 p-2 sm:p-4 border rounded-lg bg-gray-50 space-y-2 sm:space-y-3">

  <div className="text-xs sm:text-sm font-semibold border-b pb-1 sm:pb-2">
    Bill Summary
  </div>

  {/* SUBTOTAL */}
  <div className="flex justify-between text-xs sm:text-sm">
    <span>Subtotal</span>
    <span>₹{subtotal}</span>
  </div>

  {/* GST */}
  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
    <label className="w-12 sm:w-16">GST (%)</label>
    <input
      type="number"
      min="0"
      value={taxPercent}
      onChange={(e) => setTaxPercent(Number(e.target.value || 0))}
      className="w-12 sm:w-20 p-1 border rounded"
    />
    <span className="ml-auto">₹{taxAmount}</span>
  </div>

  {/* DISCOUNT */}
  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
    <label className="w-12 sm:w-16">Discount</label>
    <input
      type="number"
      min="0"
      value={discount}
      onChange={(e) => setDiscount(Number(e.target.value || 0))}
      className="w-12 sm:w-20 p-1 border rounded"
    />
    <span className="ml-auto">-₹{discount}</span>
  </div>

  {/* TOTAL */}
  <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-2 sm:pt-3">
    <span>Total</span>
    <span>₹{finalTotal}</span>
  </div>

  {/* PAY BUTTON */}
  <div className="flex flex-row gap-1 sm:gap-2">
  <button
    onClick={payAndPrint}
    className="w-full bg-red-500 text-white py-2 sm:py-3 rounded text-sm sm:text-lg mt-1 sm:mt-2"
  >
    Pay & Print
  </button>
  <button
  onClick={() => {
    if (!cart.length) {
      toast.info("Cart is empty");
      return;
    }
    setShowCreditModal(true);
  }}
  className="w-full bg-yellow-500 text-white py-2 sm:py-3 rounded text-sm sm:text-lg mt-1 sm:mt-2"
>
  Pay Later (Credit)
</button>

</div>
</div>


        </div>
      </div>

      {/* 🔥 VARIANT MODAL (shared) */}
      {variantItem && (
        <VariantModal
          item={variantItem}
          cart={cart}
          onQtyChange={(item, unit, diff) => {
            const key = `${item._id}_${unit.name}`;
            if (diff > 0) {
              addItem(item, unit);
            } else {
              changeQty(key, diff);
            }
          }}
          onClose={() => setVariantItem(null)}
        />
      )}
    {showCreditModal && (
  <CustomerForm
    mode="counter"
    close={() => setShowCreditModal(false)}
    onDone={async ({ name, phone }) => {
      try {
        // 1. Lookup customer by phone
        let customerId = null;
        let customerRes = await apiClient.get(`/by-phone/${phone}`);
        if (customerRes.data && customerRes.data._id) {
          customerId = customerRes.data._id;
        } else {
          // 2. Create customer if not found
          const createRes = await apiClient.post("/customers", { name, phone });
          customerId = createRes.data._id;
        }
        // 3. Post order with customerId
        const res = await apiClient.post("/orders/counter/credit", {
          customerId,
          items: cart.map((i) => ({
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
        setBillMeta(res.data.billMeta);
        toast.success("Credit order saved");
        setShowCreditModal(false);
        setTimeout(() => printElement("counter-kot", "KOT"), 400);
        setTimeout(() => printElement("counter-bill", "Bill"), 1200);
        setTimeout(() => {
          setCart([]);
          setOrder(null);
          setBillMeta(null);
        }, 2000);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to save credit"
        );
      }
    }}
  />
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
            <BillPrint order={order} billMeta={billMeta}/>
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
